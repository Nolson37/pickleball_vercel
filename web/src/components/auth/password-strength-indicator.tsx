"use client"

import { useState, useEffect } from "react"
import { 
  calculatePasswordStrength, 
  getPasswordStrengthLabel, 
  getPasswordStrengthColor,
  PasswordStrength,
  getValidationResults,
  PASSWORD_CRITERIA
} from "@/lib/password-validation"

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

export function PasswordStrengthIndicator({ 
  password, 
  className = "" 
}: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState<PasswordStrength>(PasswordStrength.VERY_WEAK)
  const [label, setLabel] = useState<string>("Very Weak")
  const [results, setResults] = useState<Record<string, boolean>>({
    meetsMinimumLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  useEffect(() => {
    if (!password) {
      setStrength(PasswordStrength.VERY_WEAK)
      setLabel("Very Weak")
      setResults({
        meetsMinimumLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
      })
      return
    }

    const newStrength = calculatePasswordStrength(password)
    const newLabel = getPasswordStrengthLabel(newStrength)
    const newResults = getValidationResults(password)

    setStrength(newStrength)
    setLabel(newLabel)
    setResults(newResults)
  }, [password])

  // Get color based on strength
  const color = getPasswordStrengthColor(strength)
  
  // Calculate width percentage based on strength (0-4)
  const widthPercentage = ((strength + 1) / 5) * 100

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-xs">
        <span>Password Strength:</span>
        <span 
          className={`font-medium ${
            strength === PasswordStrength.VERY_WEAK || strength === PasswordStrength.WEAK
              ? "text-red-500"
              : strength === PasswordStrength.MEDIUM
              ? "text-yellow-500"
              : "text-green-500"
          }`}
        >
          {label}
        </span>
      </div>
      
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${
            strength === PasswordStrength.VERY_WEAK
              ? "bg-red-500"
              : strength === PasswordStrength.WEAK
              ? "bg-orange-500"
              : strength === PasswordStrength.MEDIUM
              ? "bg-yellow-500"
              : "bg-green-500"
          }`}
          style={{ width: `${widthPercentage}%` }}
        />
      </div>

      <ul className="text-xs space-y-1 text-gray-500">
        <li className={results.meetsMinimumLength ? "text-green-600" : ""}>
          {results.meetsMinimumLength ? "✓" : "○"} At least {PASSWORD_CRITERIA.MIN_LENGTH} characters
        </li>
        {PASSWORD_CRITERIA.HAS_UPPERCASE && (
          <li className={results.hasUppercase ? "text-green-600" : ""}>
            {results.hasUppercase ? "✓" : "○"} At least one uppercase letter
          </li>
        )}
        {PASSWORD_CRITERIA.HAS_LOWERCASE && (
          <li className={results.hasLowercase ? "text-green-600" : ""}>
            {results.hasLowercase ? "✓" : "○"} At least one lowercase letter
          </li>
        )}
        {PASSWORD_CRITERIA.HAS_NUMBER && (
          <li className={results.hasNumber ? "text-green-600" : ""}>
            {results.hasNumber ? "✓" : "○"} At least one number
          </li>
        )}
        {PASSWORD_CRITERIA.HAS_SPECIAL && (
          <li className={results.hasSpecialChar ? "text-green-600" : ""}>
            {results.hasSpecialChar ? "✓" : "○"} At least one special character
          </li>
        )}
      </ul>
    </div>
  )
}