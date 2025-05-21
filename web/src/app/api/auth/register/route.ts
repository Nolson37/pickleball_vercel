import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import nodemailer from "nodemailer"
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

// Define validation schema for registration
const registrationSchema = z.object({
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
})

// Helper function to create a slug from a string
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, "") // Remove non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // Trim hyphens from start
    .replace(/-+$/, "") // Trim hyphens from end
}

// Helper function to send verification email
async function sendVerificationEmail(email: string, token: string) {
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

  // Verification URL
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const verificationUrl = `${baseUrl}/auth/verify?token=${token}`

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@pickleballplatform.com",
    to: email,
    subject: "Verify your email address",
    text: `Please verify your email address by clicking on the following link: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Pickleball Facility Owner Platform!</h2>
        <p>Thank you for registering. Please verify your email address by clicking on the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't register for an account, you can safely ignore this email.</p>
      </div>
    `,
  }

  // Send email
  const info = await transporter.sendMail(mailOptions)
  
  // Log email URL for development (when using ethereal email)
  if (!process.env.EMAIL_SERVER_HOST) {
    console.log("Verification email preview URL: %s", nodemailer.getTestMessageUrl(info))
  }
  
  return info
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request body
    const { organizationName, adminName, email, password } = registrationSchema.parse(body)
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      )
    }
    
    // Create organization slug
    const baseSlug = createSlug(organizationName)
    
    // Check if slug exists and generate a unique one if needed
    let slug = baseSlug
    let slugExists = true
    let counter = 1
    
    while (slugExists) {
      const existingOrg = await prisma.organization.findUnique({
        where: { slug },
      })
      
      if (!existingOrg) {
        slugExists = false
      } else {
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }
    
    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 24) // Token expires in 24 hours
    
    // Create user, organization, and user-organization relationship in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug,
        },
      })
      
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          name: adminName,
          passwordHash,
        },
      })
      
      // Create user-organization relationship with admin role
      const userOrganization = await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          roles: ["admin"],
          isDefault: true,
        },
      })
      
      // Create verification token
      const verificationRecord = await tx.verificationToken.create({
        data: {
          email,
          token: verificationToken,
          expires: tokenExpiry,
        },
      })
      
      return { user, organization, userOrganization, verificationRecord }
    })
    
    // Send verification email
    await sendVerificationEmail(email, verificationToken)
    
    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Please check your email to verify your account.",
        organizationId: result.organization.id,
        organizationSlug: result.organization.slug,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    
    // Handle other errors
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    )
  }
}