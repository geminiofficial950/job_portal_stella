import { redirect } from "next/navigation";
import { connectDB } from "./db";
import { User } from "@/models/User";
import { getAuthFromCookies, type AuthTokenPayload } from "./auth";
import type { UserRole } from "./roles";
import { dashboardPathForRole } from "./auth-edge";

export async function requireAuth(
  allowedRoles?: UserRole[]
): Promise<AuthTokenPayload> {
  const auth = await getAuthFromCookies();

  if (!auth) {
    redirect("/login");
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const ok =
      allowedRoles.includes(auth.role) || auth.role === "admin";
    if (!ok) {
      redirect(dashboardPathForRole(auth.role));
    }
  }

  // Prefer live name from DB over stale JWT claim
  try {
    await connectDB();
    const user = await User.findById(auth.sub).select("name email role isActive");
    if (!user || !user.isActive) {
      redirect("/login");
    }
    return {
      sub: auth.sub,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
    };
  } catch {
    return auth;
  }
}

/** Ensure the route userId matches the logged-in user (or admin). */
export async function requireSelfOrAdmin(userId: string): Promise<AuthTokenPayload> {
  const auth = await requireAuth();
  if (auth.sub !== userId && auth.role !== "admin") {
    redirect(dashboardPathForRole(auth.role));
  }
  return auth;
}
