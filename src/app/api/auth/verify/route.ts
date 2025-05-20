import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Get token from query parameters
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")
    
    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      )
    }
    
    // Find the verification token in the database
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { token },
    })
    
    if (!verificationRecord) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      )
    }
    
    // Check if token has expired
    if (new Date() > verificationRecord.expires) {
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      )
    }
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: verificationRecord.email },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Update user's email verification status
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    })
    
    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { id: verificationRecord.id },
    })
    
    // Redirect to the verification success page
    return NextResponse.redirect(new URL("/auth/verification-success", request.url))
  } catch (error) {
    console.error("Email verification error:", error)
    
    // Handle other errors
    return NextResponse.json(
      { error: "Email verification failed. Please try again." },
      { status: 500 }
    )
  }
}