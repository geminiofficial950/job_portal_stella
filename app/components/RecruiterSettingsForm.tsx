"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Loader2,
  Save,
  UserRound,
  Bell,
  Briefcase,
  Users,
  Trash2,
} from "lucide-react";
import { useAuth } from "./AuthProvider";

type SettingsPayload = {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    authProvider: string;
    role: string;
  };
  notifications: {
    emailNewApplications: boolean;
    emailInterviewReminders: boolean;
    emailWeeklyDigest: boolean;
    emailJobStatus: boolean;
  };
  hiring: {
    defaultEmploymentType: string;
    defaultWorkMode: string;
    showSalaryPublicly: boolean;
    autoPauseAfterDays: number;
  };
  teamInvites: Array<{
    id?: string;
    email: string;
    access: "viewer" | "editor";
    status: "pending" | "accepted";
    invitedAt: string | null;
  }>;
};

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
    <label className="flex items-start justify-between gap-4 rounded-xl border border-[#eef1f7] px-4 py-3 hover:bg-[#fffafa] transition-colors cursor-pointer">
      <span>
        <span className="block text-sm font-semibold text-[#b91c1c]">
          {label}
        </span>
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
          checked ? "bg-gradient-to-r from-[#dc2626] to-[#b91c1c]" : "bg-[#cdd3e0]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

