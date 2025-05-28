import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getPermissionUtils } from "@/lib/auth-utils"
import { PERMISSIONS } from "@/lib/rbac"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function FacilitiesPage() {
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
    redirect("/auth/signin?callbackUrl=/dashboard/facilities")
  }
  
  // At this point, user should always be defined
  if (!user) {
    // This is a fallback that should never happen, but satisfies TypeScript
    redirect("/auth/signin?callbackUrl=/dashboard/facilities")
  }
  
  // In development mode with mock user, bypass permission check
  if (!(process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') &&
      !permissions.can(PERMISSIONS.FACILITY_VIEW)) {
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
    // Get the user's organizations from the database
    const userWithOrganizations = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    })
    
    // Get the default organization or the first one
    const userOrg = userWithOrganizations?.organizations.find(org => org.isDefault) ||
                    userWithOrganizations?.organizations[0]
    organization = userOrg?.organization
    
    if (!organization) {
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
  } else {
    // Get facilities for the organization from the database
    facilities = await prisma.facility.findMany({
      where: {
        organizationId: organization.id,
      },
      orderBy: {
        name: "asc",
      },
    }) as Facility[];
  }
  
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
}