"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Loader2,
  Save,
  X,
  Pencil,
  Link2,
  ExternalLink,
  CheckCircle2,
  Globe,
  PenLine,
  ArrowLeft,
} from "lucide-react";
import { DASH } from "@/app/lib/dashboardTheme";
import { useRouter } from "next/navigation";

type ProfileState = {
  headline: string;
  location: string;
  about: string;
  skills: string[];
  experienceLevel: "" | "entry" | "mid" | "senior";
  education: string;
  preferredEmploymentTypes: string[];
  preferredWorkModes: string[];
  salaryExpectation: string;
  linkedin: string;
  portfolio: string;
  resumeUrl: string;
  openToWork: boolean;
};

type Mode = "choose" | "import" | "preview" | "edit";

const emptyProfile = (): ProfileState => ({
  headline: "",
  location: "",
  about: "",
  skills: [],
  experienceLevel: "",
  education: "",
  preferredEmploymentTypes: [],
  preferredWorkModes: [],
  salaryExpectation: "",
  linkedin: "",
  portfolio: "",
  resumeUrl: "",
  openToWork: true,
});

const inputClass =
  "w-full rounded-xl border border-[#dce3f5] bg-white px-3.5 py-2.5 text-[14px] text-[#0f172a] outline-none focus:border-[#5850ec] focus:ring-2 focus:ring-[#5850ec]/15";

const EMPLOYMENT = ["full-time", "part-time", "casual", "contract"];
const WORK_MODES = ["onsite", "hybrid", "remote"];

const SALARY_OPTIONS = [
  "AUD 40k–50k / year",
  "AUD 50k–60k / year",
  "AUD 60k–70k / year",
  "AUD 70k–80k / year",
  "AUD 80k–95k / year",
  "AUD 95k–110k / year",
  "AUD 110k–130k / year",
  "AUD 130k–150k / year",
  "AUD 150k–180k / year",
  "AUD 180k–220k / year",
  "AUD 220k+ / year",
  "Negotiable",
] as const;

function isValidHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidLinkedInUrl(value: string) {
  if (!isValidHttpUrl(value)) return false;
  try {
    const host = new URL(value).hostname.replace(/^www\./, "").toLowerCase();
    return host === "linkedin.com" || host.endsWith(".linkedin.com");
  } catch {
    return false;
  }
}

function isValidSalaryExpectation(value: string) {
  return (SALARY_OPTIONS as readonly string[]).includes(value.trim());
}

function validateProfile(p: ProfileState): string | null {
  if (!p.headline.trim() || p.headline.trim().length < 5) {
    return "Headline is required (min 5 characters)";
  }
  if (!p.location.trim() || p.location.trim().length < 2) {
    return "Location is required";
  }
  if (!p.experienceLevel) return "Please select experience level";
  if (!p.about.trim() || p.about.trim().length < 30) {
    return "About is required (min 30 characters)";
  }
  if (!p.education.trim() || p.education.trim().length < 3) {
    return "Education is required";
  }
  if (!p.skills.length) return "Add at least one skill";
  if (!p.salaryExpectation.trim()) return "Salary expectation is required";
  if (!isValidSalaryExpectation(p.salaryExpectation)) {
    return "Please select a salary expectation from the list";
  }
  if (!p.resumeUrl.trim()) return "Resume URL is required";
  if (!isValidHttpUrl(p.resumeUrl.trim())) {
    return "Resume URL must be a valid http/https link";
  }
  if (!p.linkedin.trim()) return "LinkedIn URL is required";
  if (!isValidLinkedInUrl(p.linkedin.trim())) {
    return "Enter a valid LinkedIn profile URL (linkedin.com/in/...)";
  }
  if (p.portfolio.trim() && !isValidHttpUrl(p.portfolio.trim())) {
    return "Portfolio must be a valid http/https link";
  }
  if (!p.preferredEmploymentTypes.length) {
    return "Select at least one employment type";
  }
  if (!p.preferredWorkModes.length) {
    return "Select at least one work mode";
  }
  return null;
}

