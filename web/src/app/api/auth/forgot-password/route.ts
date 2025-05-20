import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import nodemailer from "nodemailer"
import { prisma } from "@/lib/prisma"

// Define validation schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

// Helper function to send password reset email
async function sendPasswordResetEmail(email: string, token: string) {
  // Create a test account if no email configuration is provided
  const testAccount = await nodemailer.createTestAccount()

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || testAccount.smtp.host,
    port: parseInt(process.env.EMAIL_SERVER_PORT || testAccount.smtp.port.toString()),
    secure: process.env.EMAIL_SERVER_HOST ? true : testAccount.smtp.secure,
    auth: {
      user: process.env.EMAIL_SERVER_USER || testAccount.user,
      pass: process.env.EMAIL_SERVER_PASSWORD || testAccount.pass,
    },
  })

  // Reset URL
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@pickleballplatform.com",
    to: email,
    subject: "Reset your password",
    text: `You requested to reset your password. Please click on the following link to reset your password: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>You requested to reset your password. Please click on the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  }

  // Send email
  const info = await transporter.sendMail(mailOptions)
  
  // Log email URL for development (when using ethereal email)
  if (!process.env.EMAIL_SERVER_HOST) {
    console.log("Password reset email preview URL: %s", nodemailer.getTestMessageUrl(info))
  }
  
  return info
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request body
    const { email } = forgotPasswordSchema.parse(body)
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    // If user doesn't exist, we still return a success response for security reasons
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json(
        { success: true, message: "If an account with this email exists, a password reset link has been sent." },
        { status: 200 }
      )
    }
    
    // Delete any existing password reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    })
    
    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 24) // Token expires in 24 hours
    
    // Save password reset token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expires: tokenExpiry,
      },
    })
    
    // Send password reset email
    await sendPasswordResetEmail(email, resetToken)
    
    // Return success response
    return NextResponse.json(
      { success: true, message: "Password reset link has been sent to your email." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    
    // Handle other errors
    return NextResponse.json(
      { error: "Failed to send password reset email. Please try again." },
      { status: 500 }
    )
  }
}