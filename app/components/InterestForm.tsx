"use client";

import { useId, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ArrowRight, CheckCircle2, Mail, UserRound } from "lucide-react";
import styles from "./InterestForm.module.css";

export default function InterestForm({
  kind,
  itemId,
  itemTitle,
}: {
  kind: "masterclass" | "course" | "event";
  itemId: string;
  itemTitle: string;
}) {
  const formId = useId();
  const submitting = useRef(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [refId, setRefId] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting.current) return;
    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    submitting.current = true;
    setLoading(true);
    setError("");
    setRefId("");
    try {
      const res = await fetch("/api/learning/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, itemId, itemTitle, name: name.trim(), email: email.trim(), notes: notes.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.referenceId) {
        setError(data.message || "We couldn’t register your interest. Please try again.");
        return;
      }
      setRefId(data.referenceId);
      toast.success("Interest registered");
      setName("");
      setEmail("");
      setNotes("");
    } catch {
      setError("We couldn’t connect. Please check your connection and try again.");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={styles.form} aria-busy={loading}>
      <label className={styles.field}>
        Full name
        <span className={styles.inputWrap}>
          <UserRound className={styles.icon} size={18} aria-hidden="true" />
          <input required minLength={2} maxLength={120} disabled={loading} name="name" autoComplete="name"
            placeholder="Your full name" className={styles.input}
            value={name} onChange={(e) => setName(e.target.value)} />
        </span>
      </label>
      <label className={styles.field}>
        Email address
        <span className={styles.inputWrap}>
          <Mail className={styles.icon} size={18} aria-hidden="true" />
          <input required type="email" maxLength={254} disabled={loading} name="email" autoComplete="email"
            placeholder="you@example.com" className={styles.input}
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </span>
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Anything you’d like to ask?<span className={styles.optional}>Optional</span></span>
        <textarea name="notes" rows={4} maxLength={2000} disabled={loading} className={styles.textarea}
          placeholder="Share a question or anything you’d like us to know…"
          value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <button type="submit" disabled={loading} className={styles.submit} aria-describedby={`${formId}-hint`}>
        {loading ? "Registering your interest…" : "Register interest"}
        {!loading && <ArrowRight size={17} aria-hidden="true" />}
      </button>
      <p id={`${formId}-hint`} className={styles.hint}>Registering interest does not confirm a booking.</p>
      {refId ? (
        <div className={styles.success} role="status">
          <CheckCircle2 size={19} aria-hidden="true" />
          <p>Your interest is registered.<br />Reference: <strong>{refId}</strong></p>
        </div>
      ) : null}
    </form>
  );
}
