import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getPermissionUtils } from "@/lib/auth-utils"
import { PERMISSIONS, ROLES } from "@/lib/rbac"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function UsersPage() {
  const session = await auth()
  const permissions = await getPermissionUtils()
  
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
  } else if (!session?.user) {
    // In production, redirect to login if not authenticated
    redirect("/auth/signin?callbackUrl=/dashboard/users")
  }
  
  // At this point, user should always be defined
  if (!user) {
    // This is a fallback that should never happen, but satisfies TypeScript
    redirect("/auth/signin?callbackUrl=/dashboard/users")
  }
  
  // In development mode with mock user, bypass permission check
  if (!(process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') &&
      !permissions.can(PERMISSIONS.USER_VIEW)) {
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
  
  // For development mode with mock user, create a mock organization
  let organization;
  
  if (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') {
    // Create a mock organization for development
    organization = {
      id: 'dev-org-id',
      name: 'Development Organization',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } else {
    // Get the user's organization from the database
    const userWithOrganization = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        organizations: {
          include: {
            organization: true,
          }
        },
      },
    })
    
    // Get the default organization or the first one if no default is set
    const userOrg = userWithOrganization?.organizations.find(org => org.isDefault) ||
                    userWithOrganization?.organizations[0]
    
    organization = userOrg?.organization
  }
  
  if (!organization) {
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
  
  // Define User type
  let organizationUsers: any[] = [];
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
  } else {
    // Get users for the organization from the database
    organizationUsers = await prisma.user.findMany({
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
    }) as any[];
    
    // Transform the data to a more usable format
    users = organizationUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
      roles: user.organizations[0]?.roles || []
    }));
  }
  
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
}