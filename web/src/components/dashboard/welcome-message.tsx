"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface WelcomeMessageProps {
  userName?: string | null
  organizationName?: string | null
  onDismiss: () => void
}

export function WelcomeMessage({ userName, organizationName, onDismiss }: WelcomeMessageProps) {
  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome to Pickleball Platform, {userName || "there"}!</CardTitle>
        <CardDescription>
          Your account for {organizationName || "your organization"} has been successfully created.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Here's what you can do next:</h3>
          <ul className="ml-6 list-disc space-y-2">
            <li>Complete your organization profile with contact information and logo</li>
            <li>Add your facilities and courts to start managing them</li>
            <li>Invite team members to collaborate on your platform</li>
            <li>Explore the dashboard to see key metrics and information</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            We're excited to help you manage your pickleball facilities more efficiently. If you have any questions,
            please don't hesitate to reach out to our support team.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onDismiss}>Get Started</Button>
      </CardFooter>
    </Card>
  )
}