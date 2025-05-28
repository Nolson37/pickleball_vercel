import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { getPermissionUtils } from "@/lib/auth-utils"
import { PERMISSIONS } from "@/lib/rbac"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Get tracer for dashboard pages
const tracer = trace.getTracer('page-dashboard', '1.0.0')

export default async function NewFacilityPage() {
  return tracer.startActiveSpan('page-facilities-new', async (span) => {
    try {
      // Add page attributes
      span.setAttributes({
        'page.route': '/dashboard/facilities/new',
        'page.title': 'Add Facility',
        'page.type': 'dashboard',
        'page.section': 'facility_management',
        'page.action': 'create_facility'
      })

      const session = await tracer.startActiveSpan('auth-session-check', async (authSpan) => {
        try {
          const sessionResult = await auth()
          authSpan.setAttributes({
            'auth.session_exists': !!sessionResult,
            'user.authenticated': !!sessionResult?.user
          })
          authSpan.setStatus({ code: SpanStatusCode.OK })
          return sessionResult
        } catch (error) {
          authSpan.recordException(error as Error)
          authSpan.setStatus({
            code: SpanStatusCode.ERROR,
            message: (error as Error).message
          })
          throw error
        } finally {
          authSpan.end()
        }
      })

      const permissions = await tracer.startActiveSpan('permission-utils-check', async (permSpan) => {
        try {
          const permResult = await getPermissionUtils()
          permSpan.setAttributes({
            'permissions.loaded': true
          })
          permSpan.setStatus({ code: SpanStatusCode.OK })
          return permResult
        } catch (error) {
          permSpan.recordException(error as Error)
          permSpan.setStatus({
            code: SpanStatusCode.ERROR,
            message: (error as Error).message
          })
          throw error
        } finally {
          permSpan.end()
        }
      })
      
      // Redirect to login if not authenticated
      if (!session?.user) {
        span.setAttributes({
          'auth.redirect_required': true,
          'redirect.target': '/auth/signin?callbackUrl=/dashboard/facilities/new'
        })
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
        redirect("/auth/signin?callbackUrl=/dashboard/facilities/new")
      }

      // Add user context
      span.setAttributes({
        'user.id': session.user.id,
        'user.organization': session.user.organizationName || 'unknown'
      })
      
      // Check if user has permission to create facilities
      const hasFacilityCreatePermission = permissions.can(PERMISSIONS.FACILITY_CREATE)
      
      span.setAttributes({
        'permissions.facility_create': hasFacilityCreatePermission
      })

      if (!hasFacilityCreatePermission) {
        span.setAttributes({
          'access.denied': true,
          'error.type': 'permission_denied'
        })
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: 'User does not have FACILITY_CREATE permission'
        })
        span.end()
        
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Add Facility</h1>
              <p className="text-muted-foreground">
                Create a new pickleball facility.
              </p>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-red-700">
                You do not have permission to create facilities.
              </p>
            </div>
            
            <Button asChild>
              <Link href="/dashboard/facilities">Back to Facilities</Link>
            </Button>
          </div>
        )
      }

      // Add success attributes
      span.setAttributes({
        'page.render_success': true,
        'feature.status': 'coming_soon'
      })
      span.setStatus({ code: SpanStatusCode.OK })
  
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add Facility</h1>
            <p className="text-muted-foreground">
              Create a new pickleball facility.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Facility Information</CardTitle>
              <CardDescription>
                Enter the details for your new facility.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Facility Creation Form</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This feature will be available soon. Check back later!
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/dashboard/facilities">Cancel</Link>
              </Button>
              <Button disabled>Save Facility</Button>
            </CardFooter>
          </Card>
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