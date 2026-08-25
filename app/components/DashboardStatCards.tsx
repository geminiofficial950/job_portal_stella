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
    // soft lavender
    top: "bg-gradient-to-br from-[#dbe4ff] via-[#e8eeff] to-[#c7d2fe]",
    blob: "bg-[#a5b4fc]/50",
    accent: "bg-[#6366f1]/20",
    iconBg: "bg-white/70 text-[#4338ca]",
    number: "text-[#312e81]",
  },
  {
    // navy
    top: "bg-gradient-to-br from-[#1e3a5f] via-[#243b6b] to-[#0f2744]",
    blob: "bg-white/10",
    accent: "bg-white/15",
    iconBg: "bg-white/15 text-white",
    number: "text-white",
  },
  {
    // soft rose
    top: "bg-gradient-to-br from-[#fce7f3] via-[#fdf2f8] to-[#fbcfe8]",
    blob: "bg-[#f9a8d4]/45",
    accent: "bg-[#f472b6]/20",
    iconBg: "bg-white/70 text-[#be185d]",
    number: "text-[#9d174d]",
  },
  {
    // soft mint / teal
    top: "bg-gradient-to-br from-[#ccfbf1] via-[#f0fdfa] to-[#99f6e4]",
    blob: "bg-[#5eead4]/45",
    accent: "bg-[#2dd4bf]/20",
    iconBg: "bg-white/70 text-[#0f766e]",
    number: "text-[#115e59]",
  },
];

function DecorShapes({ themeIndex }: { themeIndex: number }) {
  const isNavy = themeIndex === 1;
  const line = isNavy ? "bg-white/20" : "bg-black/10";
  const soft = isNavy ? "bg-white/10" : "bg-black/5";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={`absolute -right-6 -top-8 h-28 w-28 rounded-full ${THEMES[themeIndex].blob} blur-2xl`} />
      <div className={`absolute -bottom-10 left-6 h-24 w-24 rounded-full ${THEMES[themeIndex].accent} blur-xl`} />
      {/* abstract UI blocks */}
      <div className={`absolute right-5 top-5 h-10 w-16 rounded-lg ${soft}`} />
      <div className={`absolute right-8 top-8 h-2 w-10 rounded-full ${line}`} />
      <div className={`absolute right-8 top-12 h-2 w-7 rounded-full ${line}`} />
      <div className={`absolute bottom-10 left-5 h-8 w-8 rounded-full ${soft}`} />
      <div className={`absolute bottom-8 right-10 h-3 w-12 rounded-md ${line}`} />
    </div>
  );
}

export default function DashboardStatCards({
  stats,
  columns = 4,
}: {
  stats: DashboardStat[];
  columns?: 3 | 4;
}) {
  const grid =
    columns === 3
      ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      : "grid gap-5 sm:grid-cols-2 xl:grid-cols-4";

  return (
    <div className={grid}>
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        const theme = THEMES[i % THEMES.length];

        return (
          <Link
            key={stat.label}
            href={stat.href}
            className="group flex flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_8px_30px_rgba(15,39,68,0.08)] ring-1 ring-[#e8ecf2] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,39,68,0.12)]"
          >
            {/* Colored top panel */}
            <div className={`relative min-h-[148px] flex-1 ${theme.top} px-5 pb-5 pt-5`}>
              <DecorShapes themeIndex={i % THEMES.length} />

              <div className="relative z-[1] flex items-start justify-between">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${theme.iconBg} shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${theme.iconBg} opacity-80 transition-transform duration-300 group-hover:rotate-45`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>

              <p
                className={`relative z-[1] mt-8 text-5xl font-black tracking-tight ${theme.number}`}
              >
                {stat.value}
              </p>
            </div>

            {/* White bottom strip */}
            <div className="flex items-end justify-between gap-3 bg-white px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-[#94a3b8]">
                  {stat.action} →
                </p>
                <p className="mt-0.5 truncate text-[17px] font-bold tracking-tight text-[#0f172a]">
                  {stat.label}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
