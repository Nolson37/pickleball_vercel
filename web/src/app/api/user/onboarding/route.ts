import { NextResponse } from "next/server"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// Get tracer for user management flows
const tracer = trace.getTracer('api-user', '1.0.0')

export async function POST() {
  return tracer.startActiveSpan('api-onboarding', async (span) => {
    try {
      // Add basic request attributes
      span.setAttributes({
        'http.method': 'POST',
        'request.type': 'user_onboarding',
        'operation.name': 'complete_user_onboarding'
      })
      
      const session = await auth()
      
      // Check if user is authenticated
      if (!session?.user) {
        span.setAttributes({
          'onboarding.success': false,
          'onboarding.failure_reason': 'unauthorized',
          'user.authenticated': false,
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
        'user.authenticated': true,
        'user.id': session.user.id,
        'user.email': session.user.email || '',
        'user.organization_id': session.user.organizationId || ''
      })
      
      // Update the user's onboardingComplete status
      await prisma.user.update({
        where: { id: session.user.id },
        data: { onboardingComplete: true }
      })
      
      // Add successful completion attributes
      span.setAttributes({
        'onboarding.success': true,
        'database.onboarding_updated': true,
        'user.onboarding_complete': true,
        'http.status_code': 200
      })
      span.setStatus({ code: SpanStatusCode.OK })
      
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error updating onboarding status:", error)
      
      // Record and trace the exception
      span.recordException(error as Error)
      span.setAttributes({
        'onboarding.success': false,
        'onboarding.failure_reason': 'internal_error',
        'error.type': 'onboarding_error',
        'http.status_code': 500
      })
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message
      })
      
      return NextResponse.json(
        { error: "Failed to update onboarding status" },
        { status: 500 }
      )
    } finally {
      span.end()
    }
  })
}
