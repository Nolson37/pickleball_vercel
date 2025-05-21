import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { Permission, Role } from "@/lib/rbac"
import { getPermissionUtils } from "@/lib/auth-utils"

/**
 * Type for API route handlers
 */
export type RouteHandler = (
  req: NextRequest
) => Promise<NextResponse>

/**
 * Middleware to protect API routes with authentication
 * 
 * @param handler - The API route handler
 * @returns A new handler that checks authentication before executing the original handler
 */
export function withAuth(handler: RouteHandler): RouteHandler {
  return async (req) => {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      )
    }
    
    return handler(req)
  }
}

/**
 * Middleware to protect API routes with permission checks
 * 
 * @param handler - The API route handler
 * @param permission - The permission required to access the route
 * @returns A new handler that checks permission before executing the original handler
 */
export function withPermission(handler: RouteHandler, permission: Permission): RouteHandler {
  return async (req) => {
    const permissionUtils = await getPermissionUtils()
    
    if (!permissionUtils.session?.user) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      )
    }
    
    if (!permissionUtils.can(permission)) {
      return NextResponse.json(
        { error: `Forbidden: Missing required permission: ${permission}` },
        { status: 403 }
      )
    }
    
    return handler(req)
  }
}

/**
 * Middleware to protect API routes with role checks
 * 
 * @param handler - The API route handler
 * @param role - The role required to access the route
 * @returns A new handler that checks role before executing the original handler
 */
export function withRole(handler: RouteHandler, role: Role): RouteHandler {
  return async (req) => {
    const permissionUtils = await getPermissionUtils()
    
    if (!permissionUtils.session?.user) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      )
    }
    
    if (!permissionUtils.is(role)) {
      return NextResponse.json(
        { error: `Forbidden: Missing required role: ${role}` },
        { status: 403 }
      )
    }
    
    return handler(req)
  }
}

/**
 * Middleware to protect API routes with multiple permission checks (any)
 * 
 * @param handler - The API route handler
 * @param permissions - The permissions where any one is required to access the route
 * @returns A new handler that checks permissions before executing the original handler
 */
export function withAnyPermission(handler: RouteHandler, permissions: Permission[]): RouteHandler {
  return async (req) => {
    const permissionUtils = await getPermissionUtils()
    
    if (!permissionUtils.session?.user) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      )
    }
    
    if (!permissionUtils.canAny(permissions)) {
      return NextResponse.json(
        { error: `Forbidden: Missing at least one of the required permissions: ${permissions.join(", ")}` },
        { status: 403 }
      )
    }
    
    return handler(req)
  }
}

/**
 * Middleware to protect API routes with multiple permission checks (all)
 * 
 * @param handler - The API route handler
 * @param permissions - The permissions where all are required to access the route
 * @returns A new handler that checks permissions before executing the original handler
 */
export function withAllPermissions(handler: RouteHandler, permissions: Permission[]): RouteHandler {
  return async (req) => {
    const permissionUtils = await getPermissionUtils()
    
    if (!permissionUtils.session?.user) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      )
    }
    
    if (!permissionUtils.canAll(permissions)) {
      return NextResponse.json(
        { error: `Forbidden: Missing one or more required permissions: ${permissions.join(", ")}` },
        { status: 403 }
      )
    }
    
    return handler(req)
  }
}