import Link from "next/link";
import {
  Building2,
  Clock3,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import type { RecruiterCompanyAccess } from "@/lib/recruiterCompanyAccess";

const COPY = {
  missing: {
    title: "Complete your company profile",
    body: "Add your business details so our team can review your account. Hiring tools stay locked until an admin approves your company.",
    cta: "Fill company profile",
  },
  pending: {
    title: "Approval in progress",
    body: "Thanks for submitting your company profile. An admin is reviewing it now. You can update your details anytime, but posting jobs and managing candidates unlocks after approval.",
    cta: "Review company profile",
  },
  rejected: {
    title: "Profile needs attention",
    body: "Your company profile wasn’t approved. Please update your information and resubmit so we can review it again.",
    cta: "Update company profile",
  },
} as const;

export function recruiterLockCopy(access: RecruiterCompanyAccess) {
  if (!access.hasCompany) return COPY.missing;
  if (access.status === "rejected") return COPY.rejected;
  return COPY.pending;
}

/** Compact banner shown across the recruiter panel when not approved. */
export function RecruiterApprovalBanner({
  access,
}: {
  access: RecruiterCompanyAccess;
}) {
  if (access.approved) return null;
  const copy = recruiterLockCopy(access);
  const isRejected = access.status === "rejected";

  return (
    <div
      className={`border-b px-5 py-3 sm:px-8 lg:px-10 ${
        isRejected
          ? "border-[#fecaca] bg-[#fef2f2]"
          : "border-[#fde68a] bg-[#fffbeb]"
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
              isRejected
                ? "bg-[#fee2e2] text-[#b91c1c]"
                : "bg-[#fef3c7] text-[#b45309]"
            }`}
          >
            {isRejected ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Clock3 className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0">
            <p
              className={`text-sm font-bold ${
                isRejected ? "text-[#991b1b]" : "text-[#92400e]"
              }`}
            >
              {copy.title}
            </p>
            <p
              className={`mt-0.5 text-sm leading-relaxed ${
                isRejected ? "text-[#b91c1c]/90" : "text-[#a16207]"
              }`}
            >
              {copy.body}
              {isRejected && access.rejectionReason
                ? ` Reason: ${access.rejectionReason}`
                : ""}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/recruiter/company"
          className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white ${
            isRejected
              ? "bg-[#dc2626] hover:bg-[#b91c1c]"
              : "bg-[#d97706] hover:bg-[#b45309]"
          }`}
        >
          {copy.cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

/** Full-page lock when recruiter tries hiring tools before approval. */
export default function RecruiterLockedPanel({
  access,
}: {
  access: RecruiterCompanyAccess;
}) {
  const copy = recruiterLockCopy(access);
  const isRejected = access.status === "rejected";
  const isMissing = !access.hasCompany;

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 lg:px-10">
      <div className="rounded-[28px] border border-[#ebe9f5] bg-white p-8 text-center shadow-[0_12px_40px_-24px_rgba(26,26,46,0.35)] sm:p-10">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white ${
            isRejected
              ? "bg-[#dc2626]"
              : isMissing
                ? "bg-[#5850ec]"
                : "bg-[#d97706]"
          }`}
        >
          {isRejected ? (
            <AlertCircle className="h-7 w-7" />
          ) : isMissing ? (
            <Building2 className="h-7 w-7" />
          ) : (
            <ShieldCheck className="h-7 w-7" />
          )}
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-[#0f172a]">
          {copy.title}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#64748b]">
          {copy.body}
        </p>
        {isRejected && access.rejectionReason ? (
          <p className="mx-auto mt-3 max-w-lg rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]">
            {access.rejectionReason}
          </p>
        ) : null}

        <div className="mx-auto mt-6 grid max-w-md gap-2 text-left text-sm text-[#475569]">
          <div className="flex items-start gap-2 rounded-xl bg-[#f8fafc] px-3 py-2.5">
            <span className="mt-0.5 font-bold text-[#5850ec]">1.</span>
            <span>Complete your company profile with accurate business details.</span>
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-[#f8fafc] px-3 py-2.5">
            <span className="mt-0.5 font-bold text-[#5850ec]">2.</span>
            <span>Wait for an admin to review and approve your account.</span>
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-[#f8fafc] px-3 py-2.5">
            <span className="mt-0.5 font-bold text-[#5850ec]">3.</span>
            <span>
              Once approved, you can post jobs, review applications, and contact
              candidates.
            </span>
          </div>
        </div>

        <Link
          href="/dashboard/recruiter/company"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#5850ec] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(88,80,236,0.35)] hover:bg-[#4f46e5]"
        >
          <Building2 className="h-4 w-4" />
          {copy.cta}
        </Link>
      </div>
    </div>
  );
}
