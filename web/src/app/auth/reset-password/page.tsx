"use client"

import { useState, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator"
import {
  PASSWORD_CRITERIA,
  hasUppercase,
  hasLowercase,
  hasNumber,
  hasSpecialChar
} from "@/lib/password-validation"

// Get tracer for auth pages
const tracer = trace.getTracer('page-auth', '1.0.0')

// Password validation schema
const passwordSchema = z.string()
  .min(PASSWORD_CRITERIA.MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD_CRITERIA.MIN_LENGTH} characters.`
  })
  .refine(
    (password) => hasUppercase(password),
    { message: "Password must contain at least one uppercase letter." }
  )
  .refine(
    (password) => hasLowercase(password),
    { message: "Password must contain at least one lowercase letter." }
  )
  .refine(
    (password) => hasNumber(password),
    { message: "Password must contain at least one number." }
  )
  .refine(
    (password) => hasSpecialChar(password),
    { message: "Password must contain at least one special character." }
  )

// Define validation schema for reset password
const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, {
    message: "Please confirm your password.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // Trace page load
  useEffect(() => {
    tracer.startActiveSpan('page-reset-password', (span) => {
      span.setAttributes({
        'page.route': '/auth/reset-password',
        'page.title': 'Reset Password',
        'user.authenticated': false,
        'page.type': 'auth',
        'reset_token.present': !!token,
        'url.search_params': searchParams.toString()
      })
      
      if (!token) {
        span.setAttributes({
          'reset_token.error': 'missing_token',
          'error.type': 'validation_error'
        })
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: 'Reset token is missing'
        })
      } else {
        span.setStatus({ code: SpanStatusCode.OK })
      }
      
      span.end()
    })
  }, [token, searchParams])

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      setError("Reset token is missing. Please use the link from the email.")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    // Create a span for the password reset attempt
    return tracer.startActiveSpan('reset-password-attempt', async (span) => {
      try {
        // Add span attributes for context
        span.setAttributes({
          'form.type': 'reset_password',
          'operation.type': 'password_reset',
          'reset_token.present': !!token,
          'form.validation.success': true
        })
        
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password: values.password,
          }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          // Record API failure
          const errorMessage = data.error || "Failed to reset password"
          span.recordException(new Error(`API request failed: ${errorMessage}`))
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: errorMessage
          })
          span.setAttributes({
            'form.submission.success': false,
            'api.response.status': response.status,
            'error.type': 'api_failure',
            'error.message': errorMessage,
            'reset_token.valid': false
          })
          
          throw new Error(errorMessage)
        }
        
        // Record successful password reset
        span.setAttributes({
          'form.submission.success': true,
          'api.response.status': response.status,
          'password.reset_success': true,
          'user.action': 'password_reset_completed',
          'navigation.target': '/auth/signin'
        })
        span.setStatus({ code: SpanStatusCode.OK })
        
        setIsSuccess(true)
        
        // Redirect to sign in page after 3 seconds
        setTimeout(() => {
          tracer.startActiveSpan('navigation-redirect', (navSpan) => {
            navSpan.setAttributes({
              'navigation.source': '/auth/reset-password',
              'navigation.target': '/auth/signin',
              'navigation.trigger': 'auto_redirect',
              'navigation.delay_ms': 3000
            })
            navSpan.setStatus({ code: SpanStatusCode.OK })
            navSpan.end()
            
            router.push("/auth/signin")
          })
        }, 3000)
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
        
        console.error("Reset password error:", error)
        setError(error instanceof Error ? error.message : "An unexpected error occurred")
      } finally {
        setIsSubmitting(false)
        span.end()
      }
    })
  }

  // If no token is provided, show an error
  if (!token && !error) {
    setError("Reset token is missing. Please use the link from the email.")
  }

  return (
    <>
      {isSuccess ? (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          <p className="font-medium">Password Reset Successful!</p>
          <p className="text-sm mt-1">
            Your password has been reset successfully. You will be redirected to the sign in page shortly.
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <PasswordStrengthIndicator
                      password={field.value}
                      className="mt-2"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
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
                disabled={isSubmitting || !token}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </Form>
        </>
      )}
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="p-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-md">
              Loading reset form...
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
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