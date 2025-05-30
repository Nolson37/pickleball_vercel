import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  PASSWORD_CRITERIA,
  hasUppercase,
  hasLowercase,
  hasNumber,
  hasSpecialChar
} from "@/lib/password-validation"

// Get tracer for password change flows
const tracer = trace.getTracer('api-auth', '1.0.0')

// Password validation schema
const passwordSchema = z.string()
  .min(PASSWORD_CRITERIA.MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD_CRITERIA.MIN_LENGTH} characters.`
  })
  .refine(
    (password) => hasUppercase(password),
    { message: "Password must contain at least one uppercase letter." }
  )
  .refine(
    (password) => hasLowercase(password),
    { message: "Password must contain at least one lowercase letter." }
  )
  .refine(
    (password) => hasNumber(password),
    { message: "Password must contain at least one number." }
  )
  .refine(
    (password) => hasSpecialChar(password),
    { message: "Password must contain at least one special character." }
  )

// Define validation schema for password change
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, {
    message: "Current password is required.",
  }),
  newPassword: passwordSchema,
})

// Handler function for password change
async function changePasswordHandler(request: NextRequest) {
  return tracer.startActiveSpan('api-change-password', async (span) => {
    try {
      // Add basic request attributes
      span.setAttributes({
        'http.method': 'POST',
        'http.url': request.url,
        'request.type': 'password_change',
        'operation.name': 'change_user_password'
      })
      
      // Get the current user from the session
      const session = await auth()
      
      if (!session?.user) {
        span.setAttributes({
          'password_change.success': false,
          'password_change.failure_reason': 'unauthorized',
          'http.status_code': 401
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Unauthorized' })
        
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }
      
      // Add user context to span
      span.setAttributes({
        'user.id': session.user.id,
        'user.email': session.user.email || '',
        'user.authenticated': true
      })
      
      // Parse request body
      const body = await request.json()
      
      // Validate request body
      const { currentPassword, newPassword } = passwordChangeSchema.parse(body)
      
      // Get the user from the database
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      })
      
      if (!user || !user.passwordHash) {
        span.setAttributes({
          'password_change.success': false,
          'password_change.failure_reason': !user ? 'user_not_found' : 'no_password_hash',
          'http.status_code': 404
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'User not found' })
        
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
      }
      
      // Add database user context
      span.setAttributes({
        'database.user_found': true,
        'user.has_password_hash': !!user.passwordHash
      })
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
      
      if (!isPasswordValid) {
        span.setAttributes({
          'password_change.success': false,
          'password_change.failure_reason': 'invalid_current_password',
          'password_verification.success': false,
          'http.status_code': 400
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Current password is incorrect' })
        
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        )
      }
      
      // Add successful password verification
      span.setAttributes({
        'password_verification.success': true
      })
      
      // Hash the new password
      const saltRounds = 10
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)
      
      // Update the user's password
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      })
      
      // Add successful password update
      span.setAttributes({
        'password_change.success': true,
        'database.password_updated': true,
        'http.status_code': 200
      })
      span.setStatus({ code: SpanStatusCode.OK })
      
      // Return success response
      return NextResponse.json(
        { success: true, message: "Password has been changed successfully." },
        { status: 200 }
      )
    } catch (error) {
      console.error("Password change error:", error)
      
      // Record and trace the exception
      span.recordException(error as Error)
      span.setAttributes({
        'password_change.success': false,
        'error.type': error instanceof z.ZodError ? 'validation_error' : 'password_change_error'
      })
      
      // Handle validation errors
      if (error instanceof z.ZodError) {
        span.setAttributes({
          'password_change.failure_reason': 'validation_error',
          'validation.errors': JSON.stringify(error.errors),
          'http.status_code': 400
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Validation error' })
        
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 }
        )
      }
      
      // Handle other errors
      span.setAttributes({
        'password_change.failure_reason': 'internal_error',
        'http.status_code': 500
      })
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message
      })
      
      return NextResponse.json(
        { error: "Failed to change password. Please try again." },
        { status: 500 }
      )
    } finally {
      span.end()
    }
  })
}

// Export the handler as a proper Next.js route handler
export async function POST(request: NextRequest) {
  return changePasswordHandler(request)
}
