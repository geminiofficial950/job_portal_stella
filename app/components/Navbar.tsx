"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { toast } from "react-toastify";
import SignInMenu from "./SignInMenu";
import { useAuth } from "./AuthProvider";
import { useAuthModal } from "./AuthModalProvider";
import { BENEFIT_CARDS } from "@/lib/stellaContent";

const careerSupportLinks = BENEFIT_CARDS.map((c) => ({
  name: c.title,
  href: c.href,
}));

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { openAuth } = useAuthModal();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [careerOpen, setCareerOpen] = useState(false);
  const [mobileCareerOpen, setMobileCareerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const careerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setCareerOpen(false);
    setMobileCareerOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!careerRef.current?.contains(e.target as Node)) setCareerOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
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
  const isJobsPage = pathname === "/jobs" || pathname.startsWith("/jobs/");
  const isLearningPage =
    pathname.startsWith("/masterclasses") ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/events") ||
    pathname.startsWith("/verification") ||
    pathname.startsWith("/employers") ||
    pathname.startsWith("/profile");
  const isDarkNav = pathname === "/" || isJobsPage || isLearningPage;

  const linkClass = (active?: boolean) =>
    `relative flex items-center h-full px-3 text-sm font-medium transition-colors duration-150 ${
      isDarkNav
        ? "text-white hover:text-white"
        : active
          ? "text-[#00082C]"
          : "text-slate-500 hover:text-[#00082C]"
    }`;

  return (
    <header
      className={`w-full sticky top-0 z-50 overflow-visible ${isDarkNav ? "" : "transition-all duration-300"}`}
      style={{
        background: isDarkNav ? "#00082C" : "rgba(255,255,255,0.97)",
        backdropFilter: isDarkNav ? "none" : "blur(16px)",
        borderBottom: isDarkNav
          ? "none"
          : scrolled
            ? "1px solid rgba(226,232,240,0.9)"
            : "1px solid rgba(226,232,240,0.5)",
        boxShadow: isDarkNav
          ? "none"
          : scrolled
            ? "0 2px 20px rgba(0,0,0,0.06)"
            : "none",
      }}
    >
      <div className="w-full px-4 sm:px-6 md:px-7 xl:px-10 2xl:px-12">
        <div className="relative flex w-full items-center justify-between h-12 sm:h-14 overflow-visible">
          <Link
            href="/"
            className="relative z-10 flex h-full min-h-0 shrink-0 items-center overflow-visible select-none group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logonew.jpeg"
              alt="Stella Careers"
              className="pointer-events-none h-8 sm:h-9 w-auto max-w-[min(55vw,320px)] origin-left scale-[1.45] sm:scale-[1.55] object-contain object-left transition-transform duration-200 group-hover:scale-[1.5] sm:group-hover:scale-[1.6]"
            />
          </Link>

          <div className="relative z-10 ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
            <nav className="hidden lg:flex items-center gap-0.5">
              <Link
                href="/jobs"
                className={linkClass(pathname === "/jobs")}
                style={isDarkNav ? { color: "#ffffff" } : undefined}
              >
                Find Jobs
              </Link>

              <div className="relative" ref={careerRef}>
                <button
                  type="button"
                  onClick={() => setCareerOpen((v) => !v)}
                  className={`${linkClass()} gap-1`}
                  style={isDarkNav ? { color: "#ffffff" } : undefined}
                  aria-expanded={careerOpen}
                >
                  Career Support
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${careerOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {careerOpen && (
                  <div className="absolute left-0 top-full mt-1 w-72 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
                    {careerSupportLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setCareerOpen(false)}
                        className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#00082C]"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/employers"
                className={linkClass(pathname === "/employers")}
                style={isDarkNav ? { color: "#ffffff" } : undefined}
              >
                For Employers
              </Link>
            </nav>

            <Link
              href="/profile/setup"
              className={`hidden sm:inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isDarkNav
                  ? "bg-white text-[#00082C] hover:bg-white/90"
                  : "bg-[#00082C] text-white hover:bg-[#00061F]"
              }`}
            >
              Build my free profile
            </Link>

            {user?.role === "recruiter" && (
              <Link
                href="/dashboard/recruiter/jobs/new"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#00082C] hover:bg-[#00061F] transition-colors"
                style={
                  isDarkNav
                    ? { background: "#ffffff", color: "#00082C" }
                    : undefined
                }
              >
                Post a job
              </Link>
            )}

            <SignInMenu
              variant="solid"
              className={
                isDarkNav
                  ? "text-white border-white hover:bg-white/10 hover:border-white"
                  : ""
              }
            />

            <button
              type="button"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={`lg:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                isDarkNav
                  ? "text-white hover:bg-white/10"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
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

      {isMobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-0.5 max-h-[80vh] overflow-y-auto">
          <Link
            href="/jobs"
            onClick={() => setIsMobileOpen(false)}
            className="flex w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Find Jobs
          </Link>
          <button
            type="button"
            onClick={() => setMobileCareerOpen((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Career Support
            <ChevronDown
              className={`h-4 w-4 transition-transform ${mobileCareerOpen ? "rotate-180" : ""}`}
            />
          </button>
          {mobileCareerOpen &&
            careerSupportLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="ms-2 flex w-full px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
              >
                {link.name}
              </Link>
            ))}
          <Link
            href="/employers"
            onClick={() => setIsMobileOpen(false)}
            className="flex w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            For Employers
          </Link>
          <Link
            href="/profile/setup"
            onClick={() => setIsMobileOpen(false)}
            className="flex w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-[#00082C] bg-[#f0f4ff]"
          >
            Build my free profile
          </Link>
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
              <button
                type="button"
                onClick={() => {
                  setIsMobileOpen(false);
                  openAuth({ mode: "login", role: "user" });
                }}
                className="flex w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#eef2f7] text-left"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
