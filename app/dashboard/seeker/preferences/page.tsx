"use client";

import { useEffect, useState } from "react";
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
      <main className="px-5 py-8">
        <p className="text-sm text-slate-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <h1 className="text-2xl font-bold text-[#0f172a]">Reminder preferences</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        L07 — control job, session, course and event reminders. Service
        confirmations stay separate from optional marketing. Learning records
        remain private to authorised users.
      </p>
      <form onSubmit={save} className="mt-6 max-w-md space-y-3">
        {(
          [
            ["jobs", "Job alerts"],
            ["sessions", "Masterclass / session reminders"],
            ["courses", "Course updates"],
            ["events", "Event reminders"],
            ["marketing", "Optional marketing (opt-in)"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
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
        <label className="block text-sm font-medium">
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
          className="rounded-lg bg-[#00082C] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Save preferences
        </button>
      </form>
    </main>
  );
}
