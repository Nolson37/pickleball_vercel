"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator"
import {
  PASSWORD_CRITERIA,
  hasUppercase,
  hasLowercase,
  hasNumber,
  hasSpecialChar
} from "@/lib/password-validation"

// Get tracer for dashboard pages
const tracer = trace.getTracer('page-dashboard', '1.0.0')

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

// Define validation schema for password change
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, {
    message: "Current password is required.",
  }),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, {
    message: "Please confirm your password.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

// Use the inferred type from the schema
type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>

export default function ProfilePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Trace page load
  useEffect(() => {
    tracer.startActiveSpan('page-profile', (span) => {
      span.setAttributes({
        'page.route': '/dashboard/profile',
        'page.title': 'Profile',
        'user.authenticated': true,
        'page.type': 'dashboard',
        'page.section': 'user_management'
      })
      span.setStatus({ code: SpanStatusCode.OK })
      span.end()
    })
  }, [])

  async function onSubmit(values: PasswordChangeFormValues) {
    setIsSubmitting(true)
    setError(null)
    
    // Create a span for the password change attempt
    return tracer.startActiveSpan('change-password-attempt', async (span) => {
      try {
        // Add span attributes for context
        span.setAttributes({
          'form.type': 'change_password',
          'operation.type': 'password_update',
          'user.action': 'change_password',
          'form.validation.success': true
        })
        
        // NextAuth handles CSRF protection automatically
        const response = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          // Record API failure
          const errorMessage = data.error || "Failed to change password"
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
            'password.change_success': false
          })
          
          throw new Error(errorMessage)
        }
        
        // Record successful password change
        span.setAttributes({
          'form.submission.success': true,
          'api.response.status': response.status,
          'password.change_success': true,
          'user.action': 'password_changed',
          'navigation.target': '/dashboard'
        })
        span.setStatus({ code: SpanStatusCode.OK })
        
        setIsSuccess(true)
        form.reset()
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          tracer.startActiveSpan('navigation-redirect', (navSpan) => {
            navSpan.setAttributes({
              'navigation.source': '/dashboard/profile',
              'navigation.target': '/dashboard',
              'navigation.trigger': 'auto_redirect',
              'navigation.delay_ms': 3000,
              'user.action': 'return_to_dashboard'
            })
            navSpan.setStatus({ code: SpanStatusCode.OK })
            navSpan.end()
            
            router.push("/dashboard")
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
          'password.change_success': false
        })
        
        console.error("Password change error:", error)
        setError(error instanceof Error ? error.message : "An unexpected error occurred")
      } finally {
        setIsSubmitting(false)
        span.end()
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and change your password.
        </p>
      </div>
      
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
              <p className="font-medium">Password Changed Successfully!</p>
              <p className="text-sm mt-1">
                Your password has been updated. You will be redirected to the dashboard shortly.
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
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
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
                  
                  <FormField
                    control={form.control}
                    name="newPassword"
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
                        <FormLabel>Confirm New Password</FormLabel>
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Changing Password..." : "Change Password"}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}