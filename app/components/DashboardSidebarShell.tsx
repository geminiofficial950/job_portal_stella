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

export type DashNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
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
  brandEyebrow: string;
  brandTitle: string;
  brandIcon: LucideIcon;
  groups: DashNavGroup[];
  footer?: React.ReactNode;
};

export default function DashboardSidebarShell({
  brandEyebrow,
  brandTitle,
  brandIcon: BrandIcon,
  groups,
  footer,
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl lg:hidden"
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
        className={`fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-col border-r border-white/5 transition-transform duration-300 lg:sticky lg:z-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: DASH.panel }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 lg:hidden">
          <p className="text-sm font-bold text-white">{brandTitle}</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="hidden items-center gap-3 border-b border-white/10 px-5 py-5 lg:flex">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white"
            style={{ background: DASH.accent }}
          >
            <BrandIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              {brandEyebrow}
            </p>
            <p className="text-[14px] font-bold leading-tight text-white">
              {brandTitle}
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Dashboard">
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
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
                        onClick={() => setOpen(false)}
                        className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-semibold transition-all ${
                          active
                            ? "text-white"
                            : "text-white/55 hover:bg-white/5 hover:text-white"
                        }`}
                        style={
                          active ? { background: DASH.accent } : undefined
                        }
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-white/5 text-white/70"
                          }`}
                        >
                          <Icon className="h-[15px] w-[15px]" />
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

        <div className="space-y-2 border-t border-white/10 px-3 py-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-semibold text-white/70 transition-all hover:bg-white/5 hover:text-white"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/80">
              <Home className="h-[15px] w-[15px]" />
            </span>
            Home
          </Link>
          <button
            type="button"
            disabled={loggingOut}
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[13.5px] font-semibold text-[#fca5a5] transition-all hover:bg-[#ef4444]/15 hover:text-white disabled:opacity-60"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#ef4444]/20 text-[#fecaca]">
              <LogOut className="h-[15px] w-[15px]" />
            </span>
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
          {footer}
        </div>
      </aside>
    </>
  );
}
