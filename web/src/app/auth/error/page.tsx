"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Map error codes to user-friendly messages
const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration. Please contact support.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification link may have expired or already been used.",
  CredentialsSignin: "The email or password you entered is incorrect.",
  EmailSignin: "The email could not be sent.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An unexpected error occurred. Please try again."
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "Default"
  
  // Get the error message or use the default
  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
    <div className="p-4 bg-destructive/10 rounded-md text-destructive">
      {errorMessage}
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md border-2 border-destructive">
        <CardHeader>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            There was a problem with your authentication request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="p-4 bg-destructive/10 rounded-md text-destructive">
              Loading error details...
            </div>
          }>
            <ErrorContent />
          </Suspense>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" asChild>
            <Link href="/auth/signin">Return to Sign In</Link>
          </Button>
          <div className="text-sm text-center">
            Need help?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}