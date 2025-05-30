import { NextRequest, NextResponse } from "next/server"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { prisma } from "@/lib/prisma"

// Get tracer for email verification flows
const tracer = trace.getTracer('api-auth', '1.0.0')

export async function GET(request: NextRequest) {
  return tracer.startActiveSpan('api-verify', async (span) => {
    try {
      // Add basic request attributes
      span.setAttributes({
        'http.method': 'GET',
        'http.url': request.url,
        'request.type': 'email_verification',
        'operation.name': 'verify_user_email'
      })
      
      // Get token from query parameters
      const searchParams = request.nextUrl.searchParams
      const token = searchParams.get("token")
      
      // Add token context to span (without exposing the actual token)
      span.setAttributes({
        'verification_token.provided': !!token,
        'verification_token.length': token?.length || 0
      })
      
      if (!token) {
        span.setAttributes({
          'email_verification.success': false,
          'email_verification.failure_reason': 'missing_token',
          'http.status_code': 400
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Verification token is required' })
        
        return NextResponse.json(
          { error: "Verification token is required" },
          { status: 400 }
        )
      }
      
      // Find the verification token in the database
      const verificationRecord = await prisma.verificationToken.findUnique({
        where: { token },
      })
      
      if (!verificationRecord) {
        span.setAttributes({
          'email_verification.success': false,
          'email_verification.failure_reason': 'invalid_token',
          'database.token_found': false,
          'http.status_code': 400
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Invalid verification token' })
        
        return NextResponse.json(
          { error: "Invalid verification token" },
          { status: 400 }
        )
      }
      
      // Add verification record context
      span.setAttributes({
        'database.token_found': true,
        'user.email': verificationRecord.email,
        'verification_token.expires': verificationRecord.expires.toISOString()
      })
      
      // Check if token has expired
      if (new Date() > verificationRecord.expires) {
        span.setAttributes({
          'email_verification.success': false,
          'email_verification.failure_reason': 'token_expired',
          'verification_token.expired': true,
          'http.status_code': 400
        })
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Verification token has expired' })
        
        return NextResponse.json(
          { error: "Verification token has expired" },
          { status: 400 }
        )
      }
      
      // Add token validity context
      span.setAttributes({
        'verification_token.expired': false,
        'verification_token.valid': true
      })
      
      // Find the user by email
      const user = await prisma.user.findUnique({
        where: { email: verificationRecord.email },
      })
      
      if (!user) {
        span.setAttributes({
          'email_verification.success': false,
          'email_verification.failure_reason': 'user_not_found',
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
        'user.verified_before': !!user.emailVerified
      })
      
      // Update user's email verification status
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      })
      
      // Add verification update context
      span.setAttributes({
        'database.user_verified': true,
        'user.verified_after': true
      })
      
      // Delete the verification token
      await prisma.verificationToken.delete({
        where: { id: verificationRecord.id },
      })
      
      // Add token cleanup context
      span.setAttributes({
        'database.token_deleted': true,
        'email_verification.success': true,
        'http.status_code': 302,
        'redirect.target': '/auth/verification-success'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      
      // Redirect to the verification success page
      return NextResponse.redirect(new URL("/auth/verification-success", request.url))
    } catch (error) {
      console.error("Email verification error:", error)
      
      // Record and trace the exception
      span.recordException(error as Error)
      span.setAttributes({
        'email_verification.success': false,
        'email_verification.failure_reason': 'internal_error',
        'error.type': 'verification_error',
        'http.status_code': 500
      })
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message
      })
      
      // Handle other errors
      return NextResponse.json(
        { error: "Email verification failed. Please try again." },
        { status: 500 }
      )
    } finally {
      span.end()
    }
  })
}