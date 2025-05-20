import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getPermissionUtils } from "@/lib/auth-utils"
import { PERMISSIONS } from "@/lib/rbac"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewFacilityPage() {
  const session = await auth()
  const permissions = await getPermissionUtils()
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard/facilities/new")
  }
  
  // Check if user has permission to create facilities
  if (!permissions.can(PERMISSIONS.FACILITY_CREATE)) {
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
}