"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

const TOPICS = ["Job search", "Employer or recruiter", "Privacy", "Something else"] as const;

export default function ContactForm({ email }: { email: string }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus("");
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: address,
          topic,
          message,
          companyWebsite: String(data.get("companyWebsite") || ""),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Please try again.");
      setStatus("Thanks. We’ve got your message and will reply by email.");
      setName("");
      setAddress("");
      setTopic(TOPICS[0]);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_36px_-18px_rgba(15,39,68,0.28)] sm:p-7">
      <h2 className="text-xl font-bold text-[#0f2744]">Send a message</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        We reply to {email}. This is not for job applications — apply from the job listing.
      </p>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-1.5 text-sm font-semibold text-[#0f2744]">
          Name
          <input
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-white px-3.5 text-base font-normal text-[#0f2744] outline-none focus:border-[#3b59ff] focus:ring-4 focus:ring-[#3b59ff]/10"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-[#0f2744]">
          Email
          <input
            required
            type="email"
            maxLength={254}
            autoComplete="email"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-white px-3.5 text-base font-normal text-[#0f2744] outline-none focus:border-[#3b59ff] focus:ring-4 focus:ring-[#3b59ff]/10"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-[#0f2744]">
          Topic
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-white px-3.5 text-base font-normal text-[#0f2744] outline-none focus:border-[#3b59ff] focus:ring-4 focus:ring-[#3b59ff]/10"
          >
            {TOPICS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-[#0f2744]">
          Message
          <textarea
            required
            minLength={10}
            maxLength={2000}
            rows={6}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-base font-normal leading-7 text-[#0f2744] outline-none focus:border-[#3b59ff] focus:ring-4 focus:ring-[#3b59ff]/10"
          />
        </label>
        <input
          type="text"
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {error ? <p className="mt-4 text-sm text-[#dc2626]">{error}</p> : null}
      {status ? <p className="mt-4 text-sm text-[#166534]">{status}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#2563eb] px-5 text-sm font-bold text-white transition hover:bg-[#1d4ed8] disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send message"}
        <ArrowRight size={16} />
      </button>
    </form>
  );
}
