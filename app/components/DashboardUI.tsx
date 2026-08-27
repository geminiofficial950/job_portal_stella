import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { DASH } from "@/app/lib/dashboardTheme";

type Props = {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function DashboardPageHeader({
  title,
  subtitle,
  backHref,
  action,
}: Omit<Props, "children">) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#ebe9f5] bg-white text-[#64748b] shadow-sm hover:text-[#5850ec]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        ) : null}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-[28px]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 max-w-xl text-sm text-[#6b7280]">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function DashboardDarkPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[28px] p-4 sm:p-5 ${className}`}
      style={{ background: DASH.panel }}
    >
      {children}
    </section>
  );
}

export function DashboardSoftPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[24px] p-4 sm:p-5 ${className}`}
      style={{ background: DASH.accentSoft }}
    >
      {children}
    </div>
  );
}

export function DashboardPrimaryButton({
  href,
  children,
  icon: Icon,
}: {
  href: string;
  children: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(88,80,236,0.35)] transition-transform hover:scale-[1.02]"
      style={{ background: DASH.accent }}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </Link>
  );
}
