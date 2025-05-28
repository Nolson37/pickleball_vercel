import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const session = await auth()
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Update the user's onboardingComplete status
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingComplete: true }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating onboarding status:", error)
    return NextResponse.json(
      { error: "Failed to update onboarding status" },
      { status: 500 }
    )
  }
}
