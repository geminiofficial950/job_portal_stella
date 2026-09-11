"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Fingerprint,
  GraduationCap,
  Loader2,
  LockKeyhole,
  Mail,
  Search,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import {
  VERIFICATION_CHECKS,
  formatPrice,
  STELLA_CONTACT,
} from "@/lib/stellaContent";
import { useAuth } from "@/app/components/AuthProvider";

const CHECK_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  qualification: GraduationCap,
  "work-experience": BriefcaseBusiness,
  "identity-work-rights": BadgeCheck,
};

const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-blue-50 text-blue-700 ring-blue-100",
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  verified: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  rejected: "bg-rose-50 text-rose-700 ring-rose-100",
};

function statusClass(status: string) {
  return STATUS_STYLES[status.toLowerCase()] || "bg-slate-100 text-slate-700 ring-slate-200";
}

export default function VerificationPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [checkTypes, setCheckTypes] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    referenceId: string;
    status: string;
  } | null>(null);
  const [lookupId, setLookupId] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<{
    referenceId: string;
    status: string;
    checkTypes: string[];
  } | null>(null);
  const [consentChecking, setConsentChecking] = useState(false);
  const [consentSharing, setConsentSharing] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  useEffect(() => {
    if (user?.name && !name) setName(user.name);
    if (user?.email && !email) setEmail(user.email);
  }, [user, name, email]);

  function toggleCheck(id: string) {
    setCheckTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkTypes.length) {
      toast.error("Select at least one check");
      return;
    }
    if (!consentChecking) {
      toast.error("Consent to checking is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/verification/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          checkTypes,
          notes,
          consentChecking,
          consentSharing,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed");
        return;
      }
      setResult({ referenceId: data.referenceId, status: data.status });

      if (evidenceFile && data.referenceId) {
        const fd = new FormData();
        fd.set("referenceId", data.referenceId);
        fd.set("file", evidenceFile);
        const up = await fetch("/api/verification/evidence", {
          method: "POST",
          body: fd,
        });
        const upData = await up.json();
        if (!up.ok || !upData.success) {
          toast.warning(
            upData.message ||
              "Request saved but evidence upload failed — try again with the reference ID",
          );
        } else {
          toast.success("Request and evidence submitted successfully");
        }
      } else {
        toast.success("Verification request submitted");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function onLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupLoading(true);
    try {
      const res = await fetch(
        `/api/verification/request?ref=${encodeURIComponent(lookupId.trim())}`,
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Request not found");
        setLookupResult(null);
        return;
      }
      setLookupResult(data.request);
    } catch {
      toast.error("Could not look up this request");
    } finally {
      setLookupLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#0f2744]">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#00082c]">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -right-24 -top-32 h-136 w-136 rounded-full bg-blue-500/25 blur-[110px]" />
        <div className="absolute -bottom-48 left-1/4 h-96 w-96 rounded-full bg-violet-500/20 blur-[100px]" />
        <div className="absolute left-[8%] top-24 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative mx-auto flex min-h-[72vh] max-w-7xl items-center px-4 pb-32 pt-20 sm:min-h-[78vh] sm:px-8 sm:pb-36 sm:pt-24 lg:min-h-[82vh] lg:px-10 lg:pb-40 lg:pt-28">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1fr)_430px]">
            <div>
              <h1 className="max-w-3xl text-4xl font-extrabold tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
                Turn your experience into{" "}
                <span className="bg-linear-to-r from-[#8fb7ff] via-[#c8d8ff] to-[#a99cff] bg-clip-text text-transparent">
                  verified trust.
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Verify eligible qualifications, work experience and work
                rights—then share trusted results with approved employers.
              </p>
              <a
                href="#request-verification"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#00082c] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Start a request <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="relative mx-auto w-full max-w-107.5">
              <div className="absolute -inset-4 rotate-3 rounded-4xl border border-white/10 bg-white/4" />
              <div className="absolute -inset-2 -rotate-2 rounded-4xl bg-linear-to-br from-blue-500/20 to-violet-500/10 blur-sm" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/9 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-400 to-blue-700 text-white shadow-lg shadow-blue-900/30">
                      <Fingerprint className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">
                        Gemini Jobs
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-white">
                        Verification profile
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
                    Candidate controlled
                  </span>
                </div>

                <div className="mt-7 rounded-2xl border border-white/10 bg-[#00082c]/40 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-linear-to-br from-slate-100 to-blue-200 p-0.5">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-[#10204d] text-sm font-extrabold text-white">
                        SC
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="h-2.5 w-28 rounded-full bg-white/80" />
                      <div className="mt-2 h-2 w-20 rounded-full bg-white/20" />
                    </div>
                    <ShieldCheck className="h-6 w-6 text-[#8fb7ff]" />
                  </div>
                </div>

                <div className="mt-4 grid gap-2.5">
                  {[
                    [GraduationCap, "Qualification", "Review ready"],
                    [BriefcaseBusiness, "Work experience", "Evidence added"],
                    [BadgeCheck, "Work rights", "Candidate controlled"],
                  ].map(([Icon, label, state]) => {
                    const RowIcon = Icon as ComponentType<{
                      className?: string;
                    }>;
                    return (
                      <div
                        key={String(label)}
                        className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5.5 px-3.5 py-3"
                      >
                        <RowIcon className="h-4 w-4 text-blue-200" />
                        <span className="flex-1 text-xs font-semibold text-white">
                          {String(label)}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          {String(state)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 sm:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[0_24px_60px_-30px_rgba(0,8,44,0.35)] backdrop-blur-xl sm:grid-cols-3">
          {[
            [LockKeyhole, "Private by design", "Evidence stays restricted"],
            [ShieldCheck, "Human-reviewed", "Clear evidence assessment"],
            [BadgeCheck, "You stay in control", "Choose what gets shared"],
          ].map(([Icon, title, copy], index) => {
            const TrustIcon = Icon as ComponentType<{ className?: string }>;
            return (
              <div
                key={String(title)}
                className={`flex items-center gap-3 px-5 py-5 ${
                  index > 0 ? "border-t border-slate-100 sm:border-l sm:border-t-0" : ""
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <TrustIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#0f2744]">
                    {String(title)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {String(copy)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-14 pt-20 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Available checks
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              What can be verified
            </h2>
          </div>
          <a
            href={`mailto:${STELLA_CONTACT.email}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
          >
            <Mail className="h-4 w-4" /> {STELLA_CONTACT.email}
          </a>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {VERIFICATION_CHECKS.map((check) => {
            const Icon = CHECK_ICONS[check.id] || FileCheck2;
            return (
              <article
                key={check.id}
                className="group relative overflow-hidden rounded-3xl border border-[#e1e8f2] bg-white p-6 shadow-[0_10px_35px_-25px_rgba(15,39,68,0.5)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_22px_45px_-28px_rgba(37,99,235,0.45)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4ff] text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-inset ring-amber-100">
                    By review
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{check.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                  {check.evidenceNeeded}
                </p>
                <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-blue-600" />
                    Timing confirmed after review
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-blue-600" />
                    {formatPrice(check.fees) === "Pending owner content"
                      ? "Fee confirmed before processing"
                      : formatPrice(check.fees)}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-4xl border border-[#dfe7f1] bg-linear-to-br from-[#eef4ff] via-white to-[#f1efff] p-7 sm:p-10">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="relative">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Simple and transparent
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                From claim to verified result
              </h2>
            </div>
            <div className="mt-9 grid gap-7 md:grid-cols-3">
              {[
                [
                  "01",
                  "Choose your checks",
                  "Select the qualifications, experience or work-rights claims you want reviewed.",
                ],
                [
                  "02",
                  "Provide evidence",
                  "Upload clear supporting documents and add any context our reviewers need.",
                ],
                [
                  "03",
                  "Track the outcome",
                  "Use your unique reference ID to follow progress and view the latest status.",
                ],
              ].map(([number, title, copy], index) => (
                <article key={number} className="relative">
                  {index < 2 ? (
                    <div className="absolute left-11 top-5 hidden h-px w-[calc(100%-1rem)] bg-linear-to-r from-blue-300 to-transparent md:block" />
                  ) : null}
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#00082c] text-xs font-bold text-white shadow-lg shadow-slate-900/15">
                    {number}
                  </span>
                  <h3 className="mt-5 text-base font-bold text-[#0f2744]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="request-verification"
        className="border-y border-[#e1e8f2] bg-white"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 lg:grid-cols-[1fr_380px] lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Verification request
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Submit your details
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Choose one or more checks and provide clear supporting evidence.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Full name
                  <input
                    required
                    autoComplete="name"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-[#fbfcfe] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Email address
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-[#fbfcfe] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              </div>

              <fieldset>
                <legend className="text-sm font-semibold text-slate-700">
                  Select checks
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {VERIFICATION_CHECKS.map((check) => {
                    const selected = checkTypes.includes(check.id);
                    const Icon = CHECK_ICONS[check.id] || FileCheck2;
                    return (
                      <button
                        key={check.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleCheck(check.id)}
                        className={`relative flex min-h-28 flex-col items-start rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-100"
                            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            selected ? "text-blue-700" : "text-slate-400"
                          }`}
                        />
                        <span className="mt-3 text-sm font-bold text-slate-800">
                          {check.name}
                        </span>
                        {selected ? (
                          <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="block text-sm font-semibold text-slate-700">
                Notes or evidence description
                <textarea
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-[#fbfcfe] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Add context that may help our verification team…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>

              <label className="group block cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-[#fbfcfe] p-6 text-center transition hover:border-blue-300 hover:bg-blue-50/40">
                <input
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                />
                <UploadCloud className="mx-auto h-7 w-7 text-blue-600" />
                <p className="mt-2 text-sm font-bold text-slate-800">
                  {evidenceFile ? evidenceFile.name : "Upload supporting evidence"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  PDF, JPG, PNG or WEBP
                </p>
              </label>

              <div className="rounded-2xl bg-[#f5f8fc] p-4">
                <div className="mb-3 flex items-start gap-2 text-xs leading-5 text-slate-500">
                  <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  Documents remain private. Uploading evidence does not
                  automatically mark a claim as verified.
                </div>
                <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded accent-blue-600"
                    checked={consentChecking}
                    onChange={(e) => setConsentChecking(e.target.checked)}
                  />
                  <span>
                    I consent to Gemini Jobs checking the selected claims.{" "}
                    <strong className="text-slate-900">Required</strong>
                  </span>
                </label>
                <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded accent-blue-600"
                    checked={consentSharing}
                    onChange={(e) => setConsentSharing(e.target.checked)}
                  />
                  <span>
                    Share verified results with approved employers. Optional
                    and withdrawable.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00082c] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#071a52] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                  </>
                ) : (
                  <>
                    Submit verification request
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {result ? (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-bold text-emerald-900">
                      Request submitted successfully
                    </p>
                    <p className="mt-1 text-emerald-700">
                      Reference <strong>{result.referenceId}</strong> ·{" "}
                      <span className="capitalize">{result.status}</span>
                    </p>
                  </div>
                </div>
              ) : null}
            </form>
          </div>

          <aside className="lg:pt-9">
            <div className="sticky top-24 rounded-3xl bg-[#00082c] p-6 text-white shadow-[0_24px_60px_-30px_rgba(0,8,44,0.7)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck className="h-5 w-5 text-blue-200" />
              </div>
              <h3 className="mt-5 text-xl font-bold">Built for your privacy</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Evidence is restricted to authorised reviewers. Employers only
                receive verified results when you allow sharing.
              </p>
              <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
                {[
                  "Private document storage",
                  "Clear review status",
                  "Sharing under your control",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-slate-200"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#8fb7ff]" />
                    {item}
                  </div>
                ))}
              </div>
              <Link
                href="/profile/setup"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-white hover:text-blue-200"
              >
                Build my free profile <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-8 lg:px-10">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          <Search className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">
          Track a request
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Enter the reference ID provided after submission.
        </p>
        <form
          onSubmit={onLookup}
          className="mx-auto mt-6 flex max-w-xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_12px_35px_-25px_rgba(15,39,68,0.5)] sm:flex-row"
        >
          <input
            required
            placeholder="VR-XXXXXXXX-XXXXXX"
            className="min-w-0 flex-1 rounded-xl border-0 bg-transparent px-4 py-3 text-sm font-medium uppercase text-slate-900 outline-none placeholder:normal-case placeholder:text-slate-400"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
          />
          <button
            type="submit"
            disabled={lookupLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00082c] px-5 py-3 text-sm font-bold text-white hover:bg-[#071a52] disabled:opacity-60"
          >
            {lookupLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Look up
          </button>
        </form>

        {lookupResult ? (
          <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Reference ID
                </p>
                <p className="mt-1 font-bold text-slate-900">
                  {lookupResult.referenceId}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ring-inset ${statusClass(
                  lookupResult.status,
                )}`}
              >
                {lookupResult.status}
              </span>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Requested checks
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {lookupResult.checkTypes.map((type) => {
                  const label =
                    VERIFICATION_CHECKS.find((check) => check.id === type)
                      ?.name || type;
                  return (
                    <span
                      key={type}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
