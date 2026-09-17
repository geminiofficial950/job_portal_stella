"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Ellipsis,
  X,
  ChevronRight,
  Home,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { DASH } from "@/app/lib/dashboardTheme";
import styles from "@/app/dashboard/seeker/seeker.module.css";
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

function GlassIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className={styles.mobileGlassIcon}>
      <Icon />
    </span>
  );
}

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
  /** Short items shown in the mobile bottom bar, before More. */
  mobileTabs?: DashNavItem[];
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
  mobileTabs,
  footer,
  sidebarClassName = "",
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const tabs =
    mobileTabs ??
    groups.flatMap((group) => group.items).slice(0, 3);
  const moreActive =
    open || !tabs.some((item) => isActive(pathname, item.href, item.exact));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
      <nav
        className={`${styles.mobileDock} lg:hidden`}
        style={{ gridTemplateColumns: `repeat(${tabs.length + 1}, minmax(0, 1fr))` }}
        aria-label="Mobile navigation"
      >
        {tabs.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={styles.mobileDockItem}
            >
              <GlassIcon icon={Icon} />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className={styles.mobileDockItem}
          data-open={open ? "true" : undefined}
        >
          <GlassIcon icon={open ? X : Ellipsis} />
          <span>{open ? "Close" : "More"}</span>
        </button>
      </nav>

      {open ? (
        <button
          type="button"
          className="fixed inset-x-0 top-0 z-40 bg-black/40 lg:hidden"
          style={{ bottom: "calc(86px + env(safe-area-inset-bottom))" }}
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
        />
      ) : null}

      {open ? (
        <div
          className={`${styles.mobileSheet} lg:hidden`}
          style={{ bottom: "calc(78px + env(safe-area-inset-bottom))" }}
          role="dialog"
          aria-label="More menu"
        >
          {groups.map((group) => (
            <div key={group.label} className="mb-4">
              <p className={styles.mobileSheetLabel}>{group.label}</p>
              <ul>
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={styles.mobileSheetLink}
                      >
                        <GlassIcon icon={Icon} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <div className={styles.mobileSheetFooter}>
            <Link href="/" onClick={() => setOpen(false)} className={styles.mobileSheetLink}>
              <GlassIcon icon={Home} />
              Home
            </Link>
            <button
              type="button"
              disabled={loggingOut}
              onClick={() => void handleLogout()}
              className={styles.mobileSheetLink}
            >
              <GlassIcon icon={LogOut} />
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
          </div>
        </div>
      ) : null}

      <aside
        className={`${sidebarClassName} hidden h-screen w-[250px] flex-col lg:sticky lg:top-0 lg:z-0 lg:flex ${
          sidebarClassName ? "" : "border-r border-white/5"
        }`}
        style={sidebarClassName ? undefined : { background: DASH.panel }}
      >
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
