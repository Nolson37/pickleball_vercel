"use client"

import { useState } from "react"

export function useOnboarding() {
  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const completeOnboarding = async () => {
    setIsCompleting(true)
    setError(null)

    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update onboarding status")
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      return false
    } finally {
      setIsCompleting(false)
    }
  }

  return {
    completeOnboarding,
    isCompleting,
    error,
  }
}
