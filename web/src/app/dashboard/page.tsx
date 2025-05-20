import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome"

export default async function DashboardPage() {
  const session = await auth()
  const user = session?.user
  
  // Get the full user record to check onboarding status
  const fullUser = user ? await prisma.user.findUnique({
    where: { id: user.id },
    select: { onboardingComplete: true }
  }) : null
  
  // Determine if we should show the welcome message
  const showWelcome = fullUser && !fullUser.onboardingComplete
  
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
      <DashboardOverview user={user} />
    </div>
  )
}