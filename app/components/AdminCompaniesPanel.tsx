"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Check, Loader2, X } from "lucide-react";

type CompanyRow = {
  id: string;
  name: string;
  website: string;
  industry: string;
  location: string;
  size: string;
  phone: string;
  about: string;
  logoUrl: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string;
  owner: { name: string; email: string } | null;
  updatedAt: string | null;
  createdAt: string | null;
};

function CompanyCard({
  c,
  busyId,
  onReview,
  showActions,
}: {
  c: CompanyRow;
  busyId: string | null;
  onReview: (id: string, action: "approve" | "reject") => void;
  showActions?: boolean;
}) {
  return (
    <li className="rounded-2xl border border-[#e6eaf2] bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          {c.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.logoUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-xl border border-[#e6eaf2] object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#fef2f2] text-lg font-semibold text-[#b91c1c]">
              {c.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-[#b91c1c]">{c.name}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                  c.status === "approved"
                    ? "bg-[#fef2f2] text-[#b91c1c]"
                    : c.status === "pending"
                      ? "bg-[#fff8e8] text-[#9a6700]"
                      : "bg-[#fff1f1] text-[#b42318]"
                }`}
              >
                {c.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-[#6b7a9e]">
              {[c.industry, c.location, c.size].filter(Boolean).join(" · ") ||
                "—"}
            </p>
            {c.phone ? (
              <p className="mt-1 text-sm text-[#6b7a9e]">Phone: {c.phone}</p>
            ) : null}
            <p className="mt-2 text-sm text-[#6b7a9e]">
              Owner: {c.owner?.name || "—"} ({c.owner?.email || "—"})
            </p>
            {c.website ? (
              <a
                href={c.website}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-sm text-[#b91c1c] underline decoration-[#dc2626]"
              >
                {c.website}
              </a>
            ) : null}
            {c.about ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#4a5878]">
                {c.about}
              </p>
            ) : null}
            {c.status === "rejected" && c.rejectionReason ? (
              <p className="mt-2 text-sm text-[#b42318]">
                Reason: {c.rejectionReason}
              </p>
            ) : null}
          </div>
        </div>
        {showActions ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={busyId === c.id}
              onClick={() => onReview(c.id, "approve")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#dc2626] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              Approve
            </button>
            <button
              type="button"
              disabled={busyId === c.id}
              onClick={() => onReview(c.id, "reject")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#cdd3e0] bg-white px-3 py-2 text-sm font-semibold text-[#b42318] disabled:opacity-60"
            >
              <X className="h-4 w-4" />
              Reject
            </button>
          </div>
        ) : c.status === "rejected" ? (
          <button
            type="button"
            disabled={busyId === c.id}
            onClick={() => onReview(c.id, "approve")}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#dc2626] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            Approve now
          </button>
        ) : c.status === "approved" ? (
          <button
            type="button"
            disabled={busyId === c.id}
            onClick={() => onReview(c.id, "reject")}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#cdd3e0] bg-white px-3 py-2 text-sm font-semibold text-[#b42318] disabled:opacity-60"
          >
            <X className="h-4 w-4" />
            Revoke
          </button>
        ) : null}
      </div>
    </li>
  );
}

export default function AdminCompaniesPanel() {
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<CompanyRow[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/companies", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to load companies");
        return;
      }
      setCompanies(data.companies || []);
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function review(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/companies/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          rejectionReason:
            action === "reject"
              ? "Please update company details and resubmit."
              : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Action failed");
        return;
      }
      toast.success(data.message);
      await load();
    } catch {
      toast.error("Action failed");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[#6b7a9e]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading companies…
      </div>
    );
  }

  const pending = companies.filter((c) => c.status === "pending");
  const approved = companies.filter((c) => c.status === "approved");
  const rejected = companies.filter((c) => c.status === "rejected");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold tracking-[-0.02em]">
          Pending approval ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-[#6b7a9e]">No companies waiting.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pending.map((c) => (
              <CompanyCard
                key={c.id}
                c={c}
                busyId={busyId}
                onReview={review}
                showActions
              />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-[-0.02em]">
          Approved ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <p className="mt-3 text-sm text-[#6b7a9e]">None yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {approved.map((c) => (
              <CompanyCard key={c.id} c={c} busyId={busyId} onReview={review} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-[-0.02em]">
          Rejected ({rejected.length})
        </h2>
        {rejected.length === 0 ? (
          <p className="mt-3 text-sm text-[#6b7a9e]">None.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {rejected.map((c) => (
              <CompanyCard key={c.id} c={c} busyId={busyId} onReview={review} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