function toggleInList(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function hasMeaningfulProfile(p: ProfileState) {
  return Boolean(
    p.headline.trim() ||
      p.about.trim() ||
      p.skills.length ||
      p.education.trim() ||
      p.location.trim(),
  );
}

function mergeImportedProfile(
  current: ProfileState,
  imported: Partial<ProfileState>,
  linkedinUrl: string,
): ProfileState {
  const skills = Array.isArray(imported.skills)
    ? imported.skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 30)
    : current.skills;

  const level = String(imported.experienceLevel || "");
  const experienceLevel = (["entry", "mid", "senior"].includes(level)
    ? level
    : current.experienceLevel) as ProfileState["experienceLevel"];

  const employment = Array.isArray(imported.preferredEmploymentTypes)
    ? imported.preferredEmploymentTypes
        .map((s) => String(s).toLowerCase())
        .filter((s) => EMPLOYMENT.includes(s))
    : [];

  const modes = Array.isArray(imported.preferredWorkModes)
    ? imported.preferredWorkModes
        .map((s) => String(s).toLowerCase())
        .filter((s) => WORK_MODES.includes(s))
    : [];

  const importedLinkedin = String(imported.linkedin || "").trim();
  const typedLinkedin = linkedinUrl.trim();

  return {
    ...current,
    headline: String(imported.headline || "").trim() || current.headline,
    location: String(imported.location || "").trim() || current.location,
    about: String(imported.about || "").trim() || current.about,
    skills: skills.length ? skills : current.skills,
    experienceLevel,
    education: String(imported.education || "").trim() || current.education,
    preferredEmploymentTypes: employment.length
      ? employment
      : current.preferredEmploymentTypes,
    preferredWorkModes: modes.length ? modes : current.preferredWorkModes,
    salaryExpectation: isValidSalaryExpectation(
      String(imported.salaryExpectation || "").trim(),
    )
      ? String(imported.salaryExpectation).trim()
      : current.salaryExpectation,
    linkedin:
      (importedLinkedin && isValidLinkedInUrl(importedLinkedin)
        ? importedLinkedin
        : "") ||
      (typedLinkedin && isValidLinkedInUrl(typedLinkedin) ? typedLinkedin : "") ||
      current.linkedin,
    portfolio: String(imported.portfolio || "").trim() || current.portfolio,
    resumeUrl: String(imported.resumeUrl || "").trim() || current.resumeUrl,
    openToWork: imported.openToWork !== false,
  };
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#eef2ff] py-2.5 last:border-0">
      <span className="shrink-0 text-[13px] text-[#6b7280]">{label}</span>
      <span className="min-w-0 break-words text-right text-[13px] font-semibold text-[#0f172a] [overflow-wrap:anywhere]">
        {value || "—"}
      </span>
    </div>
  );
}

