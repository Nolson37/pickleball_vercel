import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getPermissionUtils } from "@/lib/auth-utils"
import { PERMISSIONS } from "@/lib/rbac"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function InviteUserPage() {
  const session = await auth()
  const permissions = await getPermissionUtils()
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard/users/invite")
  }
  
  // Check if user has permission to manage members
  if (!permissions.can(PERMISSIONS.ORG_MANAGE_MEMBERS)) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invite User</h1>
          <p className="text-muted-foreground">
            Invite a new user to your organization.
          </p>
        </div>
        
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">
            You do not have permission to invite users.
          </p>
        </div>
        
        <Button asChild>
          <Link href="/dashboard/users">Back to Users</Link>
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invite User</h1>
        <p className="text-muted-foreground">
          Invite a new user to your organization.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Invitation</CardTitle>
          <CardDescription>
            Enter the details for the user you want to invite.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">User Invitation Form</h3>
              <p className="mt-1 text-sm text-gray-500">
                This feature will be available soon. Check back later!
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard/users">Cancel</Link>
          </Button>
          <Button disabled>Send Invitation</Button>
        </CardFooter>
      </Card>
    </div>
  )
}