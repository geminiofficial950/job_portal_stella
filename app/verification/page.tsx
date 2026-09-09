"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  VERIFICATION_CHECKS,
  formatPrice,
  STELLA_CONTACT,
} from "@/lib/stellaContent";
import { useAuth } from "@/app/components/AuthProvider";

export default function VerificationPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [checkTypes, setCheckTypes] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ referenceId: string; status: string } | null>(null);
  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState<{
    referenceId: string;
    status: string;
    checkTypes: string[];
  } | null>(null);

  const [consentChecking, setConsentChecking] = useState(false);
  const [consentSharing, setConsentSharing] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

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
          toast.success(
            "Request + evidence saved. Upload does not auto-verify.",
          );
        }
      } else {
        toast.success("Request submitted");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function onLookup(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(
      `/api/verification/request?ref=${encodeURIComponent(lookupId.trim())}`,
    );
    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error(data.message || "Not found");
      setLookupResult(null);
      return;
    }
    setLookupResult(data.request);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-8 lg:px-10">
      <h1 className="text-3xl font-bold text-[#0f2744]">Verification</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Supported checks, evidence, method, timing and fees. Methods marked
        pending need owner content before launch.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {VERIFICATION_CHECKS.map((check) => (
          <article
            key={check.id}
            className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-sm"
          >
            {check.pendingOwnerContent ? (
              <span className="text-[10px] font-bold uppercase text-amber-700">
                Pending owner content
              </span>
            ) : null}
            <h2 className="mt-1 font-bold text-[#0f2744]">{check.name}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Evidence: {check.evidenceNeeded}
              <br />
              Method: {check.method}
              <br />
              Timing: {check.expectedTiming}
              <br />
              Fees: {formatPrice(check.fees)}
            </p>
          </article>
        ))}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Contact{" "}
        <a href={`mailto:${STELLA_CONTACT.email}`} className="text-[#2563eb]">
          {STELLA_CONTACT.email}
        </a>
      </p>

      <h2 className="mt-10 text-xl font-bold text-[#0f2744]">
        Request verification
      </h2>
      <form
        onSubmit={onSubmit}
        className="mt-4 max-w-xl space-y-3 rounded-[22px] border border-slate-100 bg-white p-5 shadow-sm"
      >
        <label className="block text-sm font-medium">
          Name
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input
            required
            type="email"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <div>
          <p className="text-sm font-medium">Checks</p>
          {VERIFICATION_CHECKS.map((c) => (
            <label key={c.id} className="mt-1 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checkTypes.includes(c.id)}
                onChange={() =>
                  setCheckTypes((prev) =>
                    prev.includes(c.id)
                      ? prev.filter((x) => x !== c.id)
                      : [...prev, c.id],
                  )
                }
              />
              {c.name}
            </label>
          ))}
        </div>
          <label className="block text-sm font-medium">
            Notes / evidence description
            <textarea
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Supporting document (optional PDF/JPG/PNG)
            <input
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              className="mt-1 block w-full text-sm"
              onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
            />
          </label>
          <p className="text-xs text-slate-500">
            Consent: purpose is credential checking for Stella and, if you
            allow sharing, approved employers. Documents stay private.
            Uploading a file never marks a claim verified. Retention policy:
            pending owner content.
          </p>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={consentChecking}
              onChange={(e) => setConsentChecking(e.target.checked)}
            />
            I consent to Stella checking the selected claims (required).
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={consentSharing}
              onChange={(e) => setConsentSharing(e.target.checked)}
            />
            I consent to sharing verified results with approved employers
            (optional — can withdraw later).
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[#00082C] px-4 py-2.5 text-sm font-semibold text-white"
          >
            {loading ? "Submitting…" : "Submit verification request"}
          </button>
        {result ? (
          <p className="text-sm text-slate-500">
            Reference <strong>{result.referenceId}</strong> · status{" "}
            <strong>{result.status}</strong>
          </p>
        ) : null}
      </form>

      <h2 className="mt-10 text-xl font-bold text-[#0f2744]">Track a request</h2>
      <form onSubmit={onLookup} className="mt-4 flex max-w-xl flex-wrap gap-2">
        <input
          required
          placeholder="VR-…"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2"
          value={lookupId}
          onChange={(e) => setLookupId(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold"
        >
          Look up
        </button>
      </form>
      {lookupResult ? (
        <p className="mt-2 text-sm text-slate-500">
          {lookupResult.referenceId} — {lookupResult.status} (
          {lookupResult.checkTypes.join(", ")})
        </p>
      ) : null}

      <p className="mt-8">
        <Link
          href="/profile/setup"
          className="rounded-lg bg-[#00082C] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Build my free profile
        </Link>
      </p>
    </main>
  );
}
