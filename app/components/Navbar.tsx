"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { toast } from "react-toastify";
import SignInMenu from "./SignInMenu";
import { useAuth } from "./AuthProvider";

const navLinks = [
  { name: "Find Jobs", href: "/jobs" },
  { name: "Recruiters", href: "/recruiters" },
  { name: "People Search", href: "#" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
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

  return (
    <header
      className="w-full sticky top-0 z-50 transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(16px)",
        borderBottom: scrolled
          ? "1px solid rgba(226,232,240,0.9)"
          : "1px solid rgba(226,232,240,0.5)",
        boxShadow: scrolled
          ? "0 2px 20px rgba(0,0,0,0.06)"
          : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px]">

          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-8 lg:gap-10">
            {/* Logo */}
            <Link href="/" className="flex items-center select-none group shrink-0">
              <img
                src="/logo.webp"
                alt="Stella Incline logo"
                className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.04]"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 h-[68px]">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative flex items-center h-full px-3.5 text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? "text-[#b91c1c]"
                        : "text-slate-500 hover:text-[#dc2626]"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#dc2626] rounded-t-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Post a Job + Log In + Hamburger */}
          <div className="flex items-center gap-2.5">

            <SignInMenu variant="solid" />

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
                    ? "bg-slate-50 text-slate-900 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
                  className="flex w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#fef2f2]"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#fef2f2] text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login?role=user"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#fef2f2]"
                >
                  Sign in as job seeker
                </Link>
                <Link
                  href="/login?role=recruiter"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#fef2f2]"
                >
                  Sign in as recruiter
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
