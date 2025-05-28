import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { getPermissionUtils } from "@/lib/auth-utils"
import { PERMISSIONS, ROLES } from "@/lib/rbac"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Get tracer for dashboard pages
const tracer = trace.getTracer('page-dashboard', '1.0.0')

export default async function UsersPage() {
  return tracer.startActiveSpan('page-users', async (span) => {
    try {
      // Add page attributes
      span.setAttributes({
        'page.route': '/dashboard/users',
        'page.title': 'Users',
        'page.type': 'dashboard',
        'page.section': 'user_management'
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
          'redirect.target': '/auth/signin?callbackUrl=/dashboard/users'
        })
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
        redirect("/auth/signin?callbackUrl=/dashboard/users")
      }
      
      // At this point, user should always be defined
      if (!user) {
        // This is a fallback that should never happen, but satisfies TypeScript
        span.setAttributes({
          'auth.fallback_redirect': true,
          'redirect.target': '/auth/signin?callbackUrl=/dashboard/users'
        })
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
        redirect("/auth/signin?callbackUrl=/dashboard/users")
      }

      // Add user context
      span.setAttributes({
        'user.id': user.id,
        'user.organization': user.organizationName || 'unknown'
      })
      
      // In development mode with mock user, bypass permission check
      const hasUserViewPermission = (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') ||
        permissions.can(PERMISSIONS.USER_VIEW)

      span.setAttributes({
        'permissions.user_view': hasUserViewPermission
      })

      if (!hasUserViewPermission) {
        span.setAttributes({
          'access.denied': true,
          'error.type': 'permission_denied'
        })
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: 'User does not have USER_VIEW permission'
        })
        span.end()
        
        return (
          <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Users</h1>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-red-700">
                You do not have permission to view users.
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
            <h1 className="text-2xl font-bold mb-6">Users</h1>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-700">
                You are not associated with any organization. Please contact support for assistance.
              </p>
            </div>
          </div>
        )
      }

      // Define User type
      type OrganizationUser = {
        id: string;
        name: string | null;
        email: string | null;
        imageUrl: string | null;
        roles: string[];
      }
      
      // Define User type for database results
      type DatabaseUser = {
        id: string;
        name: string | null;
        email: string;
        imageUrl: string | null;
        organizations: {
          roles: string[];
        }[];
      }
      
      let organizationUsers: DatabaseUser[] = [];
      let users: OrganizationUser[] = [];
      
      // For development mode with mock user, create mock organization users
      if (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') {
        // Create mock users for development
        users = [
          {
            id: 'dev-user-id',
            name: 'Development User',
            email: 'dev@example.com',
            imageUrl: null,
            roles: [ROLES.ADMIN]
          },
          {
            id: 'mock-user-1',
            name: 'John Smith',
            email: 'john@example.com',
            imageUrl: null,
            roles: [ROLES.MANAGER]
          },
          {
            id: 'mock-user-2',
            name: 'Jane Doe',
            email: 'jane@example.com',
            imageUrl: null,
            roles: [ROLES.STAFF]
          },
          {
            id: 'mock-user-3',
            name: 'Bob Johnson',
            email: 'bob@example.com',
            imageUrl: null,
            roles: [ROLES.MEMBER]
          }
        ];
        span.setAttributes({
          'users.mock': true,
          'users.count': users.length
        })
      } else {
        // Get users for the organization from the database
        organizationUsers = await tracer.startActiveSpan('database-users-lookup', async (dbSpan) => {
          try {
            dbSpan.setAttributes({
              'database.operation': 'findMany',
              'database.table': 'user',
              'query.organization_id': organization.id
            })
            
            const result = await prisma.user.findMany({
              where: {
                organizations: {
                  some: {
                    organizationId: organization.id
                  }
                }
              },
              include: {
                organizations: {
                  where: {
                    organizationId: organization.id
                  },
                  select: {
                    roles: true
                  }
                }
              },
              orderBy: {
                name: "asc"
              }
            }) as DatabaseUser[];
            
            dbSpan.setAttributes({
              'database.query_success': true,
              'users.count': result.length
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
        
        // Transform the data to a more usable format
        users = organizationUsers.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          imageUrl: user.imageUrl,
          roles: user.organizations[0]?.roles || []
        }));

        span.setAttributes({
          'users.count': users.length
        })
      }

      // Add permission context
      span.setAttributes({
        'permissions.org_manage_members': (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') || permissions.can(PERMISSIONS.ORG_MANAGE_MEMBERS),
        'permissions.user_edit': (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') || permissions.can(PERMISSIONS.USER_EDIT),
        'page.render_success': true
      })
      
      span.setStatus({ code: SpanStatusCode.OK })
  
      // Function to get the highest role for display
      const getHighestRole = (roles: string[]) => {
        if (roles.includes(ROLES.ADMIN)) return "Admin"
        if (roles.includes(ROLES.MANAGER)) return "Manager"
        if (roles.includes(ROLES.STAFF)) return "Staff"
        if (roles.includes(ROLES.MEMBER)) return "Member"
        return "Guest"
      }
      
      // Function to get initials from name
      const getInitials = (name: string | null) => {
        if (!name) return "U"
        return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
      }
      
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Users</h1>
              <p className="text-muted-foreground">
                Manage users in your organization.
              </p>
            </div>
            
            {((process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') ||
              permissions.can(PERMISSIONS.ORG_MANAGE_MEMBERS)) && (
              <Button asChild>
                <Link href="/dashboard/users/invite">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  Invite User
                </Link>
              </Button>
            )}
          </div>
          
          {users.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Users</CardTitle>
                <CardDescription>
                  There are no users in your organization yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get started by inviting team members to your organization.
                </p>
              </CardContent>
              <CardFooter>
                {((process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') ||
                  permissions.can(PERMISSIONS.ORG_MANAGE_MEMBERS)) && (
                  <Button asChild>
                    <Link href="/dashboard/users/invite">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                      </svg>
                      Invite Your First User
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Organization Users</CardTitle>
                <CardDescription>
                  Users with access to your organization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">User</th>
                        <th className="text-left py-3 px-4 font-medium">Email</th>
                        <th className="text-left py-3 px-4 font-medium">Role</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={user.imageUrl || ""} alt={user.name || "User"} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.name || "Unnamed User"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className="inline-block bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                              {getHighestRole(user.roles)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {((process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') ||
                              permissions.can(PERMISSIONS.USER_EDIT)) && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/users/${user.id}`}>Manage</Link>
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
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