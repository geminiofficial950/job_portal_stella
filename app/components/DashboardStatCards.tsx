import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

export type DashboardStat = {
  label: string;
  value: string | number;
  href: string;
  icon: LucideIcon;
  actionIcon: LucideIcon;
  action: string;
};

const ACCENTS = [
  { chip: "#ecebff", icon: "#5850ec", bar: "#5850ec" },
  { chip: "#dcfce7", icon: "#16a34a", bar: "#22c55e" },
  { chip: "#fee2e2", icon: "#dc2626", bar: "#ef4444" },
  { chip: "#e0e7ff", icon: "#4338ca", bar: "#6366f1" },
];

export default function DashboardStatCards({
  stats,
  columns = 4,
}: {
  stats: DashboardStat[];
  columns?: 3 | 4;
}) {
  const grid =
    columns === 3
      ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      : "grid gap-3 sm:grid-cols-2 xl:grid-cols-4";

  return (
    <div className={grid}>
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        const accent = ACCENTS[i % ACCENTS.length];

        return (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-2xl border border-[#ebe9f5] bg-white px-4 py-3 shadow-[0_4px_14px_rgba(26,26,46,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(26,26,46,0.08)]"
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: accent.chip, color: accent.icon }}
              >
                <Icon className="h-4 w-4" strokeWidth={2.2} />
              </span>

              <p className="shrink-0 text-2xl font-black tracking-tight text-[#0f172a]">
                {stat.value}
              </p>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-[#6b7280]">
                  {stat.action}
                </p>
                <p className="truncate text-sm font-bold text-[#0f172a]">
                  {stat.label}
                </p>
              </div>

              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f4f3fb] text-[#94a3b8] transition-colors group-hover:bg-[#ecebff] group-hover:text-[#5850ec]">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#f1f0f8]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, 35 + (i + 1) * 15)}%`,
                  background: accent.bar,
                }}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
