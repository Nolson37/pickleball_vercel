import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { prisma } from "@/lib/prisma"

// Get tracer for authentication flows
const tracer = trace.getTracer('auth-flow', '1.0.0')

// Define validation schema for credentials
const credentialsSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  remember: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        if (val.toLowerCase() === 'true') return true;
        if (val.toLowerCase() === 'false') return false;
      }
      return val;
    },
    z.boolean().optional()
  ),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days by default
  },
  debug: process.env.NODE_ENV === 'development',
  // Configure cookies for proper CSRF protection
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production" ? true : false
      }
    }
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add basic user context to the token
      if (user) {
        token.userId = user.id
        // Note: Organization context will be loaded in session callback or on pages
        // that need it, since JWT callback runs in Edge Runtime which doesn't support Prisma
      }
      
      console.log("JWT Callback Token:", token);
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string
        session.user.organizationId = token.organizationId as string
        session.user.organizationName = token.organizationName as string
        session.user.organizationSlug = token.organizationSlug as string
        session.user.roles = token.roles as string[]
      }
      console.log("Session Callback Session:", session);
      console.log("Session Callback Token:", token);
      return session
    },
    authorized({ auth, request }) {
      // Implement route protection based on authentication and organization context
      const { pathname } = request.nextUrl || {}
      
      // Always allow access to authentication routes
      if (pathname?.startsWith("/auth/")) return true
      
      // Allow access to marketing pages
      if (pathname === "/" || pathname?.startsWith("/marketing")) return true
      
      // Require authentication for all other routes
      return !!auth?.user
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember Me", type: "boolean" },
      },
      async authorize(credentials) {
        console.log("[AUTH_DEBUG] Authorize function called with credentials:", credentials);
        
        // Create a span for the authorization attempt
        return tracer.startActiveSpan('auth-authorize', async (span) => {
          try {
            // Validate credentials
            const { email, password, remember } = credentialsSchema.parse(credentials)
            console.log("[AUTH_DEBUG] Credentials parsed:", { email, remember });
            
            // Add span attributes for context
            span.setAttributes({
              'auth.email': email,
              'auth.remember': remember,
              'auth.type': 'credentials',
            })
            
            // Find user by email
            const user = await prisma.user.findUnique({
              where: { email },
            })
            console.log("[AUTH_DEBUG] User found in DB:", user ? { id: user.id, email: user.email, hasPasswordHash: !!user.passwordHash } : null);
            
            // Check if user exists and password is correct
            if (!user || !user.passwordHash) {
              console.log("[AUTH_DEBUG] User not found or no password hash.");
              span.setAttributes({
                'auth.success': false,
                'auth.failure_reason': !user ? 'user_not_found' : 'no_password_hash',
              })
              span.setStatus({ code: SpanStatusCode.ERROR, message: 'User not found or no password hash' })
              return null
            }
            
            span.setAttributes({
              'auth.user_id': user.id,
              'auth.user_verified': !!user.emailVerified,
            })
            
            console.log("[AUTH_DEBUG] Comparing password for user:", user.email);
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
            console.log("[AUTH_DEBUG] Password valid:", isPasswordValid);
            
            if (!isPasswordValid) {
              console.log("[AUTH_DEBUG] Password comparison failed.");
              span.setAttributes({
                'auth.success': false,
                'auth.failure_reason': 'invalid_password',
              })
              span.setStatus({ code: SpanStatusCode.ERROR, message: 'Invalid password' })
              return null
            }
            
            // Check if email is verified (emailVerified is a DateTime? in the schema)
            // In development mode, we'll bypass this check
            console.log("[AUTH_DEBUG] Checking email verification. User verified:", user.emailVerified, "NODE_ENV:", process.env.NODE_ENV);
            if (!user.emailVerified && process.env.NODE_ENV === 'production') {
              console.log("[AUTH_DEBUG] Email not verified in production. Throwing error.");
              span.setAttributes({
                'auth.success': false,
                'auth.failure_reason': 'email_not_verified',
              })
              span.setStatus({ code: SpanStatusCode.ERROR, message: 'Email not verified' })
              throw new Error("Email not verified. Please check your inbox.")
            }
            
            // Update lastLogin timestamp
            console.log("[AUTH_DEBUG] Updating lastLogin for user:", user.id);
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLogin: new Date() }
            })
            console.log("[AUTH_DEBUG] lastLogin updated.");
            
            // Return user object
            const userToReturn = {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.imageUrl,
            };
            console.log("[AUTH_DEBUG] Returning user object:", userToReturn);
            
            // Record successful authentication
            span.setAttributes({
              'auth.success': true,
              'auth.user_id': user.id,
              'auth.user_name': user.name || '',
            })
            span.setStatus({ code: SpanStatusCode.OK })
            
            return userToReturn
          } catch (error) {
            console.error("[AUTH_DEBUG] Authentication error in authorize function:", error);
            
            // Record and trace the exception
            span.recordException(error as Error)
            span.setAttributes({
              'auth.success': false,
              'auth.failure_reason': 'exception',
              'error.type': error instanceof z.ZodError ? 'validation_error' : 'unknown_error',
            })
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: (error as Error).message
            })
            
            if (error instanceof z.ZodError) {
              console.error("[AUTH_DEBUG] Zod validation errors:", error.errors);
              span.setAttributes({
                'validation.errors': JSON.stringify(error.errors),
              })
            }
            return null
          } finally {
            span.end()
          }
        })
      },
    }),
  ],
})

// Extend the session type to include our custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      organizationId?: string
      organizationName?: string
      organizationSlug?: string
      roles?: string[]
    }
  }
  
  interface JWT {
    userId: string
    organizationId?: string
    organizationName?: string
    organizationSlug?: string
    roles?: string[]
    remember?: boolean
  }
}
