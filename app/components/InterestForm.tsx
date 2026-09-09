"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export default function InterestForm({
  kind,
  itemId,
  itemTitle,
}: {
  kind: "masterclass" | "course" | "event";
  itemId: string;
  itemTitle: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [refId, setRefId] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/learning/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, itemId, itemTitle, name, email, notes }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Could not save");
        return;
      }
      setRefId(data.referenceId);
      toast.success("Interest registered");
      setName("");
      setEmail("");
      setNotes("");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        Name
        <input
          required
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Email
        <input
          required
          type="email"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Notes (optional)
        <textarea
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[#00082C] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Saving…" : "Register interest"}
      </button>
      {refId ? (
        <p className="text-sm text-slate-500">
          Saved. Reference <strong>{refId}</strong>. Not a confirmed booking.
        </p>
      ) : null}
    </form>
  );
}
