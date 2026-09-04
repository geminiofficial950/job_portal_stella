"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthProvider";
import { useAuthModal } from "./AuthModalProvider";

interface SignInMenuProps {
  variant?: "ghost" | "solid";
  className?: string;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function SignInMenu({
  variant = "ghost",
  className = "",
}: SignInMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { openAuth } = useAuthModal();
  const isJobsPage = pathname === "/jobs";

  const triggerClass =
    variant === "ghost"
      ? "btn ghost sm"
      : "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[#0000FF] border border-[#0000FF] bg-white hover:bg-[#f0f4ff] hover:border-[#0000FF] transition-colors";

  async function handleLogout() {
    await logout();
    toast.success("Logged out");
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div
        className={`h-9 w-24 rounded-lg bg-[#e6eaf2]/60 animate-pulse ${className}`}
        aria-hidden
      />
    );
  }

  if (user) {
    const dashboardHref =
      user.role === "recruiter"
        ? "/dashboard/recruiter"
        : user.role === "admin"
          ? "/dashboard/admin"
          : "/dashboard/seeker";
    const firstName = user.name.split(/\s+/)[0] || "Account";

    return (
      <div className={`signin-menu profile-menu ${className}`}>
        <button
          type="button"
          className={`signin-trigger profile-trigger ${triggerClass}`}
          style={
            variant === "solid" && isJobsPage
              ? {
                  color: "#ffffff",
                  borderColor: "#ffffff",
                  background: "transparent",
                }
              : undefined
          }
          aria-haspopup="true"
        >
          <span className="profile-avatar" aria-hidden>
            {initials(user.name)}
          </span>
          <span className="profile-name">{firstName}</span>
          <ChevronDown className="signin-chevron h-3.5 w-3.5" />
        </button>

        <div className="signin-dropdown profile-dropdown" role="menu">
          <div className="profile-meta">
            <strong>{user.name}</strong>
            <em>{user.email}</em>
          </div>
          <Link href={dashboardHref} className="signin-item" role="menuitem">
            <span className="signin-icon">
              <LayoutDashboard className="h-4 w-4" />
            </span>
            <span>
              <strong>Dashboard</strong>
              <em>
                {user.role === "recruiter"
                  ? "Manage hiring"
                  : "Your applications"}
              </em>
            </span>
          </Link>
          <button
            type="button"
            className="signin-item signin-item-btn"
            role="menuitem"
            onClick={handleLogout}
          >
            <span className="signin-icon recruiter">
              <LogOut className="h-4 w-4" />
            </span>
            <span>
              <strong>Logout</strong>
              <em>Sign out of Gemini Education and Careers</em>
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`${triggerClass} ${className}`}
      style={
        variant === "solid"
          ? {
              color: isJobsPage ? "#ffffff" : "#0000FF",
              borderColor: isJobsPage ? "#ffffff" : "#0000FF",
              background: isJobsPage ? "transparent" : "#ffffff",
            }
          : undefined
      }
      onClick={() => openAuth({ mode: "login", role: "user" })}
    >
      Sign in
    </button>
  );
}
