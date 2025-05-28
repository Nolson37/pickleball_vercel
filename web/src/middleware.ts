export { auth as middleware } from "@/auth"

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Protect dashboard and other authenticated routes
    "/dashboard/:path*",
    // Exclude auth pages, API routes, and static assets
    "/((?!auth|api|_next/static|_next/image|favicon.ico).*)"],
}