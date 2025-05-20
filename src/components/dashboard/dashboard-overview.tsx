import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DashboardOverviewProps {
  user: any
}

export function DashboardOverview({ user }: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Courts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">+4 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground mt-1">+22 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reservations (Today)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground mt-1">+3 from yesterday</p>
          </CardContent>
        </Card>
      </div>
      
      {/* User and Organization Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="text-base">{user?.name || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="text-base">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">User ID</dt>
                <dd className="text-base font-mono text-xs">{user?.id}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
            <CardDescription>Your organization details</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Organization Name</dt>
                <dd className="text-base">{user?.organizationName || "Not available"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Organization ID</dt>
                <dd className="text-base font-mono text-xs">{user?.organizationId || "Not available"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Roles</dt>
                <dd className="text-base">
                  {user?.roles?.length 
                    ? user.roles.map((role: string) => (
                        <span key={role} className="inline-block bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs mr-1">
                          {role}
                        </span>
                      ))
                    : "No roles assigned"
                  }
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events in your facilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">New reservation created</p>
                  <p className="text-xs text-muted-foreground">Court 3 at Main Facility - Today at 10:00 AM</p>
                </div>
                <div className="text-xs text-muted-foreground">5m ago</div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">New member joined</p>
                  <p className="text-xs text-muted-foreground">John Smith joined your organization</p>
                </div>
                <div className="text-xs text-muted-foreground">1h ago</div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Court maintenance completed</p>
                  <p className="text-xs text-muted-foreground">Court 2 at Downtown Facility</p>
                </div>
                <div className="text-xs text-muted-foreground">3h ago</div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">New staff member added</p>
                  <p className="text-xs text-muted-foreground">Sarah Johnson was added as staff</p>
                </div>
                <div className="text-xs text-muted-foreground">Yesterday</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">View All Activity</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Button className="justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Add New Facility
              </Button>
              <Button className="justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Create Reservation
              </Button>
              <Button className="justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Invite Team Member
              </Button>
              <Button className="justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}