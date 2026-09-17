import Link from "next/link";
import {
  Building2,
  Clock3,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Check,
  Briefcase,
  Users,
  FileText,
  LockKeyhole,
} from "lucide-react";
import styles from "./RecruiterLockedPanel.module.css";
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

  const currentStep = isMissing || isRejected ? 0 : 1;
  const steps = [
    { title: "Company details", body: "Tell us about your business and where you work." },
    { title: "Profile review", body: "Our team verifies your company information." },
    { title: "Start hiring", body: "Post roles and connect with your next great hire." },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.intro}>
        <span className={styles.eyebrow}>LET’S BUILD YOUR TEAM</span>
        <span className={styles.stepCount}>Step {currentStep + 1} of 3</span>
      </div>
      <section className={styles.card} aria-labelledby="company-setup-title">
        <div className={styles.main}>
          <span className={styles.status} data-state={isRejected ? "rejected" : "setup"}>
            {isRejected ? <AlertCircle size={14} /> : <span className={styles.statusDot} />}
            {isRejected ? "Action required" : isMissing ? "Set up your workspace" : "Review in progress"}
          </span>
          <div className={styles.companyIcon}>
            {isRejected ? <AlertCircle size={29} /> : isMissing ? <Building2 size={29} /> : <ShieldCheck size={29} />}
          </div>
          <h1 id="company-setup-title" className={styles.title}>{copy.title}</h1>
          <p className={styles.description}>
            {isMissing
              ? "Great hires start with a great introduction. Add your company details to get your hiring workspace ready."
              : copy.body}
          </p>
          {isRejected && access.rejectionReason ? (
            <div className={styles.rejection}><strong>Review feedback</strong><p>{access.rejectionReason}</p></div>
          ) : null}
          <ol className={styles.steps} aria-label="Company setup progress">
            {steps.map((step, index) => (
              <li key={step.title} className={styles.step} data-state={index < currentStep ? "complete" : index === currentStep ? "current" : "upcoming"} aria-current={index === currentStep ? "step" : undefined}>
                <span className={styles.stepNumber}>{index < currentStep ? <Check size={16} /> : `0${index + 1}`}</span>
                <div><h2>{step.title}</h2><p>{step.body}</p></div>
                {index === currentStep ? <span className={styles.currentLabel}>{isRejected ? "Update" : isMissing ? "Up next" : "In review"}</span> : null}
              </li>
            ))}
          </ol>
          <Link href="/dashboard/recruiter/company" className={styles.cta}>
            {isMissing ? "Complete company profile" : copy.cta}<ArrowRight size={17} />
          </Link>
          <p className={styles.footnote}><ShieldCheck size={14} /> Hiring tools unlock after admin approval.</p>
        </div>
        <aside className={styles.preview} aria-label="Your hiring workspace benefits">
          <span className={styles.previewEyebrow}>BUILT FOR YOUR NEXT CHAPTER</span>
          <h2>A home for your<br />next great team.</h2>
          <p>Everything you need to turn open roles into great hires.</p>
          <div className={styles.illustration} aria-hidden="true">
            <div className={styles.orbit} />
            <div className={styles.profileCard}>
              <span className={styles.profileIcon}><Building2 size={30} /></span>
              <span className={styles.profileLine} /><span className={styles.profileLineShort} />
              <span className={styles.profileBadge}><ShieldCheck size={13} /> Ready to grow</span>
            </div>
            <span className={styles.floatingCheck}><Check size={23} /></span>
          </div>
          <ul className={styles.benefits}>
            {[
              { icon: Briefcase, title: "Post opportunities", copy: "Give your next hire a place to start." },
              { icon: FileText, title: "Manage applications", copy: "Keep every candidate in the picture." },
              { icon: Users, title: "Find your people", copy: "Connect with talent that fits your team." },
            ].map(({ icon: Icon, title, copy: body }) => (
              <li key={title}><span><Icon size={18} /></span><div><strong>{title}</strong><p>{body}</p></div></li>
            ))}
          </ul>
          <div className={styles.previewFooter}><LockKeyhole size={13} /> Available once your company is approved</div>
        </aside>
      </section>
    </main>
  );
}
