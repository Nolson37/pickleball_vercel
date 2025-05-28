"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"

// Get tracer for auth pages
const tracer = trace.getTracer('page-auth', '1.0.0')

// Define validation schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  // Trace page load
  useEffect(() => {
    tracer.startActiveSpan('page-forgot-password', (span) => {
      span.setAttributes({
        'page.route': '/auth/forgot-password',
        'page.title': 'Forgot Password',
        'user.authenticated': false,
        'page.type': 'auth'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      span.end()
    })
  }, [])

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsSubmitting(true)
    setError(null)
    
    // Create a span for the forgot password request
    return tracer.startActiveSpan('forgot-password-request', async (span) => {
      try {
        // Add span attributes for context
        span.setAttributes({
          'user.email': values.email,
          'form.type': 'forgot_password',
          'operation.type': 'password_reset_request'
        })
        
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          // Record API failure
          const errorMessage = data.error || "Failed to send password reset email"
          span.recordException(new Error(`API request failed: ${errorMessage}`))
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: errorMessage
          })
          span.setAttributes({
            'form.submission.success': false,
            'api.response.status': response.status,
            'error.type': 'api_failure',
            'error.message': errorMessage
          })
          
          throw new Error(errorMessage)
        }
        
        // Record successful request
        span.setAttributes({
          'form.submission.success': true,
          'api.response.status': response.status,
          'email.reset_sent': true,
          'user.action': 'password_reset_requested'
        })
        span.setStatus({ code: SpanStatusCode.OK })
        
        setIsSuccess(true)
      } catch (error) {
        // Record and trace the exception
        span.recordException(error as Error)
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (error as Error).message
        })
        span.setAttributes({
          'form.submission.success': false,
          'error.type': 'unexpected_error',
        })
        
        console.error("Forgot password error:", error)
        setError(error instanceof Error ? error.message : "An unexpected error occurred")
      } finally {
        setIsSubmitting(false)
        span.end()
      }
    })
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
              <p className="font-medium">Password Reset Email Sent</p>
              <p className="text-sm mt-1">
                If an account exists with this email, you will receive a password reset link shortly.
                Please check your email inbox and spam folder.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="you@example.com" 
                            {...field} 
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link 
            href="/auth/signin" 
            className="text-sm text-primary hover:underline"
          >
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}