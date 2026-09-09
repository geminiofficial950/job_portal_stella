"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type QueueItem = {
  referenceId: string;
  name: string;
  email: string;
  status: string;
  checkTypes: string[];
  candidateNextAction: string;
  claims: Array<{
    _id: string;
    checkType: string;
    claimSummary: string;
    result: string;
    method: string;
  }>;
  evidenceCount: number;
};

export default function AdminVerificationPanel() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verification");
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to load queue");
        return;
      }
      setItems(data.items || []);
      setStatuses(data.statuses || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function updateClaim(
    referenceId: string,
    claimId: string,
    status: string,
  ) {
    const reason = window.prompt(
      "Method / reason for this status (required for Verified):",
      status === "verified" ? "Issuer confirmation / USI review" : "",
    );
    if (reason === null) return;
    const res = await fetch("/api/admin/verification", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referenceId,
        claimId,
        status,
        reason,
        candidateExplanation: reason,
        resultScope:
          "States only what this method confirmed. Not Australian recognition/migration assessment unless explicitly checked.",
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error(data.message || "Update failed");
      return;
    }
    toast.success("Updated");
    void load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">
            Verification queue
          </h1>
          <p className="text-sm text-slate-500">
            V04 — assign results with history. Upload alone never verifies.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-6 text-sm text-slate-500">
          No verification requests yet.
        </p>
      ) : (
        items.map((item) => (
          <article
            key={item.referenceId}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-slate-500">
                  {item.referenceId}
                </p>
                <h2 className="font-bold text-[#0f172a]">
                  {item.name} · {item.email}
                </h2>
                <p className="text-sm text-slate-500">
                  Status: <strong>{item.status}</strong> · evidence files:{" "}
                  {item.evidenceCount}
                </p>
                <p className="text-sm text-slate-500">
                  Next for candidate: {item.candidateNextAction}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {(item.claims || []).map((c) => (
                <div
                  key={c._id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <p className="text-sm font-semibold">
                    {c.claimSummary}{" "}
                    <span className="font-normal text-slate-500">
                      ({c.result})
                    </span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {statuses.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          void updateClaim(item.referenceId, c._id, s)
                        }
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium hover:border-slate-400"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))
      )}
    </div>
  );
}
