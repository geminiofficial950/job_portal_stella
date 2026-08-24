import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_COOKIE,
  canAccessDashboard,
  dashboardPathForRole,
  verifyAuthToken,
} from "./lib/auth-edge";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const auth = await verifyAuthToken(token);

  if (!auth) {
    const loginUrl = new URL("/login", request.url);
    const wantsRecruiter = pathname.includes("/recruiter");
    loginUrl.searchParams.set("role", wantsRecruiter ? "recruiter" : "user");
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // /dashboard → own dashboard only
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return NextResponse.redirect(
      new URL(dashboardPathForRole(auth.role), request.url)
    );
  }

  // Block /dashboard/user/:id if not self (or admin)
  const userMatch = pathname.match(/^\/dashboard\/user\/([^/]+)/);
  if (userMatch) {
    const targetId = userMatch[1];
    if (targetId !== auth.sub && auth.role !== "admin") {
      return NextResponse.redirect(
        new URL(dashboardPathForRole(auth.role), request.url)
      );
    }
  }

  if (pathname.startsWith("/dashboard/recruiter")) {
    if (!canAccessDashboard(auth.role, "recruiter")) {
      return NextResponse.redirect(
        new URL(dashboardPathForRole(auth.role), request.url)
      );
    }
  }

  if (pathname.startsWith("/dashboard/seeker")) {
    if (!canAccessDashboard(auth.role, "seeker")) {
      return NextResponse.redirect(
        new URL(dashboardPathForRole(auth.role), request.url)
      );
    }
  }

  if (pathname.startsWith("/dashboard/admin")) {
    if (!canAccessDashboard(auth.role, "admin")) {
      return NextResponse.redirect(
        new URL(dashboardPathForRole(auth.role), request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
