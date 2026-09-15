"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import { type ProfileState, validateProfile, isValidHttpUrl, isValidLinkedInUrl } from "./SeekerProfileForm";
import { validateHistory } from "@/lib/seekerHistory";
import SeekerHistoryFields from "./SeekerHistoryFields";
import styles from "./SeekerProfileForm.module.css";
import popup from "./ResumeProfileCompletion.module.css";

type Props = { initial: ProfileState; onClose: () => void; onSaved: (profile: ProfileState) => void };

export default function ResumeProfileCompletion({ initial, onClose, onSaved }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [profile, setProfile] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Keep the initial missing fields visible while the user fills them in.
  const [missing] = useState(() => ({
    headline: initial.headline.trim().length < 5,
    location: initial.location.trim().length < 2,
    experienceLevel: !initial.experienceLevel,
    about: initial.about.trim().length < 30,
    skills: !initial.skills.length,
    experiences: Boolean(validateHistory(initial.experiences, [])),
    educations: !initial.educations.length || Boolean(validateHistory([], initial.educations)) || initial.educations.map((e) => [e.degree, e.institution].filter(Boolean).join(" - ")).join("; ").trim().length < 3,
    preferredEmploymentTypes: !initial.preferredEmploymentTypes.length,
    preferredWorkModes: !initial.preferredWorkModes.length,
    resumeUrl: !isValidHttpUrl(initial.resumeUrl),
    linkedin: !isValidLinkedInUrl(initial.linkedin),
    portfolio: Boolean(initial.portfolio && !isValidHttpUrl(initial.portfolio)),
  }));
  const hasMissing = Object.values(missing).some(Boolean);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = previous; };
  }, []);

  function update(key: keyof ProfileState, value: string | string[]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    const clean = { ...profile, skills: profile.skills.map((s) => s.trim()).filter(Boolean),
      experiences: profile.experiences.map((e) => ({ ...e, skills: e.skills.map((s) => s.trim()).filter(Boolean) })),
      educations: profile.educations.map((e) => ({ ...e, skills: e.skills.map((s) => s.trim()).filter(Boolean) })) };
    const invalid = validateProfile(clean);
    if (invalid) { setError(invalid); return; }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/seeker/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "profile", profile: clean }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not save profile. Try again.");
      onSaved(data.profile);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save profile. Try again."); }
    finally { setSaving(false); }
  }

  return <dialog ref={dialog} className={`${styles.root} ${popup.dialog}`} aria-labelledby="resume-completion-title" aria-describedby="resume-completion-description" onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }}>
    <div className={popup.heading}><h2 id="resume-completion-title">{hasMissing ? "Just a few missing details" : "Your profile is ready"}</h2><button type="button" onClick={onClose} disabled={saving} aria-label="Close"><X size={20} /></button></div>
    <p id="resume-completion-description">{hasMissing ? "We filled in your resume details. Add the remaining information below." : "All required details were found in your resume. Save to finish."}</p>
    <form onSubmit={save}>
      <fieldset disabled={saving} className={popup.fields}>
        {([['headline', 'Headline', 5, 120], ['location', 'Location', 2, 120], ['resumeUrl', 'Resume link', 1, 500], ['linkedin', 'LinkedIn profile link', 1, 200], ['portfolio', 'Portfolio link', 1, 200]] as const).map(([key, label, min, max]) => missing[key] && <label key={key}>{label} *<input className={styles.input} required minLength={min} maxLength={max} type={key.endsWith('Url') || key === 'linkedin' || key === 'portfolio' ? 'url' : 'text'} value={profile[key]} onChange={(event) => update(key, event.target.value)} /></label>)}
        {missing.experienceLevel && <label>Experience level *<select className={styles.input} required value={profile.experienceLevel} onChange={(e) => update("experienceLevel", e.target.value)}><option value="">Select level</option><option value="entry">Entry</option><option value="mid">Mid</option><option value="senior">Senior</option></select></label>}
        {missing.about && <label>About you *<textarea className={styles.input} required minLength={30} maxLength={2000} rows={3} value={profile.about} onChange={(e) => update("about", e.target.value)} /></label>}
        {missing.skills && <label>Skills *<input className={styles.input} required placeholder="React, Communication, Project management" value={profile.skills.join(",")} onChange={(e) => update("skills", e.target.value.split(","))} /></label>}
        {(["experiences", "educations"] as const).map((kind) => missing[kind] && <SeekerHistoryFields key={kind} kind={kind} experiences={profile.experiences} educations={profile.educations} onChange={(value) => setProfile((current) => ({ ...current, ...value }))} />)}
        {([['preferredEmploymentTypes', 'Employment type', ['full-time', 'part-time', 'casual', 'contract']], ['preferredWorkModes', 'Work mode', ['onsite', 'hybrid', 'remote']]] as const).map(([key, label, options]) => missing[key] && <fieldset key={key} className={popup.options}><legend>{label} *</legend>{options.map((option) => <label key={option}><input type="checkbox" checked={profile[key].includes(option)} onChange={() => update(key, profile[key].includes(option) ? profile[key].filter((v) => v !== option) : [...profile[key], option])} />{option}</label>)}</fieldset>)}
      </fieldset>
      {error && <p role="alert" className={popup.error}>{error}</p>}
      <button className={popup.save} type="submit" disabled={saving}>{saving && <Loader2 size={16} className="animate-spin" />}{saving ? "Saving…" : "Save profile"}</button>
    </form>
  </dialog>;
}
