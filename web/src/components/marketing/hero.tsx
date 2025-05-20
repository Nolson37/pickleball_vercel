import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 800 800"
        >
          <rect fill="none" stroke="currentColor" strokeWidth="2" x="50" y="50" width="100" height="100" rx="20" />
          <rect fill="none" stroke="currentColor" strokeWidth="2" x="150" y="50" width="100" height="100" rx="20" />
          <rect fill="none" stroke="currentColor" strokeWidth="2" x="50" y="150" width="100" height="100" rx="20" />
          <rect fill="none" stroke="currentColor" strokeWidth="2" x="150" y="150" width="100" height="100" rx="20" />
          <rect fill="none" stroke="currentColor" strokeWidth="2" x="250" y="50" width="100" height="100" rx="20" />
          <rect fill="none" stroke="currentColor" strokeWidth="2" x="350" y="50" width="100" height="100" rx="20" />
          <rect fill="none" stroke="currentColor" strokeWidth="2" x="250" y="150" width="100" height="100" rx="20" />
          <rect fill="none" stroke="currentColor" strokeWidth="2" x="350" y="150" width="100" height="100" rx="20" />
        </svg>
      </div>

      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Streamline Your Pickleball Facility Management
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                The all-in-one platform designed specifically for pickleball facility owners. Manage courts, bookings, memberships, and more with ease.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <Link href="#register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-primary"
                >
                  <path d="M12 2H2v10h10V2Z" />
                  <path d="M12 12H2v10h10V12Z" />
                  <path d="M22 2h-10v20h10V2Z" />
                </svg>
                <span>Easy to use</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-primary"
                >
                  <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>Secure & reliable</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-primary"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>Trusted by owners</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative aspect-video overflow-hidden rounded-xl border bg-background md:aspect-square lg:order-last lg:aspect-auto">
              <div className="flex h-full w-full items-center justify-center bg-muted p-8">
                <Image
                  src="/next.svg"
                  alt="Pickleball facility management"
                  width={180}
                  height={37}
                  className="dark:invert"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}