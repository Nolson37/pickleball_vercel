import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import {
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

// Define validation schema for reset password
const resetPasswordSchema = z.object({
  token: z.string().min(1, {
    message: "Reset token is required.",
  }),
  password: passwordSchema,
})

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request body
    const { token, password } = resetPasswordSchema.parse(body)
    
    // Find the password reset token in the database
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    })
    
    if (!resetRecord) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }
    
    // Check if token has expired
    if (new Date() > resetRecord.expires) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      )
    }
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: resetRecord.email },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Hash the new password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        passwordHash,
        // Set email as verified if it's not already
        emailVerified: true
      },
    })
    
    // Delete the password reset token
    await prisma.passwordResetToken.delete({
      where: { id: resetRecord.id },
    })
    
    // Return success response
    return NextResponse.json(
      { success: true, message: "Password has been reset successfully." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Reset password error:", error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    
    // Handle other errors
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    )
  }
}