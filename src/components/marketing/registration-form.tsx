"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator"
import {
  meetsAllCriteria,
  getPasswordValidationError,
  PASSWORD_CRITERIA,
  hasUppercase,
  hasLowercase,
  hasNumber,
  hasSpecialChar
} from "@/lib/password-validation"

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

const formSchema = z.object({
  organizationName: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  adminName: z.string().min(2, {
    message: "Admin name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: passwordSchema,
  confirmPassword: z.string().min(1, {
    message: "Please confirm your password.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: "",
      adminName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Registration failed. Please try again.")
      }
      
      setIsSuccess(true)
    } catch (error) {
      console.error("Registration error:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="register" className="py-20 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              Get Started
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Join Our Platform Today
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Create your account and start managing your pickleball facility more efficiently.
            </p>
          </div>
        </div>
        
        <div className="mx-auto max-w-md py-12">
          {isSuccess ? (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-2xl">Registration Successful!</CardTitle>
                <CardDescription>
                  Thank you for registering. Please check your email to verify your account.
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
                <Button className="w-full" asChild>
                  <a href="/auth/signin">Proceed to Login</a>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                  Fill out the form below to create your account and get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your pickleball facility name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="adminName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
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
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Registering..." : "Register"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-muted-foreground text-center">
                  By registering, you agree to our{" "}
                  <a href="#" className="underline underline-offset-4 hover:text-primary">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="underline underline-offset-4 hover:text-primary">
                    Privacy Policy
                  </a>
                  .
                </div>
                <div className="text-sm text-center">
                  Already have an account?{" "}
                  <a href="/auth/signin" className="text-primary hover:underline">
                    Login
                  </a>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}