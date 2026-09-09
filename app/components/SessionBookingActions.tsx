"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useAuth } from "@/app/components/AuthProvider";

export default function SessionBookingActions({
  slug,
  title,
  bookingOpen,
}: {
  slug: string;
  title: string;
  bookingOpen: boolean;
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refId, setRefId] = useState("");

  async function book() {
    if (!user) {
      window.location.href = `/login?role=user&next=/masterclasses/${slug}`;
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/learning/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Booking failed");
        return;
      }
      setRefId(data.referenceId);
      toast.success("Booking confirmed");
    } catch {
      toast.error("Booking failed");
    } finally {
      setLoading(false);
    }
  }

  async function cancel() {
    if (!refId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/learning/bookings?ref=${encodeURIComponent(refId)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Cancel failed");
        return;
      }
      toast.success("Booking cancelled");
      setRefId("");
    } catch {
      toast.error("Cancel failed");
    } finally {
      setLoading(false);
    }
  }

  if (!bookingOpen) {
    return (
      <p className="mt-4 text-sm text-amber-800">
        Live booking opens when Stella publishes confirmed speakers and fees.
        Use interest registration below in the meantime.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <button
        type="button"
        disabled={loading}
        onClick={book}
        className="rounded-lg bg-[#00082C] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Working…" : `Book: ${title}`}
      </button>
      {refId ? (
        <div className="text-sm text-slate-600">
          Confirmed — reference <strong>{refId}</strong>.{" "}
          <button
            type="button"
            onClick={cancel}
            className="font-semibold text-[#2563eb]"
          >
            Cancel booking
          </button>
          <p className="mt-1 text-xs text-slate-500">
            Calendar: add the session time shown above (local TZ). Reminders
            follow{" "}
            <Link href="/dashboard/seeker/preferences" className="underline">
              your preferences
            </Link>
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}
