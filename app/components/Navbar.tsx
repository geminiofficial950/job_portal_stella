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
  const [darkSurface, setDarkSurface] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const isHome = pathname === "/";
  const careerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const updateSurface = () => {
      frame = 0;
      setScrolled(window.scrollY > 8);
      const sampleY = (headerRef.current?.getBoundingClientRect().height ?? 72) / 2;
      // Explicit section themes also work for gradients and photographic backgrounds.
      const sections = document.querySelectorAll<HTMLElement>("[data-nav-theme]");
      let dark = false;
      for (const section of sections) {
        const bounds = section.getBoundingClientRect();
        if (bounds.top <= sampleY && bounds.bottom > sampleY) {
          dark = section.dataset.navTheme === "dark";
        }
      }
      setDarkSurface(dark);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateSurface);
    };
    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(document.body);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      observer.disconnect();
    };
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

  const linkClass = (active?: boolean) =>
    `navbar-link relative flex items-center h-full px-3 text-sm font-medium transition-colors duration-150 ${active ? "navbar-link--active" : ""}`;

  return (
    <header
      ref={headerRef}
      className={`site-navbar w-full sticky top-0 z-50 overflow-visible ${isHome ? "site-navbar--home" : ""}`}
      data-scrolled={scrolled}
      data-tone={darkSurface ? "dark" : "light"}
    >
      <div className="w-full px-3 sm:px-6 md:px-7 xl:px-10 2xl:px-12">
        <div className="relative flex w-full items-center gap-2 h-16 sm:h-[4.5rem] overflow-visible">
          <Link
            href="/"
            className="relative z-10 flex h-full min-h-0 min-w-0 flex-1 items-center overflow-visible select-none group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Geminijobscomblack.png"
              alt="Gemini Jobs"
              className="navbar-logo pointer-events-none h-12 w-auto max-w-[300px] object-contain object-left transition-transform duration-200 sm:h-14 sm:max-w-[360px] sm:group-hover:scale-[1.03] md:h-16 md:max-w-[420px]"
            />
          </Link>

          <div className="relative z-20 flex shrink-0 items-center gap-1 sm:gap-2 md:gap-3">
            <nav className="hidden lg:flex items-center gap-0.5">
              <Link
                href="/jobs"
                className={linkClass(pathname === "/jobs")}
              >
                Find Jobs
              </Link>

              <div className="relative" ref={careerRef}>
                <button
                  type="button"
                  onClick={() => setCareerOpen((v) => !v)}
                  className={`${linkClass()} gap-1`}
                  aria-expanded={careerOpen}
                >
                  Career Support
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${careerOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {careerOpen && (
                  <div className="absolute left-0 top-full mt-1 w-72 rounded-xl border border-slate-200 bg-white/95 py-2 shadow-lg backdrop-blur-xl">
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
              >
                For Employers
              </Link>
            </nav>

            <Link
              href="/profile/setup"
              className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-semibold bg-[#4f6cf5] text-white hover:bg-[#3f5ce8] transition-colors"
            >
              Build my free profile
            </Link>

            {user?.role === "recruiter" && (
              <Link
                href="/dashboard/recruiter/jobs/new"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#4f6cf5] hover:bg-[#3f5ce8] transition-colors"
              >
                Post a job
              </Link>
            )}

            <SignInMenu variant="solid" tone={darkSurface ? "dark" : "light"} className="navbar-account" />

            <button
              type="button"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="navbar-menu-toggle lg:hidden w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMobileOpen}
              aria-controls="navbar-mobile-menu"
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
        <div id="navbar-mobile-menu" className="absolute top-full inset-x-0 lg:hidden border-t border-slate-100 bg-white/95 px-4 py-3 space-y-0.5 max-h-[80vh] overflow-y-auto backdrop-blur-xl">
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
            className="flex w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#4f6cf5] hover:bg-[#3f5ce8]"
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
