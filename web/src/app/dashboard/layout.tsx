import { ReactNode } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth()
  
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
    redirect("/auth/signin?callbackUrl=/dashboard")
  }
  
  // Ensure user is defined (TypeScript safety)
  user = user || {
    id: '',
    name: '',
    email: '',
    organizationName: '',
    image: '',
  }
  
  const organizationName = user.organizationName || "Your Organization"
  const userInitials = user.name ? user.name.substring(0, 2).toUpperCase() : "U"
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              Pickleball Platform
            </Link>
            <span className="hidden sm:inline text-sm text-muted-foreground">
              {organizationName}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block text-sm text-right">
              <div className="font-medium">{user.name}</div>
              <div className="text-muted-foreground">{user.email}</div>
            </div>
            <Avatar>
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <form action={async () => {
              "use server"
              await signOut()
              redirect("/")
            }}>
              <Button variant="outline" size="sm" type="submit" className="hidden sm:inline-flex">
                Sign Out
              </Button>
              <Button variant="outline" size="icon" type="submit" className="sm:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </Button>
            </form>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden p-4 bg-gray-50 border-b border-gray-200">
          <details className="group [&[open]>summary]:rounded-b-none">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-100 px-4 py-2 text-gray-900">
              <span className="text-sm font-medium">Menu</span>
              <span className="transition group-open:rotate-180">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </summary>
            <nav className="mt-2 space-y-1 px-4">
              <Link
                href="/dashboard"
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-900 bg-gray-100"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Profile
              </Link>
              <Link
                href="/dashboard/organization"
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Organization Settings
              </Link>
              <Link
                href="/dashboard/facilities"
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Facilities
              </Link>
              <Link
                href="/dashboard/users"
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Users
              </Link>
            </nav>
          </details>
        </div>
        
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 bg-gray-50 border-r border-gray-200 p-4 shrink-0">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-900 bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Profile
            </Link>
            <Link
              href="/dashboard/organization"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              Organization
            </Link>
            <Link
              href="/dashboard/facilities"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Facilities
            </Link>
            <Link
              href="/dashboard/users"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Users
            </Link>
          </nav>
          
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="mt-2 space-y-1">
              <button className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Facility
              </button>
              <button className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Invite User
              </button>
            </div>
          </div>
        </aside>
        
        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}