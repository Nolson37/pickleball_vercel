import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import nodemailer from "nodemailer"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { prisma } from "@/lib/prisma"

// Get tracer for forgot password flows
const tracer = trace.getTracer('api-auth', '1.0.0')

// Define validation schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

// Helper function to send password reset email
async function sendPasswordResetEmail(email: string, token: string) {
  // Create a test account if no email configuration is provided
  const testAccount = await nodemailer.createTestAccount()

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || testAccount.smtp.host,
    port: parseInt(process.env.EMAIL_SERVER_PORT || testAccount.smtp.port.toString()),
    secure: process.env.EMAIL_SERVER_HOST ? true : testAccount.smtp.secure,
    auth: {
      user: process.env.EMAIL_SERVER_USER || testAccount.user,
      pass: process.env.EMAIL_SERVER_PASSWORD || testAccount.pass,
    },
  })

  // Reset URL
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@pickleballplatform.com",
    to: email,
    subject: "Reset your password",
    text: `You requested to reset your password. Please click on the following link to reset your password: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>You requested to reset your password. Please click on the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  }

  // Send email
  const info = await transporter.sendMail(mailOptions)
  
  // Log email URL for development (when using ethereal email)
  if (!process.env.EMAIL_SERVER_HOST) {
    console.log("Password reset email preview URL: %s", nodemailer.getTestMessageUrl(info))
  }
  
  return info
}

export async function POST(request: NextRequest) {
  return tracer.startActiveSpan('api-forgot-password', async (span) => {
    try {
      // Add basic request attributes
      span.setAttributes({
        'http.method': 'POST',
        'http.url': request.url,
        'request.type': 'password_reset_request',
        'operation.name': 'initiate_password_reset'
      })
      
      // Parse request body
      const body = await request.json()
      
      // Validate request body
      const { email } = forgotPasswordSchema.parse(body)
      
      // Add email context to span
      span.setAttributes({
        'user.email': email
      })
      
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
      })
      
      // Add user existence context
      span.setAttributes({
        'database.user_found': !!user,
        'user.exists': !!user
      })
      
      // If user doesn't exist, we still return a success response for security reasons
      // This prevents email enumeration attacks
      if (!user) {
        span.setAttributes({
          'password_reset.success': true,
          'password_reset.user_found': false,
          'password_reset.email_sent': false,
          'security.enumeration_protection': true,
          'http.status_code': 200
        })
        span.setStatus({ code: SpanStatusCode.OK })
        
        return NextResponse.json(
          { success: true, message: "If an account with this email exists, a password reset link has been sent." },
          { status: 200 }
        )
      }
      
      // Add user context to span
      span.setAttributes({
        'user.id': user.id,
        'user.verified': !!user.emailVerified
      })
      
      // Delete any existing password reset tokens for this user
      const deletedTokens = await prisma.passwordResetToken.deleteMany({
        where: { email },
      })
      
      // Add token cleanup context
      span.setAttributes({
        'database.tokens_cleaned': deletedTokens.count
      })
      
      // Generate password reset token
      const resetToken = crypto.randomBytes(32).toString("hex")
      const tokenExpiry = new Date()
      tokenExpiry.setHours(tokenExpiry.getHours() + 24) // Token expires in 24 hours
      
      // Save password reset token
      await prisma.passwordResetToken.create({
        data: {
          email,
          token: resetToken,
          expires: tokenExpiry,
        },
      })
      
      // Add token creation context
      span.setAttributes({
        'database.token_created': true,
        'reset_token.expires_in_hours': 24
      })
      
      // Send password reset email
      await sendPasswordResetEmail(email, resetToken)
      
      // Add successful completion attributes
      span.setAttributes({
        'password_reset.success': true,
        'password_reset.user_found': true,
        'password_reset.email_sent': true,
        'email.reset_sent': true,
        'http.status_code': 200
      })
      span.setStatus({ code: SpanStatusCode.OK })
      
      // Return success response
      return NextResponse.json(
        { success: true, message: "Password reset link has been sent to your email." },
        { status: 200 }
      )
    } catch (error) {
      console.error("Forgot password error:", error)
      
      // Record and trace the exception
      span.recordException(error as Error)
      span.setAttributes({
        'password_reset.success': false,
        'error.type': error instanceof z.ZodError ? 'validation_error' : 'password_reset_error'
      })
      
      // Handle validation errors
      if (error instanceof z.ZodError) {
        span.setAttributes({
          'password_reset.failure_reason': 'validation_error',
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
        'password_reset.failure_reason': 'internal_error',
        'http.status_code': 500
      })
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message
      })
      
      return NextResponse.json(
        { error: "Failed to send password reset email. Please try again." },
        { status: 500 }
      )
    } finally {
      span.end()
    }
  })
}