import { jwtVerify } from "jose";
import type { UserRole } from "./roles";
import { AUTH_COOKIE, type AuthTokenPayload } from "./auth";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

/** Edge-safe JWT verify for proxy.ts (no next/headers). */
export async function verifyAuthToken(
  token: string | undefined
): Promise<AuthTokenPayload | null> {
  if (!token) return null;
  const secret = getSecret();
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    if (
      !payload.sub ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role as UserRole,
      name: typeof payload.name === "string" ? payload.name : "",
    };
  } catch {
    return null;
  }
}

export function dashboardPathForRole(role: UserRole): string {
  if (role === "recruiter") return "/dashboard/recruiter";
  if (role === "admin") return "/dashboard/admin";
  return "/dashboard/seeker";
}

export function canAccessDashboard(
  role: UserRole,
  dashboard: "seeker" | "recruiter" | "admin"
): boolean {
  if (role === "admin") return true;
  if (dashboard === "recruiter") return role === "recruiter";
  if (dashboard === "seeker") return role === "user";
  if (dashboard === "admin") return false;
  return false;
}

export { AUTH_COOKIE };
