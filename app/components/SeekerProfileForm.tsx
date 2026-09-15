"use client";

import styles from "./SeekerProfileForm.module.css";
import Image from "next/image";
import SeekerProfilePreview from "./SeekerProfilePreview";
import ResumeProfileCompletion from "./ResumeProfileCompletion";
import SeekerHistoryFields from "./SeekerHistoryFields";
import ProfilePhotoCropPopup from "./ProfilePhotoCropPopup";
import { validateHistory, type ExperienceEntry, type EducationEntry } from "@/lib/seekerHistory";

import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthProvider";
import {
  Loader2,
  Save,
  X,
  Upload,
  CheckCircle2,
  PenLine,
  ArrowLeft,
  ArrowUpRight,
  Camera,
  ArrowRight,
} from "lucide-react";

export type ProfileState = {
  photoUrl: string;
  experiences: ExperienceEntry[];
  educations: EducationEntry[];
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

type Mode = "choose" | "preview" | "edit";

const emptyProfile = (): ProfileState => ({
  photoUrl: "",
  experiences: [],
  educations: [],
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

const inputClass = styles.input;
const PROFILE_STEPS = ["Basic details", "Experience", "Education", "About & skills", "Preferences & links"];

function normalizeHistorySkills(profile: ProfileState): ProfileState {
  const cleanSkills = (skills: string[]) => [...new Set(skills.map((skill) => skill.trim()).filter(Boolean))];
  return {
    ...profile,
    experiences: profile.experiences.map((entry) => ({ ...entry, skills: cleanSkills(entry.skills) })),
    educations: profile.educations.map((entry) => ({ ...entry, skills: cleanSkills(entry.skills) })),
  };
}

function validateStep(profile: ProfileState, step: number): string | null {
  if (step === 0) {
    if (profile.headline.trim().length < 5) return "Headline is required (min 5 characters)";
    if (profile.location.trim().length < 2) return "Location is required";
    if (!profile.experienceLevel) return "Please select experience level";
  }
  if (step === 1) return validateHistory(profile.experiences, []);
  if (step === 2) {
    if (!profile.educations.length) return "Add at least one education entry";
    return validateHistory([], profile.educations);
  }
  if (step === 3) {
    if (profile.about.trim().length < 30) return "About is required (min 30 characters)";
    if (!profile.skills.length) return "Add at least one skill";
  }
  if (step === 4) {
    if (!profile.preferredEmploymentTypes.length) return "Select at least one employment type";
    if (!profile.preferredWorkModes.length) return "Select at least one work mode";
    if (!isValidHttpUrl(profile.resumeUrl.trim())) return "Enter a valid resume URL";
    if (!isValidLinkedInUrl(profile.linkedin.trim())) return "Enter a valid LinkedIn profile URL";
    if (profile.portfolio.trim() && !isValidHttpUrl(profile.portfolio.trim())) return "Enter a valid portfolio URL";
  }
  return null;
}

const EMPLOYMENT = ["full-time", "part-time", "casual", "contract"];
const WORK_MODES = ["onsite", "hybrid", "remote"];


export function isValidHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidLinkedInUrl(value: string) {
  if (!isValidHttpUrl(value)) return false;
  try {
    const host = new URL(value).hostname.replace(/^www\./, "").toLowerCase();
    return host === "linkedin.com" || host.endsWith(".linkedin.com");
  } catch {
    return false;
  }
}


export function validateProfile(p: ProfileState): string | null {
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
  const historyError = validateHistory(p.experiences, p.educations);
  if (historyError) return historyError;
  if (!p.educations.length) {
    return "Education is required";
  }
  if (!p.skills.length) return "Add at least one skill";
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

  return {
    ...current,
    headline: String(imported.headline || "").trim() || current.headline,
    location: String(imported.location || "").trim() || current.location,
    about: String(imported.about || "").trim() || current.about,
    skills: skills.length ? skills : current.skills,
    experienceLevel,
    experiences: imported.experiences?.length ? imported.experiences : current.experiences,
    education: String(imported.education || "").trim() || current.education,
    educations: current.educations.length ? current.educations : imported.education ? [{ institution: imported.education, degree: "", description: "", skills: [] }] : [],
    preferredEmploymentTypes: employment.length
      ? employment
      : current.preferredEmploymentTypes,
    preferredWorkModes: modes.length ? modes : current.preferredWorkModes,
    linkedin:
      (importedLinkedin && isValidLinkedInUrl(importedLinkedin)
        ? importedLinkedin
        : "") ||
      current.linkedin,
    portfolio: String(imported.portfolio || "").trim() || current.portfolio,
    resumeUrl: String(imported.resumeUrl || "").trim() || current.resumeUrl,
    openToWork: imported.openToWork !== false,
  };
}

function ProfileSectionHeading({ step, title, copy }: { step: string; title: string; copy: string }) {
  return (
    <div className={styles.sectionHeading}>
      <span className={styles.sectionNumber}>{step}</span>
      <div><h3>{title}</h3><p>{copy}</p></div>
    </div>
  );
}

export default function SeekerProfileForm() {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [mode, setMode] = useState<Mode>("choose");
  const [skillInput, setSkillInput] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [profile, setProfile] = useState<ProfileState>(emptyProfile());
  const resumeInput = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState("");
  const [importedDraft, setImportedDraft] = useState<ProfileState | null>(null);

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

        setMode(hasMeaningfulProfile(next) ? "preview" : "choose");
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (uploadingPhoto || saving) return;
    const updatedProfile = normalizeHistorySkills(profile);
    if (!(e.currentTarget as HTMLFormElement).reportValidity()) return;
    const currentError = validateStep(updatedProfile, step);
    if (currentError) { setStepError(currentError); return; }
    setStepError("");
    setProfile(updatedProfile);
    if (step < PROFILE_STEPS.length - 1) { changeStep(step + 1); return; }
    const invalidStep = PROFILE_STEPS.findIndex((_, index) => validateStep(updatedProfile, index));
    if (invalidStep !== -1) {
      changeStep(invalidStep);
      setStepError(validateStep(updatedProfile, invalidStep) || "Please check this step");
      return;
    }
    const error = validateProfile(updatedProfile);
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/seeker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "profile", profile: updatedProfile }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Save failed");
        return;
      }
      setProfile(data.profile);
      toast.success("Profile saved");
      setStep(0);
      if (hasMeaningfulProfile(data.profile)) setMode("preview");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function importResume(resumeFile: File) {
    if (importing) return;
    if (!resumeFile.size || resumeFile.size > 8 * 1024 * 1024) {
      setImportError("Choose a non-empty resume under 8 MB."); return;
    }
    if (!/\.(pdf|docx|jpg|jpeg|png|webp)$/i.test(resumeFile.name)) {
      setImportError("Use PDF, DOCX, JPG, PNG, or WEBP."); return;
    }
    setImporting(true);
    setImportError("");
    try {
      const body = new FormData();
      body.append("file", resumeFile);
      const response = await fetch("/api/seeker/profile/parse-resume", { method: "POST", body });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Resume import failed. Try again.");
      setImportedDraft(mergeImportedProfile(profile, data.profile));
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Resume import failed. Try again.");
    } finally { setImporting(false); }
  }

  function changeStep(next: number) {
    setStep(next);
    setStepError("");
    requestAnimationFrame(() => {
      const heading = document.getElementById("profile-step-title");
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }

  function closePhotoCrop() {
    setCropImageSrc((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }

  function pickPhoto(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Choose a JPG, PNG, or WebP photo");
      return;
    }
    if (!file.size || file.size > 10 * 1024 * 1024) {
      toast.error("Choose a photo under 10 MB");
      return;
    }
    setCropImageSrc((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  async function uploadPhoto(file?: File) {
    if (!file) return false;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || !file.size || file.size > 2 * 1024 * 1024) {
      toast.error("Cropped photo must be a JPG, PNG, or WebP under 2 MB");
      return false;
    }
    setUploadingPhoto(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/seeker/profile/photo", { method: "POST", body });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Photo upload failed");
      setProfile((previous) => ({ ...previous, photoUrl: data.url }));
      toast.success("Profile photo saved");
      await refreshUser();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Photo upload failed");
      return false;
    } finally {
      setUploadingPhoto(false);
    }
  }

  if (loading) {
    return (
      <div className={`${styles.root} ${styles.loadingState} flex items-center gap-2 text-[#a1b0c7]`}>
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

  /* ── Choose: Manual vs Resume ── */
  if (mode === "choose") {
    return (
      <div className={`${styles.root} ${styles.profileFlow} mx-auto max-w-3xl space-y-6`}>
        <div>
          <p className={styles.eyebrow}>MAKE YOUR NEXT MOVE COUNT</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#e5edf9]">
            Build your profile
          </h1>
          <p className="mt-1 text-sm text-[#a1b0c7]">
            Choose how you want to get started. You can always edit before
            saving.
          </p>
        </div>

        {importedDraft && <ResumeProfileCompletion initial={importedDraft} onClose={() => setImportedDraft(null)} onSaved={(saved) => { setProfile(saved); setImportedDraft(null); setMode("preview"); toast.success("Profile saved"); }} />}
        <input
          ref={resumeInput}
          type="file"
          accept=".pdf,.docx,.jpg,.jpeg,.png,.webp"
          hidden
          disabled={importing}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void importResume(file);
          }}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled={importing}
            onClick={() => { setStep(0); setStepError(""); setMode("edit"); }}
            className={`${styles.surface} group rounded-[22px] border border-[#2d4463] bg-[#131d30] p-6 text-left shadow-[0_8px_24px_rgba(26,26,46,0.04)] transition hover:border-[#2d4463]/40 hover:shadow-[0_12px_28px_rgba(88,80,236,0.12)]`}
          >
            <span
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white"
              style={{ background: "var(--seeker-accent)" }}
            >
              <PenLine className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-[#e5edf9]">
              Create manually
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#a1b0c7]">
              Fill in headline, about, skills, education, and preferences
              yourself.
            </p>
            <span className={styles.cardAction}>Start building <ArrowUpRight size={16} /></span>
          </button>

          <button
            type="button"
            onClick={() => { setImportError(""); resumeInput.current?.click(); }}
            disabled={importing}
            aria-busy={importing}
            aria-describedby="resume-help"
            className={`${styles.surface} group rounded-[22px] border border-[#2d4463] bg-[#131d30] p-6 text-left shadow-[0_8px_24px_rgba(26,26,46,0.04)] transition hover:border-[#2d4463]/40 hover:shadow-[0_12px_28px_rgba(10,102,194,0.12)]`}
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563eb] text-white">
              {importing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            </span>
            <h2 className="mt-4 text-lg font-bold text-[#e5edf9]">
              Import from Resume
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#a1b0c7]">
              Upload your resume to autofill your experience, education, and skills.
            </p>
            <span className={styles.cardAction} aria-live="polite">{importing ? "Importing resume…" : "Upload resume"} <Upload size={16} /></span>
          </button>
        </div>
        <p id="resume-help" className="text-sm text-[#a1b0c7]">PDF, DOCX, JPG, PNG, or WEBP · Up to 8 MB. Your resume is processed by Google Gemini to extract your profile details.</p>
        {importError && <p role="alert" className="text-sm text-red-500">{importError}</p>}
      </div>
    );
  }

  /* Profile preview */
  if (mode === "preview") {
    return <SeekerProfilePreview profile={profile} name={userName} email={userEmail} phone={userPhone} initials={initials} onEdit={(nextStep) => { setStep(nextStep); setStepError(""); setMode("edit"); }} />;
  }

  /* ── Edit form ── */
  const requiredFieldError = validateStep(normalizeHistorySkills(profile), step);
  return (
    <>
    <form onSubmit={onSubmit} noValidate className={`${styles.root} ${styles.editForm}`}>
      <div className={`${styles.profileHeader} flex flex-wrap items-center justify-between gap-3`}>
        <div>
          <p className={styles.eyebrow}>MAKE YOUR NEXT MOVE COUNT</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#e5edf9]">
            {hasMeaningfulProfile(profile) ? "Edit profile" : "Build your profile"}
          </h1>
          <p className="mt-1 text-sm text-[#a1b0c7]">
            Review every field — recruiters will see this information.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasMeaningfulProfile(profile) ? (
            <button
              type="button"
              onClick={() => setMode("preview")}
              className="rounded-2xl border border-[#2d4463] bg-[#131d30] px-4 py-2.5 text-sm font-semibold text-[#e5edf9]"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode("choose")}
              className="rounded-2xl border border-[#2d4463] bg-[#131d30] px-4 py-2.5 text-sm font-semibold text-[#e5edf9]"
            >
              Back
            </button>
          )}
        </div>
      </div>

      <nav aria-label="Profile creation progress">
        <ol className={styles.stepper}>{PROFILE_STEPS.map((label, index) => <li key={label}>
          <button type="button" disabled={index > step || saving || uploadingPhoto} aria-current={index === step ? "step" : undefined} data-complete={index < step} onClick={() => changeStep(index)}>
            <span>{index < step ? <CheckCircle2 size={18} /> : index + 1}</span><span>{label}</span>
          </button>
        </li>)}</ol>
      </nav>
      <h2 id="profile-step-title" tabIndex={-1} className={styles.stepTitle}>Step {step + 1} of {PROFILE_STEPS.length}: {PROFILE_STEPS[step]}</h2>

      {step === 0 && <div className={styles.basicsGrid}>
        <section className={`${styles.surface} rounded-[22px] border border-[#2d4463] bg-[#131d30] p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)]`}>
          <div className="text-center">
            <div
              className={styles.avatar}
              style={{ background: "var(--seeker-accent)" }}
            >
              {profile.photoUrl ? <Image unoptimized width={86} height={86} src={profile.photoUrl} alt={`${userName || "Your"} profile`} className={styles.photo} /> : initials}
            </div>
            <label className={styles.photoUpload}>
              {uploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              {uploadingPhoto ? "Uploading..." : "Change photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadingPhoto || saving}
                aria-label="Upload profile photo"
                onChange={(event) => {
                  pickPhoto(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
            <p className="mt-3 font-bold text-[#e5edf9]">
              {userName || "Your name"}
            </p>
            <p className="mt-1 break-all text-xs text-[#8ab4ff]">
              {userEmail || "email@example.com"}
            </p>
          </div>
          <label className={styles.availability}>
            <span>Open to work</span>
            <input
              type="checkbox"
              checked={profile.openToWork}
              onChange={(e) =>
                setProfile((p) => ({ ...p, openToWork: e.target.checked }))
              }
              className="h-4 w-4 accent-[#3b82f6]"
            />
          </label>
        </section>

        <section className={`${styles.surface} rounded-[22px] border border-[#2d4463] bg-[#131d30] p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)] lg:col-span-2`}>
          <ProfileSectionHeading step="01" title="The essentials" copy="Your headline, background, and where you want to go." />
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-[#a1b0c7]">
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
              <span className="mb-1.5 block text-xs font-semibold text-[#a1b0c7]">
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
              <span className="mb-1.5 block text-xs font-semibold text-[#a1b0c7]">
                Experience level *
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
          </div>
        </section>
      </div>

      }
      {(step === 1 || step === 2) && <SeekerHistoryFields kind={step === 1 ? "experiences" : "educations"} experiences={profile.experiences} educations={profile.educations} onChange={(value) => setProfile((previous) => ({ ...previous, ...value }))} />}
      {step === 3 && <>
      <section className={`${styles.surface} rounded-[22px] border border-[#2d4463] bg-[#131d30] p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)]`}>
        <ProfileSectionHeading step="04" title="Your story" copy="Introduce your experience, interests, and career goals." />
        <label htmlFor="profile-about" className={styles.fieldLabel}>About *</label>
        <textarea
          id="profile-about"
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

      <section className={`${styles.surface} rounded-[22px] border border-[#2d4463] bg-[#131d30] p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)]`}>
        <ProfileSectionHeading step="04" title="What you’re great at" copy="Your professional skills." />
        <label htmlFor="profile-skills" className={styles.fieldLabel}>Skills *</label>
        <div className="flex gap-2">
          <input
            className={inputClass}
            id="profile-skills"
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
            className="shrink-0 rounded-xl border border-[#2d4463] px-4 text-sm font-semibold"
          >
            Add
          </button>
        </div>
        {profile.skills.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <li
                key={skill}
                className="inline-flex items-center gap-1 rounded-full bg-[#25385b] px-3 py-1 text-sm text-[#8ab4ff]"
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

      </>}
      {step === 4 && <div className="grid gap-4 lg:grid-cols-2">
        <section className={`${styles.surface} rounded-[22px] border border-[#2d4463] bg-[#131d30] p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)]`}>
          <ProfileSectionHeading step="05" title="Your ideal role" copy="Choose the ways you’d like to work." />
          <p className="mb-2 text-xs font-semibold text-[#a1b0c7]">
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
                  aria-pressed={active}
                  className={`${styles.choiceChip} rounded-full px-3 py-1.5 text-sm capitalize ${
                    active
                      ? "bg-[#2563eb] text-white"
                      : "border border-[#2d4463] bg-[#131d30] text-[#a1b0c7]"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
          <p className="mb-2 text-xs font-semibold text-[#a1b0c7]">
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
                  aria-pressed={active}
                  className={`${styles.choiceChip} rounded-full px-3 py-1.5 text-sm capitalize ${
                    active
                      ? "bg-[#2563eb] text-white"
                      : "border border-[#2d4463] bg-[#131d30] text-[#a1b0c7]"
                  }`}
                >
                  {modeOption}
                </button>
              );
            })}
          </div>
        </section>

        <section className={`${styles.surface} rounded-[22px] border border-[#2d4463] bg-[#131d30] p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)]`}>
          <ProfileSectionHeading step="05" title="Put your work forward" copy="Connect your resume and professional profiles." />
          <div className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#a1b0c7]">
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
              <span className="mb-1.5 block text-xs font-semibold text-[#a1b0c7]">
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
              <span className="mb-1.5 block text-xs font-semibold text-[#a1b0c7]">
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
      }
      {(requiredFieldError || stepError) && <p id="profile-step-error" role="status" className={styles.stepError}>{requiredFieldError || stepError}</p>}
      <div className={styles.stepActions}>
        <button type="button" className={styles.historyButton} disabled={step === 0 || saving || uploadingPhoto} onClick={() => changeStep(step - 1)}><ArrowLeft size={16} />Back</button>
        <button type="submit" disabled={saving || uploadingPhoto || Boolean(requiredFieldError)} aria-describedby={requiredFieldError || stepError ? "profile-step-error" : undefined} className={styles.stepNext}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : step === 4 ? <Save size={16} /> : <ArrowRight size={16} />}
          {saving ? "Saving..." : step === 4 ? "Save profile" : "Next"}
        </button>
      </div>
    </form>
    {cropImageSrc && (
      <ProfilePhotoCropPopup
        imageSrc={cropImageSrc}
        onCancel={closePhotoCrop}
        onComplete={async (file) => {
          const ok = await uploadPhoto(file);
          if (ok) closePhotoCrop();
          else throw new Error("Photo upload failed");
        }}
      />
    )}
    </>
  );
}
