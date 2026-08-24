"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  UserCog,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  {
    label: "Overview",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Users",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    label: "Recruiters",
    href: "/dashboard/admin/recruiters",
    icon: UserCog,
  },
  {
    label: "Companies",
    href: "/dashboard/admin/companies",
    icon: Building2,
  },
  {
    label: "Jobs",
    href: "/dashboard/admin/jobs",
    icon: Briefcase,
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-5 left-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#b91c1c] text-white shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-[#b91c1c]/35"
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed top-[68px] left-0 z-50 flex h-[calc(100vh-68px)] w-[260px] flex-col border-r border-[#e6eaf2] bg-white transition-transform duration-200 lg:sticky lg:top-[68px] lg:z-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#eef1f7] px-5 py-4 lg:hidden">
          <p className="text-sm font-semibold text-[#b91c1c]">Admin menu</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-[#6b7a9e] hover:bg-[#fef2f2]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="hidden border-b border-[#eef1f7] px-5 py-4 lg:block">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b7a9e]">
            <Shield className="h-3.5 w-3.5" />
            Platform control
          </p>
          <p className="mt-1 text-sm font-semibold text-[#b91c1c]">
            Admin panel
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors ${
                      active
                        ? "bg-[#fef2f2] text-[#b91c1c]"
                        : "text-[#4a5878] hover:bg-[#fef2f2] hover:text-[#b91c1c]"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        active
                          ? "bg-[#b91c1c] text-white"
                          : "bg-[#fef2f2] text-[#6b7a9e]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
