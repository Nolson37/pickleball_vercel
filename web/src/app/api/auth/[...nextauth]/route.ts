import { handlers } from "@/auth"

// Export the NextAuth.js API handlers
export const { GET, POST } = handlers

// Disable CSRF checks for this route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
    externalResolver: true,
  },
}