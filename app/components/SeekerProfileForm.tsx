"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Loader2,
  Save,
  X,
  FileUp,
  PenLine,
  ArrowLeft,
  Pencil,
  MapPin,
  GraduationCap,
  Link2,
  ExternalLink,
  Briefcase,
  CheckCircle2,
  Globe,
  DollarSign,
} from "lucide-react";

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

type Mode = "choose" | "resume" | "manual" | "preview";

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
  "w-full rounded-lg border border-[#cdd3e0] px-3.5 py-3 text-[15px] outline-none focus:border-[#dc2626]";

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
  if (!p.experienceLevel) {
    return "Please select experience level";
  }
  if (!p.about.trim() || p.about.trim().length < 30) {
    return "About is required (min 30 characters)";
  }
  if (!p.education.trim() || p.education.trim().length < 3) {
    return "Education is required";
  }
  if (!p.skills.length) {
    return "Add at least one skill";
  }
  if (!p.salaryExpectation.trim()) {
    return "Salary expectation is required";
  }
  if (!isValidSalaryExpectation(p.salaryExpectation)) {
    return "Please select a salary expectation from the list";
  }
  if (!p.resumeUrl.trim()) {
    return "Resume URL is required";
  }
  if (!isValidHttpUrl(p.resumeUrl.trim())) {
    return "Resume URL must be a valid http/https link";
  }
  if (!p.linkedin.trim()) {
    return "LinkedIn URL is required";
  }
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
      p.location.trim()
  );
}

