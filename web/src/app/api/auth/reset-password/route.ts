import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { prisma } from "@/lib/prisma"
import {
  PASSWORD_CRITERIA,
  hasUppercase,
  hasLowercase,
  hasNumber,
  hasSpecialChar
} from "@/lib/password-validation"

// Get tracer for password reset flows
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

// Define validation schema for reset password
const resetPasswordSchema = z.object({
  token: z.string().min(1, {
    message: "Reset token is required.",
  }),
  password: passwordSchema,
})

export async function POST(request: NextRequest) {
  return tracer.startActiveSpan('api-reset-password', async (span) => {
    try {
      // Add basic request attributes
      span.setAttributes({
        'http.method': 'POST',
        'http.url': request.url,
        'request.type': 'password_reset_completion',
        'operation.name': 'complete_password_reset'
      })
      
      // Parse request body
      const body = await request.json()
      
      // Validate request body
      const { token, password } = resetPasswordSchema.parse(body)
      
      // Add token context to span (without exposing the actual token)
      span.setAttributes({
        'reset_token.provided': !!token,
        'reset_token.length': token?.length || 0
      })
      
      // Find the password reset token in the database
      const resetRecord = await prisma.passwordResetToken.findUnique({
        where: { token },
      })
      
      if (!resetRecord) {
        span.setAttributes({
          'password_reset.success': false,
          'password_reset.failure_reason': 'invalid_token',
          'database.token_found': false,
          'http.status_code': 400
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Invalid or expired reset token' })
        
        return NextResponse.json(
          { error: "Invalid or expired reset token" },
          { status: 400 }
        )
      }
      
      // Add token record context
      span.setAttributes({
        'database.token_found': true,
        'user.email': resetRecord.email,
        'reset_token.expires': resetRecord.expires.toISOString()
      })
      
      // Check if token has expired
      if (new Date() > resetRecord.expires) {
        span.setAttributes({
          'password_reset.success': false,
          'password_reset.failure_reason': 'token_expired',
          'reset_token.expired': true,
          'http.status_code': 400
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Reset token has expired' })
        
        return NextResponse.json(
          { error: "Reset token has expired" },
          { status: 400 }
        )
      }
      
      // Add token validity context
      span.setAttributes({
        'reset_token.expired': false,
        'reset_token.valid': true
      })
      
      // Find the user by email
      const user = await prisma.user.findUnique({
        where: { email: resetRecord.email },
      })
      
      if (!user) {
        span.setAttributes({
          'password_reset.success': false,
          'password_reset.failure_reason': 'user_not_found',
          'database.user_found': false,
          'http.status_code': 404
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'User not found' })
        
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
      }
      
      // Add user context
      span.setAttributes({
        'database.user_found': true,
        'user.id': user.id,
        'user.verified_before_reset': !!user.emailVerified
      })
      
      // Hash the new password
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(password, saltRounds)
      
      // Update user's password
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          // Set email as verified if it's not already
          emailVerified: true
        },
      })
      
      // Add password update context
      span.setAttributes({
        'database.password_updated': true,
        'user.email_verified_after_reset': true
      })
      
      // Delete the password reset token
      await prisma.passwordResetToken.delete({
        where: { id: resetRecord.id },
      })
      
      // Add token cleanup context
      span.setAttributes({
        'database.token_deleted': true,
        'password_reset.success': true,
        'http.status_code': 200
      })
      span.setStatus({ code: SpanStatusCode.OK })
      
      // Return success response
      return NextResponse.json(
        { success: true, message: "Password has been reset successfully." },
        { status: 200 }
      )
    } catch (error) {
      console.error("Reset password error:", error)
      
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
        { error: "Failed to reset password. Please try again." },
        { status: 500 }
      )
    } finally {
      span.end()
    }
  })
}