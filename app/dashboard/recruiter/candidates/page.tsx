"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type Candidate = {
  id: string;
  name: string;
  headline: string;
  location: string;
  skills: string[];
  targetRoles: string[];
  profileStatus: string;
  credentialStatus: string;
  screeningStatus: string;
  availabilityStatus: string;
  availabilityNote: string;
  claimStatuses: Array<{ checkType: string; result: string }>;
};

export default function RecruiterCandidatesPage() {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (location.trim()) params.set("location", location.trim());
      const res = await fetch(`/api/recruiter/candidates?${params}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Search blocked");
        setCandidates([]);
        return;
      }
      setCandidates(data.candidates || []);
    } catch {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
        Find candidates
      </h1>
      <p className="mt-1 text-sm text-[#64748b]">
        E02 — only discoverable candidates. Contact and documents stay
        restricted. Pending evidence is labelled, not treated as a pass.
      </p>

      <form
        className="mt-6 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void search();
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Role / skills / name"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Suburb / location"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-[#00082C] px-4 py-2 text-sm font-semibold text-white"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </p>
      ) : null}

      <div className="mt-6 space-y-3">
        {candidates.length === 0 && !error ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">
            No discoverable candidates match. Candidates must enable discovery
            in their profile.
          </p>
        ) : (
          candidates.map((c) => (
            <article
              key={c.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="font-bold text-[#0f172a]">{c.name}</h2>
              <p className="text-sm text-slate-500">
                {c.headline || "No headline"} · {c.location || "Location n/a"}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Profile: {c.profileStatus} · Credentials: {c.credentialStatus} ·
                Screening: {c.screeningStatus} · Availability:{" "}
                {c.availabilityStatus}
              </p>
              {c.skills?.length ? (
                <p className="mt-2 text-sm text-slate-600">
                  Skills: {c.skills.slice(0, 8).join(", ")}
                </p>
              ) : null}
              {c.claimStatuses?.length ? (
                <ul className="mt-2 text-xs text-slate-500">
                  {c.claimStatuses.slice(0, 4).map((cl, i) => (
                    <li key={`${cl.checkType}-${i}`}>
                      {cl.checkType}: <strong>{cl.result}</strong>
                      {cl.result === "submitted" || cl.result === "in_review"
                        ? " (pending — not a pass)"
                        : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-400">
                  No verification claims on file
                </p>
              )}
              <button
                type="button"
                className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold"
                onClick={async () => {
                  const res = await fetch("/api/recruiter/interviews", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seekerId: c.id,
                      roleTitle: c.targetRoles?.[0] || c.headline || "Role",
                      proposedTimes: ["To be confirmed"],
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok || !data.success) {
                    toast.error(data.message || "Invite failed");
                    return;
                  }
                  toast.success(`Interview invited · ${data.referenceId}`);
                }}
              >
                Request interview
              </button>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
