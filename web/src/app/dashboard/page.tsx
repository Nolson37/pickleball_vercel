import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome"

// Get tracer for dashboard pages
const tracer = trace.getTracer('page-dashboard', '1.0.0')

export default async function DashboardPage() {
  return tracer.startActiveSpan('page-dashboard', async (span) => {
    try {
      // Add page attributes
      span.setAttributes({
        'page.route': '/dashboard',
        'page.title': 'Dashboard',
        'page.type': 'dashboard'
      })

      const session = await auth()
      const user = session?.user
      
      // Add authentication context
      span.setAttributes({
        'user.authenticated': !!user,
        'user.id': user?.id || 'anonymous',
        'user.organization': user?.organizationName || 'unknown'
      })
      
      // Get the full user record to check onboarding status
      const fullUser = user ? await tracer.startActiveSpan('database-user-lookup', async (dbSpan) => {
        try {
          dbSpan.setAttributes({
            'database.operation': 'findUnique',
            'database.table': 'user',
            'query.user_id': user.id
          })
          
          const result = await prisma.user.findUnique({
            where: { id: user.id },
            select: { onboardingComplete: true }
          })
          
          dbSpan.setAttributes({
            'database.query_success': true,
            'user.onboarding_complete': result?.onboardingComplete || false
          })
          dbSpan.setStatus({ code: SpanStatusCode.OK })
          
          return result
        } catch (error) {
          dbSpan.recordException(error as Error)
          dbSpan.setStatus({
            code: SpanStatusCode.ERROR,
            message: (error as Error).message
          })
          throw error
        } finally {
          dbSpan.end()
        }
      }) : null
      
      // Determine if we should show the welcome message
      const showWelcome = fullUser && !fullUser.onboardingComplete
      
      // Add UI state attributes
      span.setAttributes({
        'ui.welcome_shown': !!showWelcome,
        'user.onboarding_complete': fullUser?.onboardingComplete || false,
        'page.render_success': true
      })
      
      span.setStatus({ code: SpanStatusCode.OK })
  
      return (
        <div className="space-y-6">
          {/* Welcome message for new users */}
          {showWelcome && (
            <DashboardWelcome
              userName={user?.name}
              organizationName={user?.organizationName}
            />
          )}
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your Pickleball Facility Owner dashboard.
            </p>
          </div>
          
          {/* Dashboard Overview */}
          <DashboardOverview user={user || null} />
        </div>
      )
    } catch (error) {
      // Record and trace the exception
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message
      })
      span.setAttributes({
        'page.render_success': false,
        'error.type': 'page_render_error'
      })
      throw error
    } finally {
      span.end()
    }
  })
}