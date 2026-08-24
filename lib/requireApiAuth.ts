import { NextResponse } from "next/server";
import { getAuthFromCookies, type AuthTokenPayload } from "./auth";
import type { UserRole } from "./roles";

export async function requireApiAuth(
  allowedRoles?: UserRole[]
): Promise<
  | { auth: AuthTokenPayload; error?: undefined }
  | { auth?: undefined; error: NextResponse }
> {
  const auth = await getAuthFromCookies();

  if (!auth) {
    return {
      error: NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const ok = allowedRoles.includes(auth.role) || auth.role === "admin";
    if (!ok) {
      return {
        error: NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 }
        ),
      };
    }
  }

  return { auth };
}

/** Block API access when `:id` is not the logged-in user (unless admin). */
export async function requireApiSelfOrAdmin(userId: string) {
  const result = await requireApiAuth();
  if (result.error) return result;

  if (result.auth.sub !== userId && result.auth.role !== "admin") {
    return {
      error: NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return result;
}
