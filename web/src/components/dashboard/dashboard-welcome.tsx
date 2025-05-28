"use client"

import { useState } from "react"
import { WelcomeMessage } from "@/components/dashboard/welcome-message"
import { useOnboarding } from "@/hooks/use-onboarding"

interface DashboardWelcomeProps {
  userName?: string | null
  organizationName?: string | null
}

export function DashboardWelcome({ userName, organizationName }: DashboardWelcomeProps) {
  const [isVisible, setIsVisible] = useState(true)
  const { completeOnboarding, error } = useOnboarding()
  
  const handleDismiss = async () => {
    const success = await completeOnboarding()
    if (success) {
      setIsVisible(false)
    }
  }
  
  if (!isVisible) {
    return null
  }
  
  return (
    <>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md mb-4">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <WelcomeMessage
        userName={userName}
        organizationName={organizationName}
        onDismiss={handleDismiss}
      />
    </>
  )
}