"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { COVER_LETTER_MAX_LENGTH, validateCoverLetter } from "@/lib/cover-letter";
import styles from "./ApplyWithCoverLetter.module.css";

type Props = {
  jobId: string;
  jobTitle: string;
  company?: string;
  jobDescription?: string;
  jobRequirements?: string;
  jobSkills?: string[];
  className?: string;
  disabled?: boolean;
  onBeforeOpen?: () => boolean;
  onSubmit: (coverNote: string) => Promise<boolean | void>;
};

export default function ApplyWithCoverLetter({
  jobId, jobTitle, company, jobDescription, jobRequirements, jobSkills,
  className, disabled, onBeforeOpen, onSubmit,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const submitting = useRef(false);
  const generation = useRef<AbortController | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState("");
  const [letter, setLetter] = useState("");
  const [error, setError] = useState("");
  const id = useId();

  useEffect(() => () => generation.current?.abort(), []);

  function close() {
    if (submitting.current) return;
    generation.current?.abort();
    generation.current = null;
    setGenerating(false);
    dialog.current?.close();
    setOpen(false);
  }

  async function generate() {
    if (generation.current || submitting.current) return;
    const controller = new AbortController();
    generation.current = controller;
    setGenerating(true);
    setError("");
    try {
      const response = await fetch("/api/seeker/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, jobTitle, company, jobDescription, jobRequirements, jobSkills }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "AI could not generate a letter. Please try again.");
      }
      if (validateCoverLetter(data.coverLetter)) throw new Error("AI returned an incomplete letter. Please try again.");
      if (!controller.signal.aborted) setDraft(data.coverLetter);
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : "AI writing is unavailable. You can still write your letter.");
      }
    } finally {
      if (generation.current === controller) {
        generation.current = null;
        setGenerating(false);
      }
    }
  }

  return <>
    <button type="button" className={className} disabled={disabled || busy} onClick={() => {
      if (onBeforeOpen && !onBeforeOpen()) return;
      setError("");
      setOpen(true);
    }}>Apply</button>
    {open && createPortal(
      <dialog
        ref={(element) => {
          dialog.current = element;
          if (element && !element.open) element.showModal();
        }}
        className={styles.dialog}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-job`}
        onCancel={(event) => { event.preventDefault(); close(); }}
        onKeyDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <form aria-busy={busy || generating} onSubmit={async (event) => {
          event.preventDefault();
          if (submitting.current || generation.current) return;
          const validation = validateCoverLetter(letter);
          if (validation) { setError(validation); return; }
          submitting.current = true;
          setBusy(true);
          setError("");
          try {
            if (await onSubmit(letter.trim())) {
              dialog.current?.close();
              setOpen(false);
              setLetter("");
              setDraft("");
            } else {
              setError("Application was not submitted. Please check your profile and try again.");
            }
          } catch {
            setError("Could not submit your application. Please try again.");
          } finally {
            submitting.current = false;
            setBusy(false);
          }
        }}>
          <h2 id={`${id}-title`}>Add a cover letter</h2>
          <p id={`${id}-job`} className={styles.job}>{jobTitle}{company ? ` at ${company}` : ""}</p>
          <p className={styles.hint}>A cover letter is required. Write your own, or use AI to create a draft from your profile and this job. Review and edit it before submitting.</p>
          <div className={styles.aiActions}>
            <button type="button" className={styles.generate} disabled={busy || generating} onClick={() => void generate()}>
              {generating ? "Generating draft…" : draft ? "Generate another draft" : "Generate with AI"}
            </button>
            <span role="status">{generating ? "Writing a draft from your profile…" : ""}</span>
          </div>
          {draft && <section className={styles.draft} aria-label="AI cover letter draft">
            <h3>AI draft</h3>
            <p>Check that these details are accurate. Using this draft replaces the letter below.</p>
            <div className={styles.draftText}>{draft}</div>
            <div className={styles.actions}>
              <button type="button" disabled={busy || generating} onClick={() => setDraft("")}>Discard draft</button>
              <button type="button" disabled={busy || generating} onClick={() => { setLetter(draft); setDraft(""); setError(""); }}>Use this draft</button>
            </div>
          </section>}
          <label htmlFor={`${id}-letter`}>Cover letter <span>(required)</span></label>
          <textarea id={`${id}-letter`} value={letter} onChange={(event) => setLetter(event.target.value)} required maxLength={COVER_LETTER_MAX_LENGTH} rows={8} disabled={busy} aria-describedby={`${id}-count`} placeholder={"Dear hiring team,\n\nI’m interested in this role because…"} />
          <p id={`${id}-count`} className={styles.count}>{letter.length}/1,000 characters</p>
          {error && <p role="alert" className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" disabled={busy} onClick={close}>Cancel</button>
            <button type="submit" disabled={busy || generating || !letter.trim()} className={styles.submit}>{busy ? "Submitting…" : "Submit application"}</button>
          </div>
        </form>
      </dialog>, document.body
    )}
  </>;
}
