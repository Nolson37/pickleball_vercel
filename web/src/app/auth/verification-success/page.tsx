"use client"

import { useEffect } from "react"
import Link from "next/link"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Get tracer for auth pages
const tracer = trace.getTracer('page-auth', '1.0.0')

export default function VerificationSuccessPage() {
  // Trace page load
  useEffect(() => {
    tracer.startActiveSpan('page-verification-success', (span) => {
      span.setAttributes({
        'page.route': '/auth/verification-success',
        'page.title': 'Email Verification Success',
        'user.authenticated': false,
        'page.type': 'auth',
        'verification.status': 'success',
        'user.email_verified': true
      })
      span.setStatus({ code: SpanStatusCode.OK })
      span.end()
    })
  }, [])

  // Handle navigation to signin
  const handleProceedToLogin = () => {
    tracer.startActiveSpan('navigation-proceed-to-login', (span) => {
      span.setAttributes({
        'navigation.source': '/auth/verification-success',
        'navigation.target': '/auth/signin',
        'navigation.trigger': 'user_click',
        'user.action': 'proceed_to_login'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      span.end()
    })
  }
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Email Verified Successfully!</CardTitle>
          <CardDescription>
            Your email has been verified. You can now sign in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
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
            className="h-16 w-16 text-primary"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </CardContent>
        <CardFooter>
          <Button className="w-full" asChild onClick={handleProceedToLogin}>
            <Link href="/auth/signin">Proceed to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}