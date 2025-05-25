"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Suspense } from "react"

// Define validation schema for sign-in
const signInSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
  rememberMe: z.boolean().default(false),
})

// Define the form values type
interface SignInFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Create a client component that uses useSearchParams
function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const error = searchParams.get("error")
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(
    error === "CredentialsSignin"
      ? "Invalid email or password"
      : error
        ? "An error occurred. Please try again."
        : null
  )
  

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema) as any,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  async function onSubmit(values: SignInFormValues) {
    setIsSubmitting(true)
    setAuthError(null)
    
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        remember: values.rememberMe,
        redirect: false,
      })
      
      if (result?.error) {
        setAuthError(result.error === "CredentialsSignin"
          ? "Invalid email or password"
          : result.error)
        setIsSubmitting(false)
      } else if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch (error) {
      console.error("Sign-in error:", error)
      setAuthError("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {authError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {authError}
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
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
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
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-1">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Remember me</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
            </form>
          </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center">
          <Link
            href="/auth/forgot-password"
            className="text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
        <div className="text-sm text-center">
          Don&apos;t have an account?{" "}
          <Link
            href="/#register"
            className="text-primary hover:underline"
          >
            Register
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

// Main page component with Suspense boundary
export default function SignInPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
          </CardHeader>
        </Card>
      }>
        <SignInForm />
      </Suspense>
    </div>
  )
}
