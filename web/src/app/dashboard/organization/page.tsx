import { Metadata } from "next"
import { redirect } from "next/navigation"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getPermissionUtils } from "@/lib/auth-utils"
import { PERMISSIONS } from "@/lib/rbac"

// Get tracer for dashboard pages
const tracer = trace.getTracer('page-dashboard', '1.0.0')

export const metadata: Metadata = {
  title: "Organization Settings",
  description: "Manage your organization settings",
}

export default async function OrganizationSettingsPage() {
  return tracer.startActiveSpan('page-organization', async (span) => {
    try {
      // Add page attributes
      span.setAttributes({
        'page.route': '/dashboard/organization',
        'page.title': 'Organization Settings',
        'page.type': 'dashboard',
        'page.section': 'organization_management'
      })

      // Get the current user from the session and permission utilities
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
          'redirect.target': '/auth/signin'
        })
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
        redirect("/auth/signin")
      }
      
      // At this point, user should always be defined
      if (!user) {
        // This is a fallback that should never happen, but satisfies TypeScript
        span.setAttributes({
          'auth.fallback_redirect': true,
          'redirect.target': '/auth/signin'
        })
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
        redirect("/auth/signin")
      }

      // Add user context
      span.setAttributes({
        'user.id': user.id,
        'user.organization': user.organizationName || 'unknown'
      })
      
      // In development mode with mock user, bypass permission check
      const hasOrgViewPermission = (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') ||
        permissions.can(PERMISSIONS.ORG_VIEW)

      span.setAttributes({
        'permissions.org_view': hasOrgViewPermission
      })

      if (!hasOrgViewPermission) {
        span.setAttributes({
          'access.denied': true,
          'error.type': 'permission_denied'
        })
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: 'User does not have ORG_VIEW permission'
        })
        span.end()
        
        return (
          <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Organization Settings</h1>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-red-700">
                You do not have permission to view organization settings.
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
            <h1 className="text-2xl font-bold mb-6">Organization Settings</h1>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-700">
                You are not associated with any organization. Please contact support for assistance.
              </p>
            </div>
          </div>
        )
      }
  
  // Define type for organization members
  type OrganizationMember = {
    id: string;
    name: string | null;
    email: string | null;
    role: string | null;
  }
  
  // Define type for organization members
  let organizationMembers: OrganizationMember[] = [];
  
  // For development mode with mock user, create mock organization members
  if (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') {
    // Create mock organization members for development
    organizationMembers = [
      {
        id: 'dev-user-id',
        name: 'Development User',
        email: 'dev@example.com',
        role: 'ADMIN',
      },
      {
        id: 'mock-user-1',
        name: 'John Smith',
        email: 'john@example.com',
        role: 'MANAGER',
      },
      {
        id: 'mock-user-2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'MEMBER',
      }
    ];
    } else {
      // Get organization members from the database through UserOrganization
      const userOrganizations = await tracer.startActiveSpan('database-members-lookup', async (dbSpan) => {
        try {
          dbSpan.setAttributes({
            'database.operation': 'findMany',
            'database.table': 'userOrganization',
            'query.organization_id': organization.id
          })
          
          const result = await prisma.userOrganization.findMany({
            where: {
              organizationId: organization.id,
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              user: {
                name: "asc",
              },
            },
          })
          
          dbSpan.setAttributes({
            'database.query_success': true,
            'members.count': result.length
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
      
      organizationMembers = userOrganizations.map(userOrg => ({
        id: userOrg.user.id,
        name: userOrg.user.name,
        email: userOrg.user.email,
        role: userOrg.roles.join(', ') || 'MEMBER',
      }));
    }

    // Add permission context
    span.setAttributes({
      'permissions.org_edit': (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') || permissions.can(PERMISSIONS.ORG_EDIT),
      'permissions.org_manage_members': (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') || permissions.can(PERMISSIONS.ORG_MANAGE_MEMBERS),
      'permissions.settings_view': (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') || permissions.can(PERMISSIONS.SETTINGS_VIEW),
      'permissions.settings_edit': (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') || permissions.can(PERMISSIONS.SETTINGS_EDIT),
      'members.count': organizationMembers.length,
      'page.render_success': true
    })
    
    span.setStatus({ code: SpanStatusCode.OK })
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Organization Settings</h1>
      
      {/* Organization Details */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Organization Details</h2>
          
          {/* Edit button - only visible to users with ORG_EDIT permission */}
          {((process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') ||
            permissions.can(PERMISSIONS.ORG_EDIT)) && (
            <button
              className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
              disabled
            >
              Edit Details
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name
            </label>
            <div className="text-gray-900 font-medium">{organization.name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization ID
            </label>
            <div className="text-gray-500 text-sm font-mono">{organization.id}</div>
          </div>
        </div>
      </div>
      
      {/* Organization Members */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Organization Members</h2>
          
          {/* Invite button - only visible to users with ORG_MANAGE_MEMBERS permission */}
          {((process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') ||
            permissions.can(PERMISSIONS.ORG_MANAGE_MEMBERS)) && (
            <button
              className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
              disabled
            >
              Invite Member
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organizationMembers.map((member: OrganizationMember) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {member.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.role}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Member management message based on permissions */}
        <div className="mt-6 text-sm text-gray-500">
          {((process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') ||
            permissions.can(PERMISSIONS.ORG_MANAGE_MEMBERS)) ? (
            <p>
              You can invite new members and manage existing members&apos; roles.
              Full member management functionality will be available in a future update.
            </p>
          ) : (
            <p>
              Member management functionality is restricted to administrators and managers.
            </p>
          )}
        </div>
      </div>
      
      {/* Organization Settings - only visible to users with SETTINGS_VIEW permission */}
      {((process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') ||
        permissions.can(PERMISSIONS.SETTINGS_VIEW)) && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Organization Settings</h2>
            
            {/* Settings edit button - only visible to users with SETTINGS_EDIT permission */}
            {((process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') ||
              permissions.can(PERMISSIONS.SETTINGS_EDIT)) && (
              <button
                className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
                disabled
              >
                Edit Settings
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Future: Add organization settings form */}
            <div className="text-sm text-gray-500">
              <p>
                {((process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') ||
                  permissions.can(PERMISSIONS.SETTINGS_EDIT))
                  ? "You can modify organization settings. Additional configuration options will be available in a future update."
                  : "You can view organization settings. Editing is restricted to administrators and managers."}
              </p>
            </div>
          </div>
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