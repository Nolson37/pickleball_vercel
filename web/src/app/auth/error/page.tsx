"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense, useEffect } from "react"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Get tracer for auth pages
const tracer = trace.getTracer('page-auth', '1.0.0')

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

  // Trace error details
  useEffect(() => {
    tracer.startActiveSpan('auth-error-display', (span) => {
      span.setAttributes({
        'error.type': error,
        'error.message': errorMessage,
        'auth.error_code': error,
        'page.error_displayed': true,
        'url.search_params': searchParams.toString()
      })
      
      // Mark as error span since this represents an authentication failure
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: `Authentication error: ${error}`
      })
      span.recordException(new Error(`Authentication error: ${error} - ${errorMessage}`))
      span.end()
    })
  }, [error, errorMessage, searchParams])

  return (
    <div className="p-4 bg-destructive/10 rounded-md text-destructive">
      {errorMessage}
    </div>
  )
}

export default function AuthErrorPage() {
  // Trace page load
  useEffect(() => {
    tracer.startActiveSpan('page-auth-error', (span) => {
      span.setAttributes({
        'page.route': '/auth/error',
        'page.title': 'Authentication Error',
        'user.authenticated': false,
        'page.type': 'auth',
        'page.error_page': true
      })
      span.setStatus({ code: SpanStatusCode.OK })
      span.end()
    })
  }, [])

  // Handle navigation actions
  const handleReturnToSignIn = () => {
    tracer.startActiveSpan('navigation-return-to-signin', (span) => {
      span.setAttributes({
        'navigation.source': '/auth/error',
        'navigation.target': '/auth/signin',
        'navigation.trigger': 'user_click',
        'user.action': 'return_to_signin'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      span.end()
    })
  }

  const handleContactSupport = () => {
    tracer.startActiveSpan('navigation-contact-support', (span) => {
      span.setAttributes({
        'navigation.source': '/auth/error',
        'navigation.target': '/contact',
        'navigation.trigger': 'user_click',
        'user.action': 'contact_support'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      span.end()
    })
  }

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
          <Button className="w-full" asChild onClick={handleReturnToSignIn}>
            <Link href="/auth/signin">Return to Sign In</Link>
          </Button>
          <div className="text-sm text-center">
            Need help?{" "}
            <Link href="/contact" className="text-primary hover:underline" onClick={handleContactSupport}>
              Contact Support
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}