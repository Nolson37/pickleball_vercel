import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { getPermissionUtils } from "@/lib/auth-utils"
import { PERMISSIONS } from "@/lib/rbac"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Get tracer for dashboard pages
const tracer = trace.getTracer('page-dashboard', '1.0.0')

export default async function FacilitiesPage() {
  return tracer.startActiveSpan('page-facilities', async (span) => {
    try {
      // Add page attributes
      span.setAttributes({
        'page.route': '/dashboard/facilities',
        'page.title': 'Facilities',
        'page.type': 'dashboard',
        'page.section': 'facility_management'
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
      
      // In development mode, create a mock session if none exists
      let user = session?.user
      
      if (process.env.NODE_ENV === 'development' && !user) {
        // Create a mock user for development
        user = {
          id: 'dev-user-id',
          name: 'Development User',
          email: 'dev@example.com',
          organizationName: 'Development Organization',
          image: '',
        }
        span.setAttributes({
          'user.mock': true,
          'environment': 'development'
        })
      } else if (!session?.user) {
        // In production, redirect to login if not authenticated
        span.setAttributes({
          'auth.redirect_required': true,
          'redirect.target': '/auth/signin?callbackUrl=/dashboard/facilities'
        })
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
        redirect("/auth/signin?callbackUrl=/dashboard/facilities")
      }
      
      // At this point, user should always be defined
      if (!user) {
        // This is a fallback that should never happen, but satisfies TypeScript
        span.setAttributes({
          'auth.fallback_redirect': true,
          'redirect.target': '/auth/signin?callbackUrl=/dashboard/facilities'
        })
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
        redirect("/auth/signin?callbackUrl=/dashboard/facilities")
      }

      // Add user context
      span.setAttributes({
        'user.id': user.id,
        'user.organization': user.organizationName || 'unknown'
      })
      
      // In development mode with mock user, bypass permission check
      const hasFacilityViewPermission = (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') ||
        permissions.can(PERMISSIONS.FACILITY_VIEW)

      span.setAttributes({
        'permissions.facility_view': hasFacilityViewPermission
      })

      if (!hasFacilityViewPermission) {
        span.setAttributes({
          'access.denied': true,
          'error.type': 'permission_denied'
        })
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: 'User does not have FACILITY_VIEW permission'
        })
        span.end()
        
        return (
          <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Facilities</h1>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-red-700">
                You do not have permission to view facilities.
              </p>
            </div>
          </div>
        )
      }

      // Define organization type
      type Organization = {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
      }

      // For development mode with mock user, create a mock organization
      let organization: Organization | undefined;
      
      if (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') {
        // Create a mock organization for development
        organization = {
          id: 'dev-org-id',
          name: 'Development Organization',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Organization
        span.setAttributes({
          'organization.mock': true,
          'organization.id': organization.id,
          'organization.name': organization.name
        })
      } else {
        // Get the user's organizations from the database
        const userWithOrganizations = await tracer.startActiveSpan('database-organization-lookup', async (dbSpan) => {
          try {
            dbSpan.setAttributes({
              'database.operation': 'findUnique',
              'database.table': 'user',
              'query.user_id': user.id,
              'query.includes': 'organizations'
            })
            
            const result = await prisma.user.findUnique({
              where: { id: user.id },
              include: {
                organizations: {
                  include: {
                    organization: true,
                  },
                },
              },
            })
            
            dbSpan.setAttributes({
              'database.query_success': true,
              'organizations.count': result?.organizations.length || 0
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
        })
        
        // Get the default organization or the first one
        const userOrg = userWithOrganizations?.organizations.find(org => org.isDefault) ||
                        userWithOrganizations?.organizations[0]
        organization = userOrg?.organization

        if (organization) {
          span.setAttributes({
            'organization.id': organization.id,
            'organization.name': organization.name,
            'organization.is_default': !!userWithOrganizations?.organizations.find(org => org.isDefault && org.organization.id === organization!.id)
          })
        }
        
        if (!organization) {
          span.setAttributes({
            'organization.found': false,
            'error.type': 'no_organization'
          })
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: 'User not associated with any organization'
          })
          span.end()
          
          return (
            <div className="container mx-auto py-10">
              <h1 className="text-2xl font-bold mb-6">Facilities</h1>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-yellow-700">
                  You are not associated with any organization. Please contact support for assistance.
                </p>
              </div>
            </div>
          )
        }
      }
      
      // Define Facility type
      type Facility = {
        id: string;
        name: string;
        address: string | null;
        city: string | null;
        state: string | null;
        zipCode: string | null;
        phone: string | null;
        email: string | null;
      }
      
      // Define Facility type
      let facilities: Facility[] = [];
      
      // For development mode with mock user, create mock facilities
      if (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') {
        // Create mock facilities for development
        facilities = [
          {
            id: 'dev-facility-1',
            name: 'Downtown Pickleball Center',
            address: '123 Main Street',
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            phone: '(512) 555-1234',
            email: 'downtown@example.com',
          },
          {
            id: 'dev-facility-2',
            name: 'Westside Courts',
            address: '456 West Avenue',
            city: 'Austin',
            state: 'TX',
            zipCode: '78703',
            phone: '(512) 555-5678',
            email: 'westside@example.com',
          }
        ];
        span.setAttributes({
          'facilities.mock': true,
          'facilities.count': facilities.length
        })
      } else {
        // Get facilities for the organization from the database
        facilities = await tracer.startActiveSpan('database-facilities-lookup', async (dbSpan) => {
          try {
            dbSpan.setAttributes({
              'database.operation': 'findMany',
              'database.table': 'facility',
              'query.organization_id': organization.id
            })
            
            const result = await prisma.facility.findMany({
              where: {
                organizationId: organization.id,
              },
              orderBy: {
                name: "asc",
              },
            }) as Facility[];
            
            dbSpan.setAttributes({
              'database.query_success': true,
              'facilities.count': result.length
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
        })

        span.setAttributes({
          'facilities.count': facilities.length
        })
      }

      // Add permission context
      span.setAttributes({
        'permissions.facility_create': (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') || permissions.can(PERMISSIONS.FACILITY_CREATE),
        'permissions.facility_edit': (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') || permissions.can(PERMISSIONS.FACILITY_EDIT),
        'page.render_success': true
      })
      
      span.setStatus({ code: SpanStatusCode.OK })
      
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Facilities</h1>
              <p className="text-muted-foreground">
                Manage your pickleball facilities and courts.
              </p>
            </div>
            
            {((process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') ||
              permissions.can(PERMISSIONS.FACILITY_CREATE)) && (
              <Button asChild>
                <Link href="/dashboard/facilities/new">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Facility
                </Link>
              </Button>
            )}
          </div>
          
          {facilities.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Facilities</CardTitle>
                <CardDescription>
                  You haven&apos;t added any facilities yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get started by adding your first facility. You&apos;ll be able to manage courts, reservations, and more.
                </p>
              </CardContent>
              <CardFooter>
                {((process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') ||
                  permissions.can(PERMISSIONS.FACILITY_CREATE)) && (
                  <Button asChild>
                    <Link href="/dashboard/facilities/new">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Add Your First Facility
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {facilities.map((facility) => (
                <Card key={facility.id}>
                  <CardHeader>
                    <CardTitle>{facility.name}</CardTitle>
                    <CardDescription>{facility.address}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Location:</span>
                        <span className="text-sm text-muted-foreground">
                          {[facility.city, facility.state, facility.zipCode].filter(Boolean).join(", ")}
                        </span>
                      </div>
                      {facility.phone && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Phone:</span>
                          <span className="text-sm text-muted-foreground">{facility.phone}</span>
                        </div>
                      )}
                      {facility.email && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Email:</span>
                          <span className="text-sm text-muted-foreground">{facility.email}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/facilities/${facility.id}`}>View Details</Link>
                    </Button>
                    {((process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') ||
                      permissions.can(PERMISSIONS.FACILITY_EDIT)) && (
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/facilities/${facility.id}/edit`}>Edit</Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
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