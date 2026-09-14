"use client";

import { useEffect, useState } from "react";
import styles from "../seeker.module.css";
import SeekerPageHeader from "@/app/components/SeekerPageHeader";
import { Bell, Save } from "lucide-react";
import { toast } from "react-toastify";

export default function SeekerPreferencesPage() {
  const [prefs, setPrefs] = useState({
    jobs: true,
    sessions: true,
    courses: true,
    events: true,
    marketing: false,
    frequency: "immediate",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/learning/preferences");
        const data = await res.json();
        if (data.success && data.preferences) {
          setPrefs({
            jobs: Boolean(data.preferences.jobs),
            sessions: Boolean(data.preferences.sessions),
            courses: Boolean(data.preferences.courses),
            events: Boolean(data.preferences.events),
            marketing: Boolean(data.preferences.marketing),
            frequency: data.preferences.frequency || "immediate",
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/learning/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error(data.message || "Save failed");
      return;
    }
    toast.success("Preferences saved");
  }

  if (loading) {
    return (
      <main className={styles.subpage}>
        <p className={styles.loadingState}>Loading…</p>
      </main>
    );
  }

  return (
    <main className={styles.subpage}>
      <SeekerPageHeader title="Reminder preferences" subtitle="Control job, session, course and event reminders." section="STAY IN THE LOOP, ON YOUR TERMS" icon="preferences" />
      <div className={styles.preferencesGrid}>
      <form onSubmit={save} className={styles.preferencesForm}>
        <div className={styles.formSectionHeading}><Bell size={19} /><div><h2>Your reminders</h2><p>Choose which updates you’d like to receive.</p></div></div>
        {(
          [
            ["jobs", "Job alerts"],
            ["sessions", "Masterclass / session reminders"],
            ["courses", "Course updates"],
            ["events", "Event reminders"],
            ["marketing", "Optional marketing (opt-in)"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className={styles.preferenceRow}>
            <input
              type="checkbox"
              checked={prefs[key]}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, [key]: e.target.checked }))
              }
            />
            {label}
          </label>
        ))}
        <label className={styles.frequencyField}>
          Frequency
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={prefs.frequency}
            onChange={(e) =>
              setPrefs((p) => ({ ...p, frequency: e.target.value }))
            }
          >
            <option value="immediate">Immediate</option>
            <option value="daily">Daily digest</option>
            <option value="weekly">Weekly</option>
            <option value="none">None</option>
          </select>
        </label>
        <button
          type="submit"
          className={styles.formButton}
        >
          <Save size={16} /> Save preferences
        </button>
      </form>
      <aside className={styles.preferencesNote}><span className={styles.pageIcon}><Bell size={24} /></span><h2>A little less noise.<br />More of what matters.</h2><p>Service confirmations stay separate from optional marketing. Learning records remain private to authorised users.</p></aside>
      </div>
    </main>
  );
}
