"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Save, Bell, UserRound, Lock } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-[#cdd3e0] px-3.5 py-3 text-[15px] outline-none focus:border-[#dc2626]";

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-[#eef1f7] px-4 py-3">
      <span>
        <span className="block text-sm font-medium text-[#1e293b]">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-xs text-[#6b7a9e]">{hint}</span>
        ) : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[#dc2626]" : "bg-[#cdd3e0]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

export default function SeekerSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [authProvider, setAuthProvider] = useState("local");
  const [notifications, setNotifications] = useState({
    emailJobAlerts: true,
    emailApplicationUpdates: true,
    emailInterviewReminders: true,
    emailWeeklyDigest: false,
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/seeker/profile", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error(data.message || "Failed to load settings");
          return;
        }
        setName(data.account.name);
        setEmail(data.account.email);
        setPhone(data.account.phone || "");
        setAuthProvider(data.account.authProvider || "local");
        setNotifications(data.notifications);
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(section: string, body: Record<string, unknown>) {
    setSaving(section);
    try {
      const res = await fetch("/api/seeker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, ...body }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Save failed");
        return;
      }
      toast.success("Saved");
      if (section === "account") {
        setName(data.account.name);
        setPhone(data.account.phone || "");
      }
      if (section === "notifications") {
        setNotifications(data.notifications);
      }
      if (section === "password") {
        setCurrentPassword("");
        setNextPassword("");
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[#6b7a9e]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <UserRound className="h-4 w-4 text-[#6b7a9e]" />
          <h2 className="font-semibold">Account</h2>
        </div>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            void save("account", { name, phone });
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Name</span>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Email</span>
            <input className={inputClass} value={email} disabled />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium">Phone</span>
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+61 ..."
            />
          </label>
          <button
            type="submit"
            disabled={saving === "account"}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving === "account" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save account
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#6b7a9e]" />
          <h2 className="font-semibold">Notifications</h2>
        </div>
        <div className="space-y-2">
          <Toggle
            checked={notifications.emailJobAlerts}
            onChange={(v) =>
              setNotifications((n) => ({ ...n, emailJobAlerts: v }))
            }
            label="Job alerts"
            hint="New roles that match your preferences"
          />
          <Toggle
            checked={notifications.emailApplicationUpdates}
            onChange={(v) =>
              setNotifications((n) => ({ ...n, emailApplicationUpdates: v }))
            }
            label="Application updates"
            hint="Status changes on roles you applied to"
          />
          <Toggle
            checked={notifications.emailInterviewReminders}
            onChange={(v) =>
              setNotifications((n) => ({ ...n, emailInterviewReminders: v }))
            }
            label="Interview reminders"
          />
          <Toggle
            checked={notifications.emailWeeklyDigest}
            onChange={(v) =>
              setNotifications((n) => ({ ...n, emailWeeklyDigest: v }))
            }
            label="Weekly digest"
          />
        </div>
        <button
          type="button"
          disabled={saving === "notifications"}
          onClick={() => save("notifications", { notifications })}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving === "notifications" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save notifications
        </button>
      </section>

      {authProvider === "local" ? (
        <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#6b7a9e]" />
            <h2 className="font-semibold">Password</h2>
          </div>
          <form
            className="grid max-w-md gap-4"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              void save("password", { currentPassword, nextPassword });
            }}
          >
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">
                Current password
              </span>
              <input
                type="password"
                className={inputClass}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">
                New password
              </span>
              <input
                type="password"
                className={inputClass}
                value={nextPassword}
                onChange={(e) => setNextPassword(e.target.value)}
                required
                minLength={6}
              />
            </label>
            <button
              type="submit"
              disabled={saving === "password"}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#cdd3e0] bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {saving === "password" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Update password
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
