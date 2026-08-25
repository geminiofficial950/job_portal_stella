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

const THEMES = [
  {
    top: "bg-gradient-to-br from-[#dbe4ff] via-[#e8eeff] to-[#c7d2fe]",
    iconBg: "bg-white/70 text-[#4338ca]",
    number: "text-[#312e81]",
  },
  {
    top: "bg-gradient-to-br from-[#1e3a5f] via-[#243b6b] to-[#0f2744]",
    iconBg: "bg-white/15 text-white",
    number: "text-white",
  },
  {
    top: "bg-gradient-to-br from-[#fce7f3] via-[#fdf2f8] to-[#fbcfe8]",
    iconBg: "bg-white/70 text-[#be185d]",
    number: "text-[#9d174d]",
  },
  {
    top: "bg-gradient-to-br from-[#ccfbf1] via-[#f0fdfa] to-[#99f6e4]",
    iconBg: "bg-white/70 text-[#0f766e]",
    number: "text-[#115e59]",
  },
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
        const theme = THEMES[i % THEMES.length];

        return (
          <Link
            key={stat.label}
            href={stat.href}
            className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_16px_rgba(15,39,68,0.06)] ring-1 ring-[#e8ecf2] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,39,68,0.1)]"
          >
            <div className={`relative ${theme.top} px-4 pb-3 pt-3.5`}>
              <div className="relative z-[1] flex items-center justify-between gap-2">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${theme.iconBg} shadow-sm`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${theme.iconBg} opacity-80 transition-transform duration-200 group-hover:rotate-45`}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>

              <p
                className={`relative z-[1] mt-3 text-3xl font-black tracking-tight ${theme.number}`}
              >
                {stat.value}
              </p>
            </div>

            <div className="bg-white px-4 py-2.5">
              <p className="truncate text-[11px] font-medium text-[#94a3b8]">
                {stat.action} →
              </p>
              <p className="mt-0.5 truncate text-sm font-bold tracking-tight text-[#0f172a]">
                {stat.label}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
