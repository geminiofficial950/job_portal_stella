"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  FileText,
  Bookmark,
  CalendarCheck,
  UserRound,
  Settings,
  Menu,
  X,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  {
    label: "Overview",
    href: "/dashboard/seeker",
    icon: LayoutDashboard,
    exact: true,
    iconBg: "bg-[#64748b]",
    activeBg: "bg-[#f1f5f9]",
    activeText: "text-[#0f172a]",
    activeBorder: "border-l-[#dc2626]",
    hoverBg: "hover:bg-[#f1f5f9]",
  },
  {
    label: "Find Jobs",
    href: "/dashboard/seeker/jobs",
    icon: Search,
    iconBg: "bg-[#64748b]",
    activeBg: "bg-[#f1f5f9]",
    activeText: "text-[#0f172a]",
    activeBorder: "border-l-[#dc2626]",
    hoverBg: "hover:bg-[#f1f5f9]",
  },
  {
    label: "Applications",
    href: "/dashboard/seeker/applications",
    icon: FileText,
    iconBg: "bg-[#64748b]",
    activeBg: "bg-[#f1f5f9]",
    activeText: "text-[#0f172a]",
    activeBorder: "border-l-[#dc2626]",
    hoverBg: "hover:bg-[#f1f5f9]",
  },
  {
    label: "Saved Jobs",
    href: "/dashboard/seeker/saved",
    icon: Bookmark,
    iconBg: "bg-[#64748b]",
    activeBg: "bg-[#f1f5f9]",
    activeText: "text-[#0f172a]",
    activeBorder: "border-l-[#dc2626]",
    hoverBg: "hover:bg-[#f1f5f9]",
  },
  {
    label: "Interviews",
    href: "/dashboard/seeker/interviews",
    icon: CalendarCheck,
    iconBg: "bg-[#64748b]",
    activeBg: "bg-[#f1f5f9]",
    activeText: "text-[#0f172a]",
    activeBorder: "border-l-[#dc2626]",
    hoverBg: "hover:bg-[#f1f5f9]",
  },
  {
    label: "Profile",
    href: "/dashboard/seeker/profile",
    icon: UserRound,
    iconBg: "bg-[#64748b]",
    activeBg: "bg-[#f1f5f9]",
    activeText: "text-[#0f172a]",
    activeBorder: "border-l-[#dc2626]",
    hoverBg: "hover:bg-[#f1f5f9]",
  },
  {
    label: "Settings",
    href: "/dashboard/seeker/settings",
    icon: Settings,
    iconBg: "bg-[#64748b]",
    activeBg: "bg-[#f1f5f9]",
    activeText: "text-[#0f172a]",
    activeBorder: "border-l-[#dc2626]",
    hoverBg: "hover:bg-[#f1f5f9]",
  },
];

const groups = [
  { label: "Main Menu", items: menuItems.slice(0, 2) },
  { label: "Career", items: menuItems.slice(2, 5) },
  { label: "Account", items: menuItems.slice(5) },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SeekerSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile FAB */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-5 left-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#64748b] text-white shadow-xl hover:scale-110 transition-transform"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-[68px] left-0 z-50 flex h-[calc(100vh-68px)] w-[240px] flex-col bg-white border-r border-[#f0f0f5] transition-transform duration-300 lg:sticky lg:top-[68px] lg:z-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f5] lg:hidden">
          <p className="text-sm font-bold text-[#1e293b]">Career Menu</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-[#6b7a9e] hover:bg-[#f1f5f9]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex items-center gap-3 px-5 py-5 border-b border-[#f0f0f5]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#475569] shadow-none shrink-0">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9aa3b8]">
              Career Workspace
            </p>
            <p className="text-[13px] font-bold text-[#1e293b] leading-tight">
              Job Seeker Panel
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Seeker">
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b0bad0]">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl border-l-2 px-3 py-2.5 text-[13.5px] font-semibold transition-all duration-150 ${
                          active
                            ? `${item.activeBg} ${item.activeText} border-l-[3px] ${item.activeBorder}`
                            : `border-transparent text-[#5a6a8a] ${item.hoverBg} hover:text-[#0f172a]`
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm ${active ? "bg-[#dc2626] text-white" : "bg-[#e2e8f0] text-[#475569]"} ${
                            active
                              ? "shadow-md scale-105"
                              : "opacity-80 group-hover:opacity-100 group-hover:scale-105"
                          } transition-all duration-150`}
                        >
                          <Icon className="h-[15px] w-[15px]" />
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {active && (
                          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

      </aside>
    </>
  );
}
