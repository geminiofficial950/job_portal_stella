"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { toast } from "react-toastify";
import SignInMenu from "./SignInMenu";
import { useAuth } from "./AuthProvider";
import { useAuthModal } from "./AuthModalProvider";

const navLinks = [
  { name: "Find Jobs", href: "/jobs" },
  // { name: "Recruiters", href: "/recruiters" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { openAuth } = useAuthModal();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    await logout();
    toast.success("Logged out");
    setIsMobileOpen(false);
    router.push("/");
    router.refresh();
  }

  const dashboardHref =
    user?.role === "recruiter"
      ? "/dashboard/recruiter"
      : user?.role === "admin"
        ? "/dashboard/admin"
        : "/dashboard/seeker";
  const isJobsPage = pathname === "/jobs";

  return (
    <header
      className={`w-full sticky top-0 z-50 ${isJobsPage ? "" : "transition-all duration-300"}`}
      style={{
        background: isJobsPage ? "#0000B8" : "rgba(255,255,255,0.97)",
        backdropFilter: "blur(16px)",
        borderBottom: isJobsPage
          ? "1px solid #0000B8"
          : scrolled
            ? "1px solid rgba(226,232,240,0.9)"
            : "1px solid rgba(226,232,240,0.5)",
        boxShadow: isJobsPage
          ? "none"
          : scrolled
            ? "0 2px 20px rgba(0,0,0,0.06)"
            : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-12 sm:h-14">
          {/* Left: Logo */}
          <Link
            href="/"
            className="relative z-10 flex items-center select-none group shrink-0"
          >
            <img
              src="/logo.webp"
              alt="Gemini Education and Careers logo"
              className="h-7 sm:h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.04]"
            />
          </Link>

          {/* Right: Find Jobs + Post a Job + Sign In + Hamburger */}
          <div className="relative z-10 flex items-center gap-1 sm:gap-2.5">
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    style={
                      isJobsPage
                        ? { color: "#ffffff" }
                        : isActive
                          ? { color: "#0000FF" }
                          : undefined
                    }
                    className={`relative flex items-center h-full px-3.5 text-sm font-medium transition-colors duration-150 ${
                      isJobsPage
                        ? "text-white hover:text-white"
                        : isActive
                        ? "text-[#0000FF]"
                        : "text-slate-500 hover:text-[#0000FF]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {user?.role === "recruiter" && (
              <Link
                href="/dashboard/recruiter/jobs/new"
                style={
                  isJobsPage
                    ? { background: "#ffffff", color: "#0000FF" }
                    : { background: "#0000FF" }
                }
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#0000FF] hover:bg-[#0000CC] transition-colors"
              >
                Post a job
              </Link>
            )}

            <SignInMenu
              variant="solid"
              className={
                isJobsPage
                  ? "text-white border-white hover:bg-white/10 hover:border-white"
                  : ""
              }
            />

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-0.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#f0f4ff] text-[#0000FF] font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#0000FF]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setIsMobileOpen(false)}
                  className="flex w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#eef2f7]"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#eef2f7] text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileOpen(false);
                    openAuth({ mode: "login", role: "user" });
                  }}
                  className="flex w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#eef2f7] text-left"
                >
                  Sign in as job seeker
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileOpen(false);
                    openAuth({ mode: "login", role: "recruiter" });
                  }}
                  className="flex w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#eef2f7] text-left"
                >
                  Sign in as recruiter
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
