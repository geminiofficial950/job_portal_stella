"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronRight,
  Home,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { DASH } from "@/app/lib/dashboardTheme";
import { useAuth } from "./AuthProvider";
import BrandLogo from "./BrandLogo";

export type DashNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  iconTone?: "sky" | "violet" | "amber" | "rose" | "emerald" | "orange" | "cyan" | "indigo";
};

export type DashNavGroup = {
  label: string;
  items: DashNavItem[];
};

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  brandEyebrow?: string;
  brandTitle?: string;
  brandIcon?: LucideIcon;
  /** Use the site BrandLogo instead of icon + title text */
  brandLogo?: boolean;
  groups: DashNavGroup[];
  footer?: React.ReactNode;
  sidebarClassName?: string;
  menuButtonClassName?: string;
};

export default function DashboardSidebarShell({
  brandEyebrow,
  brandTitle,
  brandIcon: BrandIcon,
  brandLogo = false,
  groups,
  footer,
  sidebarClassName = "",
  menuButtonClassName = "",
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
      setOpen(false);
    }
  }

  const brandMark = brandLogo ? (
    <Link
      href="/"
      aria-label="Gemini Jobs home"
      className="block min-w-0"
      onClick={() => setOpen(false)}
    >
      <BrandLogo className="sidebar-brand-logo" onDark />
    </Link>
  ) : (
    <>
      {BrandIcon ? (
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{ background: DASH.accent }}
        >
          <BrandIcon className="h-5 w-5" />
        </div>
      ) : null}
      <div>
        {brandEyebrow ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
            {brandEyebrow}
          </p>
        ) : null}
        {brandTitle ? (
          <p className="text-[14px] font-bold leading-tight text-white">
            {brandTitle}
          </p>
        ) : null}
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${menuButtonClassName} fixed bottom-5 left-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl lg:hidden`}
        style={{ background: DASH.accent }}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`${sidebarClassName} fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-col transition-transform duration-300 lg:sticky lg:z-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${sidebarClassName ? "" : "border-r border-white/5"}`}
        style={sidebarClassName ? undefined : { background: DASH.panel }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 lg:hidden">
          <div className="min-w-0 flex-1 pr-2">{brandMark}</div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          data-sidebar-brand
          data-brand-logo={brandLogo ? "true" : undefined}
          className={`hidden border-b border-white/10 px-5 lg:flex ${
            brandLogo ? "items-center py-2.5" : "items-center gap-3 py-5"
          }`}
        >
          {brandMark}
        </div>

        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label="Dashboard"
        >
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-2 px-3 text-[12px] font-bold uppercase tracking-[0.12em]">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        data-icon-tone={item.iconTone}
                        onClick={() => setOpen(false)}
                        className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-semibold transition-all ${
                          active
                            ? sidebarClassName
                              ? "text-inherit"
                              : "text-white"
                            : sidebarClassName
                              ? "text-inherit hover:bg-white/10"
                              : "text-white/55 hover:bg-white/5 hover:text-white"
                        }`}
                        style={
                          active && !sidebarClassName
                            ? { background: DASH.accent }
                            : undefined
                        }
                      >
                        <span
                          className={`flex shrink-0 items-center justify-center ${
                            sidebarClassName
                              ? "h-[34px] w-[34px] rounded-[12px] text-inherit"
                              : `h-8 w-8 rounded-xl ${
                                  active
                                    ? "bg-white/20 text-white"
                                    : "bg-white/5 text-white/70"
                                }`
                          }`}
                        >
                          <Icon
                            className={sidebarClassName ? "h-4 w-4" : "h-[15px] w-[15px]"}
                            strokeWidth={sidebarClassName ? 1.75 : 2.1}
                          />
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {active ? (
                          <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div
          data-sidebar-footer
          className="space-y-2 border-t border-white/10 px-3 py-4"
        >
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-semibold text-white/70 transition-all hover:bg-white/5 hover:text-white"
          >
            <span className={`flex shrink-0 items-center justify-center ${sidebarClassName ? "h-[34px] w-[34px] rounded-[12px]" : "h-8 w-8 rounded-xl bg-white/5 text-white/80"}`}>
              <Home className={sidebarClassName ? "h-4 w-4" : "h-[15px] w-[15px]"} strokeWidth={sidebarClassName ? 1.75 : 2} />
            </span>
            Home
          </Link>
          <button
            type="button"
            disabled={loggingOut}
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[13.5px] font-semibold text-[#fca5a5] transition-all hover:bg-[#ef4444]/15 hover:text-white disabled:opacity-60"
          >
            <span className={`flex shrink-0 items-center justify-center ${sidebarClassName ? "h-[34px] w-[34px] rounded-[12px]" : "h-8 w-8 rounded-xl bg-[#ef4444]/20 text-[#fecaca]"}`}>
              <LogOut className={sidebarClassName ? "h-4 w-4" : "h-[15px] w-[15px]"} strokeWidth={sidebarClassName ? 1.75 : 2} />
            </span>
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
          {footer}
        </div>
      </aside>
    </>
  );
}
