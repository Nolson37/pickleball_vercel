import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcrypt"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/api-middleware"
import { withCsrfProtection } from "@/lib/csrf"
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

// Define validation schema for password change
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, {
    message: "Current password is required.",
  }),
  newPassword: passwordSchema,
})

// Handler function for password change
async function changePasswordHandler(request: NextRequest) {
  try {
    // Get the current user from the session
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    
    // Validate request body
    const { currentPassword, newPassword } = passwordChangeSchema.parse(body)
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }
    
    // Hash the new password
    const saltRounds = 10
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)
    
    // Update the user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    })
    
    // Return success response
    return NextResponse.json(
      { success: true, message: "Password has been changed successfully." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Password change error:", error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    
    // Handle other errors
    return NextResponse.json(
      { error: "Failed to change password. Please try again." },
      { status: 500 }
    )
  }
}

// Export the handler with authentication and CSRF protection middleware
export const POST = withCsrfProtection(withAuth(changePasswordHandler))