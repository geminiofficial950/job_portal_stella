"use client";

import { useState } from "react";
import {
  MapPin,
  Eye,
  Bookmark,
  MoreVertical,
  Trash2,
  Building2,
} from "lucide-react";

export type RecruiterJobCardData = {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  category?: string;
  status: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: string;
  createdAt: string | null;
  appliedCount?: number;
  company?: {
    name: string;
    logoUrl?: string;
  } | null;
};

function timeAgo(iso: string | null) {
  if (!iso) return "Recently";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

function formatType(type: string) {
  return type
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("-");
}

function formatSalary(job: RecruiterJobCardData) {
  const currency = job.salaryCurrency || "AUD";
  const period = job.salaryPeriod || "year";
  const amount = Math.round(job.salaryMax || job.salaryMin);
  if (amount >= 1000) {
    const k = amount / 1000;
    const label = Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`;
    return { amount: `${currency === "AUD" ? "$" : `${currency} `}${label}`, period: `/ ${period}` };
  }
  return {
    amount: `${currency === "AUD" ? "$" : `${currency} `}${amount.toLocaleString()}`,
    period: `/ ${period}`,
  };
}

type Props = {
  job: RecruiterJobCardData;
  onDelete?: (id: string) => void;
  deleting?: boolean;
  compact?: boolean;
};

export default function RecruiterJobCard({
  job,
  onDelete,
  deleting,
  compact = false,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const companyName = job.company?.name || "Your company";
  const logoUrl = job.company?.logoUrl || "";
  const salary = formatSalary(job);
  const applied = job.appliedCount ?? 0;
  const team = job.category || "General";

  return (
    <article
      className={`flex gap-4 rounded-2xl border border-[#e8ecf3] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#ede9fe]">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={companyName}
            className="h-full w-full object-cover"
          />
        ) : (
          <Building2 className="h-6 w-6 text-[#1e3a5f]" />
        )}
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-bold text-[#0f172a]">
              {companyName}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-sm text-[#475569]">
              {job.title}
            </p>
          </div>

          <div className="relative flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setBookmarked((v) => !v)}
              className={`rounded-lg p-2 transition-colors ${
                bookmarked
                  ? "text-[#1e3a5f]"
                  : "text-[#94a3b8] hover:bg-[#f8fafc] hover:text-[#64748b]"
              }`}
              aria-label="Bookmark"
            >
              <Bookmark
                className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`}
              />
            </button>
            {onDelete ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="rounded-lg p-2 text-[#94a3b8] transition-colors hover:bg-[#f8fafc] hover:text-[#64748b]"
                  aria-label="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menuOpen ? (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-10 cursor-default"
                      aria-label="Close menu"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-xl border border-[#e2e8f0] bg-white py-1 shadow-lg">
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(job.id);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-[#dc2626] hover:bg-[#fef2f2] disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete job
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#64748b]">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-[#94a3b8]" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-[#94a3b8]" />
            {Math.max(applied * 4, applied)} views
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#64748b]">
          <span>{timeAgo(job.createdAt)}</span>
          <span className="text-[#cbd5e1]">•</span>
          <span>{formatType(job.employmentType)}</span>
          <span className="text-[#cbd5e1]">•</span>
          <span>
            {applied} applied
          </span>
          <span className="text-[#cbd5e1]">•</span>
          <span className="capitalize">{job.status}</span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3 sm:hidden">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#94a3b8]">
              Team
            </p>
            <p className="text-xs font-medium text-[#334155]">{team}</p>
          </div>
          <p className="text-sm font-bold text-[#0f172a]">
            {salary.amount}
            <span className="ml-1 text-[11px] font-medium text-[#94a3b8]">
              {salary.period}
            </span>
          </p>
        </div>
      </div>

      {/* Right meta */}
      <div className="hidden w-[150px] shrink-0 flex-col items-end justify-between text-right sm:flex">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#94a3b8]">
            Team
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs font-medium text-[#334155]">
            {team}
          </p>
        </div>
        <div className="mt-4">
          <p className="text-base font-bold text-[#0f172a]">
            {salary.amount}
            <span className="ml-1 text-xs font-medium text-[#94a3b8]">
              {salary.period}
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}