export default function RecruiterSettingsForm() {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [settings, setSettings] = useState<SettingsPayload | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteAccess, setInviteAccess] = useState<"viewer" | "editor">(
    "viewer",
  );
  const [password, setPassword] = useState({ current: "", next: "" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/recruiter/settings", {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error(data.message || "Failed to load settings");
          return;
        }
        if (!cancelled) setSettings(data.settings);
      } catch {
        toast.error("Failed to load settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);

    try {
      const body: Record<string, unknown> = {
        profile: {
          name: settings.profile.name,
          phone: settings.profile.phone,
        },
        notifications: settings.notifications,
        hiring: settings.hiring,
      };

      if (password.current || password.next) {
        body.password = password;
      }

      const res = await fetch("/api/recruiter/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to save settings");
        return;
      }

      setSettings(data.settings);
      setPassword({ current: "", next: "" });
      await refreshUser();
      toast.success(data.message || "Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function inviteTeammate(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch("/api/recruiter/settings/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, access: inviteAccess }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Invite failed");
        return;
      }
      setSettings(data.settings);
      setInviteEmail("");
      toast.success(data.message || "Invite added");
    } catch {
      toast.error("Invite failed");
    } finally {
      setInviting(false);
    }
  }

  async function removeInvite(invite: SettingsPayload["teamInvites"][number]) {
    const qs = invite.id
      ? `id=${encodeURIComponent(invite.id)}`
      : `email=${encodeURIComponent(invite.email)}`;
    try {
      const res = await fetch(`/api/recruiter/settings/team?${qs}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Remove failed");
        return;
      }
      setSettings(data.settings);
      toast.success("Invite removed");
    } catch {
      toast.error("Remove failed");
    }
  }

  if (loading || !settings) {
    return (
      <div className="mt-8 flex items-center gap-2 text-[#6b7a9e]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading settings…
      </div>
    );
  }

  const isGoogle = settings.profile.authProvider === "google";

  return (
    <div className="mt-8 space-y-6">
      {/* Profile */}
      <section className="rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#dc2626] to-[#b91c1c] shadow-md">
            <UserRound className="h-4 w-4 text-white" />
          </span>
          <h2 className="font-bold text-[#b91c1c] tracking-tight">Profile</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[#6b7a9e]">
              Full name
            </span>
            <input
              value={settings.profile.name}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  profile: { ...settings.profile, name: e.target.value },
                })
              }
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[#6b7a9e]">
              Email
            </span>
            <input
              value={settings.profile.email}
              disabled
              className={`${inputClass} bg-[#fffafa]`}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[#6b7a9e]">
              Phone
            </span>
            <input
              value={settings.profile.phone}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  profile: { ...settings.profile, phone: e.target.value },
                })
              }
              className={inputClass}
              placeholder="03 xxxx xxxx"
            />
          </label>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#fb923c] shadow-md">
            <Bell className="h-4 w-4 text-white" />
          </span>
          <h2 className="font-bold text-[#b91c1c] tracking-tight">Notifications</h2>
        </div>
        <div className="space-y-2">
          <Toggle
            label="New applications"
            hint="Email me when someone applies to my jobs"
            checked={settings.notifications.emailNewApplications}
            onChange={(v) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  emailNewApplications: v,
                },
              })
            }
          />
          <Toggle
            label="Interview reminders"
            hint="Reminders before scheduled interviews"
            checked={settings.notifications.emailInterviewReminders}
            onChange={(v) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  emailInterviewReminders: v,
                },
              })
            }
          />
          <Toggle
            label="Weekly hiring digest"
            hint="Summary of jobs and applicants each week"
            checked={settings.notifications.emailWeeklyDigest}
            onChange={(v) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  emailWeeklyDigest: v,
                },
              })
            }
          />
          <Toggle
            label="Job status updates"
            hint="Alerts when jobs are paused, closed, or expire"
            checked={settings.notifications.emailJobStatus}
            onChange={(v) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  emailJobStatus: v,
                },
              })
            }
          />
        </div>
      </section>

      {/* Hiring preferences */}
      <section className="rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#dc2626] to-[#dc2626] shadow-md">
            <Briefcase className="h-4 w-4 text-white" />
          </span>
          <h2 className="font-bold text-[#b91c1c] tracking-tight">Hiring Preferences</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[#6b7a9e]">
              Default employment type
            </span>
            <select
              value={settings.hiring.defaultEmploymentType}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  hiring: {
                    ...settings.hiring,
                    defaultEmploymentType: e.target.value,
                  },
                })
              }
              className={`${inputClass} bg-white`}
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="casual">Casual</option>
              <option value="contract">Contract</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[#6b7a9e]">
              Default work mode
            </span>
            <select
              value={settings.hiring.defaultWorkMode}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  hiring: {
                    ...settings.hiring,
                    defaultWorkMode: e.target.value,
                  },
                })
              }
              className={`${inputClass} bg-white`}
            >
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[#6b7a9e]">
              Auto-pause jobs after (days)
            </span>
            <input
              type="number"
              min={0}
              max={365}
              value={settings.hiring.autoPauseAfterDays}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  hiring: {
                    ...settings.hiring,
                    autoPauseAfterDays: Number(e.target.value || 0),
                  },
                })
              }
              className={inputClass}
            />
            <span className="mt-1 block text-xs text-[#6b7a9e]">
              0 = never auto-pause
            </span>
          </label>
        </div>
        <div className="mt-3">
          <Toggle
            label="Show salary publicly"
            hint="Display salary range on open job listings"
            checked={settings.hiring.showSalaryPublicly}
            onChange={(v) =>
              setSettings({
                ...settings,
                hiring: { ...settings.hiring, showSalaryPublicly: v },
              })
            }
          />
        </div>
      </section>

      {/* Team access */}
      <section className="rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ec4899] to-[#f472b6] shadow-md">
            <Users className="h-4 w-4 text-white" />
          </span>
          <h2 className="font-bold text-[#b91c1c] tracking-tight">Team Access</h2>
        </div>
        <p className="mb-4 text-sm text-[#6b7a9e]">
          Invite teammates to view or help manage your hiring workspace.
        </p>

        <form
          onSubmit={inviteTeammate}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className={`${inputClass} sm:flex-1`}
            placeholder="teammate@email.com"
          />
          <select
            value={inviteAccess}
            onChange={(e) =>
              setInviteAccess(e.target.value as "viewer" | "editor")
            }
            className={`${inputClass} bg-white sm:w-36`}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button
            type="submit"
            disabled={inviting}
            className="rounded-xl bg-gradient-to-r from-[#ec4899] to-[#f472b6] px-4 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 disabled:opacity-60 transition-all"
          >
            {inviting ? "Inviting…" : "Invite"}
          </button>
        </form>

        {settings.teamInvites.length === 0 ? (
          <p className="mt-4 text-sm text-[#6b7a9e]">No team invites yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[#eef1f7]">
            {settings.teamInvites.map((invite) => (
              <li
                key={invite.id || invite.email}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#b91c1c]">
                    {invite.email}
                  </p>
                  <p className="text-xs text-[#6b7a9e]">
                    {invite.access} · {invite.status}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeInvite(invite)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#fee2e2] bg-[#fff5f5] px-2.5 py-1 text-xs font-semibold text-[#dc2626] hover:bg-[#fee2e2] transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Password */}
      {!isGoogle ? (
        <section className="rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-[#b91c1c] tracking-tight">🔒 Password</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[#6b7a9e]">
                Current password
              </span>
              <input
                type="password"
                value={password.current}
                onChange={(e) =>
                  setPassword((p) => ({ ...p, current: e.target.value }))
                }
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[#6b7a9e]">
                New password
              </span>
              <input
                type="password"
                minLength={6}
                value={password.next}
                onChange={(e) =>
                  setPassword((p) => ({ ...p, next: e.target.value }))
                }
                className={inputClass}
              />
            </label>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-[#e6eaf2] bg-white p-6">
          <h2 className="font-semibold tracking-[-0.02em]">Password</h2>
          <p className="mt-2 text-sm text-[#6b7a9e]">
            You signed in with Google. Password changes are managed through
            Google.
          </p>
        </section>
      )}

      <button
        type="button"
        onClick={saveSettings}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#dc2626] to-[#b91c1c] px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 hover:scale-[1.01] disabled:opacity-60 transition-all"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save Settings
      </button>
    </div>
  );
}
