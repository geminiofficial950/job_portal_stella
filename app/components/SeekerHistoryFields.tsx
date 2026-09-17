"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ExperienceEntry, EducationEntry } from "@/lib/seekerHistory";
import { EDUCATION_LEVELS, emptyEducation } from "@/lib/seekerHistory";
import styles from "./SeekerProfileForm.module.css";

type Props = { experiences: ExperienceEntry[]; educations: EducationEntry[]; kind?: "experiences" | "educations"; onChange: (value: { experiences?: ExperienceEntry[]; educations?: EducationEntry[] }) => void };

export default function SeekerHistoryFields({ experiences, educations, kind: selectedKind, onChange }: Props) {
  return <>
    {(["experiences", "educations"] as const).filter((kind) => !selectedKind || kind === selectedKind).map((kind) => {
      const isWork = kind === "experiences";
      const entries = isWork ? experiences : educations;
      const label = isWork ? "Experience" : "Education";
      function update(index: number, field: string, value: string | string[]) {
        onChange({ [kind]: entries.map((entry, i) => i === index ? { ...entry, [field]: value } : entry) });
      }
      return <section key={kind} className={styles.surface}>
        <div className={styles.historyHeading}><h3>{label}{!isWork ? " *" : ""}</h3>
          <button type="button" className={styles.historyButton} disabled={entries.length >= 20} onClick={() => onChange({ [kind]: [...entries, isWork ? { company: "", title: "", description: "", skills: [] } : emptyEducation()] })}><Plus size={16} />Add {label.toLowerCase()}</button>
        </div>
        {!entries.length && <p>{isWork ? "No experience added" : "No education added"}</p>}
        {entries.map((entry, index) => <fieldset key={index} className={styles.historyEntry}>
          <legend>{label} {index + 1}</legend>
          <div className={styles.historyHeading}><span /> <button type="button" className={styles.historyButton} aria-label={`Remove ${label.toLowerCase()} ${index + 1}`} title={`Remove ${label.toLowerCase()}`} onClick={() => onChange({ [kind]: entries.filter((_, i) => i !== index) })}><Trash2 size={16} /></button></div>
          <div className={styles.historyGrid}>
            <label>{isWork ? "Company name *" : "Institution name *"}<input className={styles.input} required maxLength={200} value={"company" in entry ? entry.company : entry.institution} onChange={(event) => update(index, isWork ? "company" : "institution", event.target.value)} /></label>
            <label>{isWork ? "Job title" : "Degree / qualification"}<input className={styles.input} maxLength={200} value={"title" in entry ? entry.title : entry.degree} onChange={(event) => update(index, isWork ? "title" : "degree", event.target.value)} /></label>
          </div>
          {!isWork ? (
            <div className={styles.historyGrid}>
              <label>
                Level
                <select className={styles.input} value={"level" in entry ? entry.level || "" : ""} onChange={(event) => update(index, "level", event.target.value)}>
                  <option value="">Select level</option>
                  {EDUCATION_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </label>
              <label>
                Year completed
                <input className={styles.input} inputMode="numeric" maxLength={4} placeholder="2024" value={"yearCompleted" in entry ? entry.yearCompleted || "" : ""} onChange={(event) => update(index, "yearCompleted", event.target.value.replace(/\D/g, "").slice(0, 4))} />
              </label>
            </div>
          ) : null}
          <label>Description<textarea className={styles.input} rows={3} maxLength={2000} value={entry.description} onChange={(event) => update(index, "description", event.target.value)} /></label>
          <label>Skills<input className={styles.input} placeholder="React, Communication, Project management" value={entry.skills.join(",")} onChange={(event) => update(index, "skills", event.target.value ? event.target.value.split(",") : [])} /></label>
        </fieldset>)}
      </section>;
    })}
  </>;
}