export default function SeekerProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [mode, setMode] = useState<Mode>("choose");
  const [fromResume, setFromResume] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [userName, setUserName] = useState("");
  const [profile, setProfile] = useState<ProfileState>(emptyProfile());
  const fileRef = useRef<HTMLInputElement>(null);

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
        if (hasMeaningfulProfile(next)) {
          setMode("preview");
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  async function onParseResume(file: File) {
    setParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/seeker/profile/parse-resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Could not parse resume");
        return;
      }
      setProfile((prev) => ({
        ...prev,
        ...data.profile,
        resumeUrl: data.profile.resumeUrl || prev.resumeUrl,
      }));
      setFromResume(true);
      setMode("manual");
      toast.success("Details extracted — review and save");
    } catch {
      toast.error("Could not parse resume");
    } finally {
      setParsing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
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
      toast.success("Profile saved");
      if (hasMeaningfulProfile(data.profile)) setMode("preview");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  /* ── Profile Preview Card ── */
  if (mode === "preview") {
    const nameParts = userName.trim().split(/\s+/).filter(Boolean);
    const initials = nameParts.length
      ? nameParts.length === 1
        ? nameParts[0].slice(0, 2).toUpperCase()
        : `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : profile.headline
        ? profile.headline.slice(0, 2).toUpperCase()
        : "ME";
    const expColors: Record<string, string> = {
      entry: "bg-[#d1fae5] text-[#065f46]",
      mid: "bg-[#dbeafe] text-[#1e40af]",
      senior: "bg-[#ede9fe] text-[#4c1d95]",
    };
    const expColor = expColors[profile.experienceLevel] ?? "bg-[#f1f5f9] text-[#6b7a9e]";

    return (
      <div className="space-y-4">
        {/* Header card */}
        <div className="rounded-2xl border border-[#e6eaf2] bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1e3a5f] text-lg font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-[#0f172a] truncate">
                  {userName || "Your name"}
                </h2>
                {profile.headline ? (
                  <p className="mt-0.5 text-sm font-medium text-[#475569] truncate">
                    {profile.headline}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#64748b]">
                  {profile.location ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {profile.location}
                    </span>
                  ) : null}
                  {profile.experienceLevel ? (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${expColor}`}
                    >
                      {profile.experienceLevel}
                    </span>
                  ) : null}
                  {profile.openToWork ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#d1fae5] px-2.5 py-0.5 text-[11px] font-bold text-[#065f46]">
                      <CheckCircle2 className="h-3 w-3" /> Open to Work
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-semibold text-[#1e293b] hover:bg-[#f8fafc] transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit Profile
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left col: about + skills */}
          <div className="space-y-4 lg:col-span-2">
            {profile.about && (
              <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#6b7a9e]">
                  <Briefcase className="h-3.5 w-3.5" /> About
                </h3>
                <p className="text-sm leading-relaxed text-[#3a4a6b] whitespace-pre-line">{profile.about}</p>
              </section>
            )}

            {profile.skills.length > 0 && (
              <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#6b7a9e]">
                  ✦ Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-[#f1f5f9] border border-[#e2e8f0] px-3 py-1 text-xs font-semibold text-[#334155]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {profile.education && (
              <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#6b7a9e]">
                  <GraduationCap className="h-3.5 w-3.5" /> Education
                </h3>
                <p className="text-sm text-[#3a4a6b] font-medium">{profile.education}</p>
              </section>
            )}
          </div>

          {/* Right col: details */}
          <div className="space-y-4">
            <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#6b7a9e]">Details</h3>
              <ul className="space-y-3 text-sm">
                {profile.salaryExpectation && (
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f0fdf4]">
                      <DollarSign className="h-3.5 w-3.5 text-[#059669]" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9aa3b8]">Salary</p>
                      <p className="font-semibold text-[#1e293b]">{profile.salaryExpectation}</p>
                    </div>
                  </li>
                )}
                {(profile.preferredEmploymentTypes.length > 0) && (
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f1f5f9]">
                      <Briefcase className="h-3.5 w-3.5 text-[#dc2626]" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9aa3b8]">Work type</p>
                      <p className="font-semibold text-[#1e293b] capitalize">{profile.preferredEmploymentTypes.join(" · ")}</p>
                    </div>
                  </li>
                )}
                {(profile.preferredWorkModes.length > 0) && (
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fff7ed]">
                      <Globe className="h-3.5 w-3.5 text-[#ea580c]" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9aa3b8]">Work mode</p>
                      <p className="font-semibold text-[#1e293b] capitalize">{profile.preferredWorkModes.join(" · ")}</p>
                    </div>
                  </li>
                )}
              </ul>
            </section>

            <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#6b7a9e]">Links</h3>
              <ul className="space-y-2.5">
                {profile.resumeUrl && (
                  <li>
                    <a href={profile.resumeUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-sm font-semibold text-[#dc2626] hover:underline">
                      <Link2 className="h-3.5 w-3.5 shrink-0" /> Resume
                    </a>
                  </li>
                )}
                {profile.linkedin && (
                  <li>
                    <a href={profile.linkedin} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-sm font-semibold text-[#0a66c2] hover:underline">
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" /> LinkedIn
                    </a>
                  </li>
                )}
                {profile.portfolio && (
                  <li>
                    <a href={profile.portfolio} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-sm font-semibold text-[#7c3aed] hover:underline">
                      <Globe className="h-3.5 w-3.5 shrink-0" /> Portfolio
                    </a>
                  </li>
                )}
                {!profile.resumeUrl && !profile.linkedin && !profile.portfolio && (
                  <li className="text-xs text-[#9aa3b8]">No links added yet</li>
                )}
              </ul>
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[#6b7a9e]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading profile…
      </div>
    );
  }

  if (mode === "choose") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("resume")}
          className="group rounded-2xl border border-[#e6eaf2] bg-white p-6 text-left transition hover:border-[#dc2626] hover:shadow-md"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#dc2626] group-hover:bg-[#dc2626] group-hover:text-white transition-colors">
            <FileUp className="h-5 w-5" />
          </span>
          <p className="mt-4 text-lg font-semibold text-[#1e293b]">
            Fill with resume
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#6b7a9e]">
            Upload PDF, DOCX, or image. We read your resume and fill
            headline, skills, education, and more.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setMode("manual")}
          className="group rounded-2xl border border-[#e6eaf2] bg-white p-6 text-left transition hover:border-[#dc2626] hover:shadow-md"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#dc2626] group-hover:bg-[#dc2626] group-hover:text-white transition-colors">
            <PenLine className="h-5 w-5" />
          </span>
          <p className="mt-4 text-lg font-semibold text-[#1e293b]">
            Fill manually
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#6b7a9e]">
            Enter your details yourself — skills, about, preferences, and links.
          </p>
        </button>
      </div>
    );
  }

  if (mode === "resume") {
    return (
      <div className="rounded-2xl border border-[#e6eaf2] bg-white p-6 sm:p-8">
        <button
          type="button"
          onClick={() => setMode("choose")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6b7a9e] hover:text-[#0f172a]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mt-5 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#b91c1c]">
            <FileUp className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em]">
            Upload your resume
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#6b7a9e]">
            PDF, DOCX, JPG, or PNG up to 8MB. We&apos;ll extract profile fields —
            you can edit everything before saving.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-lg">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
            className="hidden"
            disabled={parsing}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onParseResume(file);
            }}
          />
          <button
            type="button"
            disabled={parsing}
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#cdd3e0] bg-[#f8fafc] px-6 py-12 transition hover:border-[#dc2626] disabled:opacity-70"
          >
            {parsing ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-[#b91c1c]" />
                <p className="mt-3 font-medium text-[#1e293b]">
                  Reading your resume…
                </p>
                <p className="mt-1 text-sm text-[#6b7a9e]">
                  Usually takes a few seconds
                </p>
              </>
            ) : (
              <>
                <FileUp className="h-8 w-8 text-[#b91c1c]" />
                <p className="mt-3 font-medium text-[#1e293b]">
                  Choose resume file
                </p>
                <p className="mt-1 text-sm text-[#6b7a9e]">
                  Drag & drop not required — click to browse
                </p>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setMode("choose")}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[#6b7a9e] hover:text-[#0f172a]"
        >
          <ArrowLeft className="h-4 w-4" />
          Change fill method
        </button>
        <button
          type="button"
          onClick={() => setMode("resume")}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#cdd3e0] bg-white px-3 py-2 text-sm font-medium text-[#1e293b]"
        >
          <FileUp className="h-4 w-4" />
          Fill from resume again
        </button>
      </div>

      {fromResume ? (
        <div className="rounded-xl border border-[#d7f3f6] bg-[#f1f5f9] px-4 py-3 text-sm text-[#dc2626]">
          Fields were filled from your resume. Review everything, tweak what you
          need, then save.
        </div>
      ) : null}

      <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Career profile</h2>
            <p className="mt-1 text-sm text-[#6b7a9e]">
              Fill what you want recruiters to see. You can update anytime.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={profile.openToWork}
              onChange={(e) =>
                setProfile((p) => ({ ...p, openToWork: e.target.checked }))
              }
              className="h-4 w-4 accent-[#dc2626]"
            />
            Open to work
          </label>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium">
              Headline <span className="text-[#dc2626]">*</span>
            </span>
            <input
              className={inputClass}
              value={profile.headline}
              onChange={(e) =>
                setProfile((p) => ({ ...p, headline: e.target.value }))
              }
              placeholder="e.g. Frontend developer · React & TypeScript"
              required
              minLength={5}
              maxLength={120}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              Location <span className="text-[#dc2626]">*</span>
            </span>
            <input
              className={inputClass}
              value={profile.location}
              onChange={(e) =>
                setProfile((p) => ({ ...p, location: e.target.value }))
              }
              placeholder="City, country"
              required
              minLength={2}
              maxLength={120}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              Experience level <span className="text-[#dc2626]">*</span>
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
            <span className="mb-1.5 block text-sm font-medium">
              About <span className="text-[#dc2626]">*</span>
            </span>
            <textarea
              className={`${inputClass} min-h-[120px] resize-y`}
              value={profile.about}
              onChange={(e) =>
                setProfile((p) => ({ ...p, about: e.target.value }))
              }
              placeholder="Short summary of your background and goals"
              required
              minLength={30}
              maxLength={2000}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium">
              Education <span className="text-[#dc2626]">*</span>
            </span>
            <input
              className={inputClass}
              value={profile.education}
              onChange={(e) =>
                setProfile((p) => ({ ...p, education: e.target.value }))
              }
              placeholder="Degree · School · Year"
              required
              minLength={3}
              maxLength={200}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              Salary expectation <span className="text-[#dc2626]">*</span>
            </span>
            <select
              className={inputClass}
              value={
                (SALARY_OPTIONS as readonly string[]).includes(
                  profile.salaryExpectation
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
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              Resume URL <span className="text-[#dc2626]">*</span>
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
              maxLength={500}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              LinkedIn <span className="text-[#dc2626]">*</span>
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
              maxLength={200}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              Portfolio{" "}
              <span className="font-normal text-[#94a3b8]">(optional)</span>
            </span>
            <input
              className={inputClass}
              type="url"
              value={profile.portfolio}
              onChange={(e) =>
                setProfile((p) => ({ ...p, portfolio: e.target.value }))
              }
              placeholder="https://your-site.com"
              maxLength={200}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5 sm:p-6">
        <h2 className="font-semibold">
          Skills <span className="text-[#dc2626]">*</span>
        </h2>
        <p className="mt-1 text-sm text-[#6b7a9e]">
          Press Enter or comma to add a skill. At least one is required.
        </p>
        <div className="mt-4 flex gap-2">
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
            className="shrink-0 rounded-lg border border-[#cdd3e0] px-4 text-sm font-medium"
          >
            Add
          </button>
        </div>
        {profile.skills.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <li
                key={skill}
                className="inline-flex items-center gap-1 rounded-full bg-[#f1f5f9] px-3 py-1 text-sm text-[#dc2626]"
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

      <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5 sm:p-6">
        <h2 className="font-semibold">Job preferences</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">
              Employment type <span className="text-[#dc2626]">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
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
                          type
                        ),
                      }))
                    }
                    className={`rounded-full px-3 py-1.5 text-sm capitalize ${
                      active
                        ? "bg-[#b91c1c] text-white"
                        : "border border-[#cdd3e0] bg-white text-[#4a5878]"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">
              Work mode <span className="text-[#dc2626]">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {WORK_MODES.map((modeOption) => {
                const active =
                  profile.preferredWorkModes.includes(modeOption);
                return (
                  <button
                    key={modeOption}
                    type="button"
                    onClick={() =>
                      setProfile((p) => ({
                        ...p,
                        preferredWorkModes: toggleInList(
                          p.preferredWorkModes,
                          modeOption
                        ),
                      }))
                    }
                    className={`rounded-full px-3 py-1.5 text-sm capitalize ${
                      active
                        ? "bg-[#b91c1c] text-white"
                        : "border border-[#cdd3e0] bg-white text-[#4a5878]"
                    }`}
                  >
                    {modeOption}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#dc2626] to-[#b91c1c] px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 hover:scale-[1.01] disabled:opacity-60 transition-all"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save Profile
      </button>
    </form>
  );
}