export default function SeekerProfileForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [mode, setMode] = useState<Mode>("choose");
  const [skillInput, setSkillInput] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [profile, setProfile] = useState<ProfileState>(emptyProfile());
  const [linkedinWarnings, setLinkedinWarnings] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/seeker/profile", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error(data.message || "Failed to load profile");
          return;
        }
        const next = data.profile as ProfileState;
        setProfile(next);
        setUserName(String(data.account?.name || "").trim());
        setUserEmail(String(data.account?.email || "").trim());
        setUserPhone(String(data.account?.phone || "").trim());

        const params = new URLSearchParams(window.location.search);
        const linkedinStatus = params.get("linkedin");

        if (linkedinStatus === "error") {
          toast.error(
            params.get("message") || "LinkedIn import failed. Try again.",
          );
          setMode(hasMeaningfulProfile(next) ? "edit" : "choose");
          router.replace("/dashboard/seeker/profile");
        } else if (linkedinStatus === "imported") {
          setImporting(true);
          try {
            const importRes = await fetch(
              "/api/seeker/profile/linkedin/result",
              { cache: "no-store" },
            );
            const importData = await importRes.json();
            if (!importRes.ok || !importData.success) {
              toast.error(importData.message || "LinkedIn import failed");
              setMode(hasMeaningfulProfile(next) ? "edit" : "choose");
            } else {
              const merged = mergeImportedProfile(
                next,
                importData.profile as Partial<ProfileState>,
                String(importData.profile?.linkedin || ""),
              );
              setProfile(merged);
              if (importData.account?.name) {
                setUserName(String(importData.account.name));
              }
              const warnings = Array.isArray(importData.linkedin?.warnings)
                ? (importData.linkedin.warnings as string[])
                : [];
              setLinkedinWarnings(warnings);
              toast.success(
                importData.message ||
                  "LinkedIn profile imported — review and save",
              );
              setMode("edit");
            }
          } finally {
            setImporting(false);
            router.replace("/dashboard/seeker/profile");
          }
        } else {
          setMode(hasMeaningfulProfile(next) ? "preview" : "choose");
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  function addSkill() {
    const value = skillInput.trim();
    if (!value) return;
    if (profile.skills.includes(value)) {
      setSkillInput("");
      return;
    }
    if (profile.skills.length >= 30) {
      toast.error("Max 30 skills");
      return;
    }
    setProfile((p) => ({ ...p, skills: [...p.skills, value] }));
    setSkillInput("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const error = validateProfile(profile);
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/seeker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "profile", profile }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Save failed");
        return;
      }
      setProfile(data.profile);
      setLinkedinWarnings([]);
      toast.success("Profile saved");
      if (hasMeaningfulProfile(data.profile)) setMode("preview");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  function startLinkedInOAuth() {
    setImporting(true);
    window.location.href = "/api/seeker/profile/linkedin/authorize";
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[#6b7280]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading profile…
      </div>
    );
  }

  const nameParts = userName.trim().split(/\s+/).filter(Boolean);
  const initials = nameParts.length
    ? nameParts.length === 1
      ? nameParts[0].slice(0, 2).toUpperCase()
      : `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    : "ME";

  /* ── Choose: Manual vs LinkedIn ── */
  if (mode === "choose") {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            Build your profile
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Choose how you want to get started. You can always edit before
            saving.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className="group rounded-[22px] border border-[#e8ecf8] bg-white p-6 text-left shadow-[0_8px_24px_rgba(26,26,46,0.04)] transition hover:border-[#5850ec]/40 hover:shadow-[0_12px_28px_rgba(88,80,236,0.12)]"
          >
            <span
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white"
              style={{ background: DASH.accent }}
            >
              <PenLine className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-[#0f172a]">
              Create manually
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
              Fill in headline, about, skills, education, and preferences
              yourself.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMode("import")}
            className="group rounded-[22px] border border-[#e8ecf8] bg-white p-6 text-left shadow-[0_8px_24px_rgba(26,26,46,0.04)] transition hover:border-[#0a66c2]/40 hover:shadow-[0_12px_28px_rgba(10,102,194,0.12)]"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0a66c2] text-white">
              <ExternalLink className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-[#0f172a]">
              Import from LinkedIn
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
              Sign in with LinkedIn (official OAuth) and autofill your profile.
            </p>
          </button>
        </div>
      </div>
    );
  }

  /* ── Import from LinkedIn OAuth ── */
  if (mode === "import") {
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
              Import from LinkedIn
            </h1>
            <p className="mt-1 text-sm text-[#6b7280]">
              Official LinkedIn OAuth. With Member Data Portability access we
              can import About, experience, education, and skills (often
              EU/EEA/CH profiles).
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setMode(hasMeaningfulProfile(profile) ? "edit" : "choose")
            }
            className="inline-flex items-center gap-1.5 rounded-2xl border border-[#dce3f5] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        </div>

        <div className="space-y-4 rounded-[22px] border border-[#e8ecf8] bg-white p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)]">
          <ol className="space-y-2 text-sm text-[#475569]">
            <li>
              <span className="font-semibold text-[#0f172a]">1.</span> Continue
              with LinkedIn and approve access
            </li>
            <li>
              <span className="font-semibold text-[#0f172a]">2.</span> We fetch
              allowed profile fields via LinkedIn APIs
            </li>
            <li>
              <span className="font-semibold text-[#0f172a]">3.</span> Review
              autofilled form fields, then save
            </li>
          </ol>

          <button
            type="button"
            onClick={startLinkedInOAuth}
            disabled={importing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(10,102,194,0.28)] disabled:opacity-60"
            style={{ background: "#0a66c2" }}
          >
            {importing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            {importing ? "Redirecting to LinkedIn…" : "Continue with LinkedIn"}
          </button>

          <button
            type="button"
            onClick={() => setMode("edit")}
            className="w-full text-center text-sm font-semibold text-[#5850ec] hover:underline"
          >
            Create manually instead
          </button>
        </div>
      </div>
    );
  }

  /* ── CLINIK-style preview ── */
  if (mode === "preview") {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
              Career profile
            </h1>
            <p className="mt-1 text-sm text-[#6b7280]">
              How employers see your profile on Gemini Education and Careers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMode("edit")}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(88,80,236,0.3)]"
            style={{ background: DASH.accent }}
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#e8ecf8] bg-white p-6 text-center shadow-[0_8px_24px_rgba(26,26,46,0.04)]">
            <div
              className="mx-auto flex h-28 w-28 items-center justify-center rounded-full text-3xl font-bold text-white shadow-md"
              style={{ background: DASH.accent }}
            >
              {initials}
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#0f172a]">
              {userName || "Your name"}
            </h2>
            {profile.headline ? (
              <p className="mt-1 text-sm font-medium text-[#5850ec]">
                {profile.headline}
              </p>
            ) : null}
            <div className="mt-4 space-y-1.5 text-sm text-[#5850ec]">
              {userPhone ? <p>{userPhone}</p> : null}
              {userEmail ? <p className="break-all">{userEmail}</p> : null}
            </div>
            {profile.openToWork ? (
              <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-3 py-1 text-[11px] font-bold text-[#166534]">
                <CheckCircle2 className="h-3 w-3" /> Open to work
              </span>
            ) : null}
          </section>

          <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#e8ecf8] bg-white p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)]">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0f172a]">
                General information
              </h3>
              <button
                type="button"
                onClick={() => setMode("edit")}
                className="rounded-lg p-1.5 text-[#94a3b8] hover:bg-[#f4f3fb] hover:text-[#5850ec]"
                aria-label="Edit general information"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
            <InfoRow label="Location" value={profile.location} />
            <InfoRow
              label="Experience"
              value={
                profile.experienceLevel
                  ? profile.experienceLevel.charAt(0).toUpperCase() +
                    profile.experienceLevel.slice(1)
                  : "—"
              }
            />
            <InfoRow label="Education" value={profile.education} />
            <InfoRow label="Salary" value={profile.salaryExpectation} />
            <InfoRow
              label="Work type"
              value={profile.preferredEmploymentTypes.join(", ")}
            />
            <InfoRow
              label="Work mode"
              value={profile.preferredWorkModes.join(", ")}
            />
          </section>

          <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#e8ecf8] bg-white p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)]">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0f172a]">About</h3>
              <button
                type="button"
                onClick={() => setMode("edit")}
                className="rounded-lg p-1.5 text-[#94a3b8] hover:bg-[#f4f3fb] hover:text-[#5850ec]"
                aria-label="Edit about"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="max-w-full break-all text-sm leading-relaxed text-[#475569] whitespace-pre-line [overflow-wrap:anywhere]">
              {profile.about || "No summary yet."}
            </p>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <section className="rounded-[22px] border border-[#e8ecf8] bg-white p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)] lg:col-span-3">
            <h3 className="mb-3 text-[15px] font-bold text-[#0f172a]">Skills</h3>
            {profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-[#ecebff] px-3 py-1.5 text-xs font-semibold text-[#5850ec]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6b7280]">No skills added yet.</p>
            )}
          </section>

          <section className="rounded-[22px] border border-[#e8ecf8] bg-white p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)] lg:col-span-2">
            <h3 className="mb-3 text-[15px] font-bold text-[#0f172a]">Links</h3>
            <ul className="space-y-2.5">
              {profile.resumeUrl ? (
                <li>
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-[#5850ec] hover:underline"
                  >
                    <Link2 className="h-3.5 w-3.5" /> Resume
                  </a>
                </li>
              ) : null}
              {profile.linkedin ? (
                <li>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-[#0a66c2] hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                </li>
              ) : null}
              {profile.portfolio ? (
                <li>
                  <a
                    href={profile.portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-[#7c3aed] hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" /> Portfolio
                  </a>
                </li>
              ) : null}
              {!profile.resumeUrl && !profile.linkedin && !profile.portfolio ? (
                <li className="text-sm text-[#6b7280]">No links added yet</li>
              ) : null}
            </ul>
          </section>
        </div>
      </div>
    );
  }

  /* ── Edit form ── */
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            {hasMeaningfulProfile(profile) ? "Edit profile" : "Build your profile"}
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Review every field — recruiters will see this information.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={startLinkedInOAuth}
            disabled={importing}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-[#0a66c2]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#0a66c2] disabled:opacity-60"
          >
            {importing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ExternalLink className="h-3.5 w-3.5" />
            )}
            Re-import from LinkedIn
          </button>
          {hasMeaningfulProfile(profile) ? (
            <button
              type="button"
              onClick={() => setMode("preview")}
              className="rounded-2xl border border-[#dce3f5] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569]"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode("choose")}
              className="rounded-2xl border border-[#dce3f5] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569]"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(88,80,236,0.3)] disabled:opacity-60"
            style={{ background: DASH.accent }}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </button>
        </div>
      </div>

      {linkedinWarnings.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">LinkedIn import notes</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {linkedinWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-[22px] border border-[#e8ecf8] bg-white p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)]">
          <div className="text-center">
            <div
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ background: DASH.accent }}
            >
              {initials}
            </div>
            <p className="mt-3 font-bold text-[#0f172a]">
              {userName || "Your name"}
            </p>
            <p className="mt-1 break-all text-xs text-[#5850ec]">
              {userEmail || "email@example.com"}
            </p>
          </div>
          <label className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-[#f4f3fb] px-3 py-2.5 text-sm font-medium">
            <span>Open to work</span>
            <input
              type="checkbox"
              checked={profile.openToWork}
              onChange={(e) =>
                setProfile((p) => ({ ...p, openToWork: e.target.checked }))
              }
              className="h-4 w-4 accent-[#5850ec]"
            />
          </label>
        </section>

        <section className="rounded-[22px] border border-[#e8ecf8] bg-white p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)] lg:col-span-2">
          <h3 className="mb-4 text-[15px] font-bold text-[#0f172a]">
            General information
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-[#6b7280]">
                Headline *
              </span>
              <input
                className={inputClass}
                value={profile.headline}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, headline: e.target.value }))
                }
                placeholder="e.g. Frontend developer · React"
                required
                minLength={5}
                maxLength={120}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#6b7280]">
                Location *
              </span>
              <input
                className={inputClass}
                value={profile.location}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="City, country"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#6b7280]">
                Experience *
              </span>
              <select
                className={inputClass}
                value={profile.experienceLevel}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    experienceLevel: e.target
                      .value as ProfileState["experienceLevel"],
                  }))
                }
                required
              >
                <option value="">Select level</option>
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-[#6b7280]">
                Education *
              </span>
              <input
                className={inputClass}
                value={profile.education}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, education: e.target.value }))
                }
                placeholder="Degree · School · Year"
                required
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-[#6b7280]">
                Salary expectation *
              </span>
              <select
                className={inputClass}
                value={
                  (SALARY_OPTIONS as readonly string[]).includes(
                    profile.salaryExpectation,
                  )
                    ? profile.salaryExpectation
                    : ""
                }
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    salaryExpectation: e.target.value,
                  }))
                }
                required
              >
                <option value="">Select salary range</option>
                {SALARY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
      </div>

      <section className="rounded-[22px] border border-[#e8ecf8] bg-white p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)]">
        <h3 className="mb-3 text-[15px] font-bold text-[#0f172a]">About *</h3>
        <textarea
          className={`${inputClass} min-h-[120px] resize-y`}
          value={profile.about}
          onChange={(e) =>
            setProfile((p) => ({ ...p, about: e.target.value }))
          }
          placeholder="Write a short summary of your background and goals"
          required
          minLength={30}
          maxLength={2000}
        />
      </section>

      <section className="rounded-[22px] border border-[#e8ecf8] bg-white p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)]">
        <h3 className="mb-1 text-[15px] font-bold text-[#0f172a]">Skills *</h3>
        <p className="mb-3 text-xs text-[#6b7280]">
          Press Enter or Add — edit imported skills as needed.
        </p>
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="React, TypeScript, Figma..."
          />
          <button
            type="button"
            onClick={addSkill}
            className="shrink-0 rounded-xl border border-[#dce3f5] px-4 text-sm font-semibold"
          >
            Add
          </button>
        </div>
        {profile.skills.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <li
                key={skill}
                className="inline-flex items-center gap-1 rounded-full bg-[#ecebff] px-3 py-1 text-sm text-[#5850ec]"
              >
                {skill}
                <button
                  type="button"
                  aria-label={`Remove ${skill}`}
                  onClick={() =>
                    setProfile((p) => ({
                      ...p,
                      skills: p.skills.filter((s) => s !== skill),
                    }))
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[22px] border border-[#e8ecf8] bg-white p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)]">
          <h3 className="mb-3 text-[15px] font-bold text-[#0f172a]">
            Job preferences
          </h3>
          <p className="mb-2 text-xs font-semibold text-[#6b7280]">
            Employment type *
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {EMPLOYMENT.map((type) => {
              const active = profile.preferredEmploymentTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setProfile((p) => ({
                      ...p,
                      preferredEmploymentTypes: toggleInList(
                        p.preferredEmploymentTypes,
                        type,
                      ),
                    }))
                  }
                  className={`rounded-full px-3 py-1.5 text-sm capitalize ${
                    active
                      ? "bg-[#5850ec] text-white"
                      : "border border-[#dce3f5] bg-white text-[#4a5878]"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
          <p className="mb-2 text-xs font-semibold text-[#6b7280]">
            Work mode *
          </p>
          <div className="flex flex-wrap gap-2">
            {WORK_MODES.map((modeOption) => {
              const active = profile.preferredWorkModes.includes(modeOption);
              return (
                <button
                  key={modeOption}
                  type="button"
                  onClick={() =>
                    setProfile((p) => ({
                      ...p,
                      preferredWorkModes: toggleInList(
                        p.preferredWorkModes,
                        modeOption,
                      ),
                    }))
                  }
                  className={`rounded-full px-3 py-1.5 text-sm capitalize ${
                    active
                      ? "bg-[#5850ec] text-white"
                      : "border border-[#dce3f5] bg-white text-[#4a5878]"
                  }`}
                >
                  {modeOption}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[22px] border border-[#e8ecf8] bg-white p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)]">
          <h3 className="mb-3 text-[15px] font-bold text-[#0f172a]">Links</h3>
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#6b7280]">
                Resume URL *
              </span>
              <input
                className={inputClass}
                type="url"
                value={profile.resumeUrl}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, resumeUrl: e.target.value }))
                }
                placeholder="https://drive.google.com/..."
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#6b7280]">
                LinkedIn *
              </span>
              <input
                className={inputClass}
                type="url"
                value={profile.linkedin}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, linkedin: e.target.value }))
                }
                placeholder="https://www.linkedin.com/in/your-name"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#6b7280]">
                Portfolio (optional)
              </span>
              <input
                className={inputClass}
                type="url"
                value={profile.portfolio}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, portfolio: e.target.value }))
                }
                placeholder="https://your-site.com"
              />
            </label>
          </div>
        </section>
      </div>
    </form>
  );
}
