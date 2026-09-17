"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ArrowRight,
  Asterisk,
  Building2,
  Check,
  Clock3,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Save,
  Upload,
  Users,
} from "lucide-react";
import styles from "./CompanyProfileForm.module.css";
import ProfilePhotoCropPopup from "./ProfilePhotoCropPopup";
import { INDUSTRIES, LOCATIONS, withCurrentOption } from "@/lib/profileOptions";

type CompanyStatus = "pending" | "approved" | "rejected";

type Company = {
  id: string;
  name: string;
  website: string;
  industry: string;
  location: string;
  size: string;
  phone: string;
  about: string;
  logoUrl: string;
  status: CompanyStatus;
  rejectionReason: string;
};

const emptyForm = {
  name: "",
  website: "",
  industry: "",
  location: "",
  size: "",
  phone: "",
  about: "",
  logoUrl: "",
};

const sizeOptions = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

/** Dial codes for the countries this portal supports. */
const PHONE_CODES = [
  { code: "au", label: "Australia", flag: "🇦🇺", dial: "+61" },
  { code: "us", label: "USA", flag: "🇺🇸", dial: "+1" },
  { code: "gb", label: "UK", flag: "🇬🇧", dial: "+44" },
  { code: "nz", label: "New Zealand", flag: "🇳🇿", dial: "+64" },
  { code: "ca", label: "Canada", flag: "🇨🇦", dial: "+1" },
  { code: "sg", label: "Singapore", flag: "🇸🇬", dial: "+65" },
] as const;

function phoneMeta(code: string) {
  return PHONE_CODES.find((item) => item.code === code) ?? PHONE_CODES[0];
}

function composePhone(code: string, local: string) {
  const number = local.trim();
  if (!number) return "";
  const meta = phoneMeta(code);
  return `${meta.flag} ${meta.dial} ${number}`;
}

function parseStoredPhone(raw: string) {
  const value = raw.trim();
  if (!value) return { code: "au", number: "" };

  const byFlag = PHONE_CODES.find((item) => value.startsWith(item.flag));
  if (byFlag) {
    return {
      code: byFlag.code,
      number: value.slice(byFlag.flag.length).replace(byFlag.dial, "").trim(),
    };
  }

  if (/canada/i.test(value) && value.includes("+1")) {
    return {
      code: "ca",
      number: value.replace(/^\+1/, "").replace(/canada/i, "").replace(/[()]/g, "").trim(),
    };
  }

  const byDial = [...PHONE_CODES].sort((a, b) => b.dial.length - a.dial.length);
  for (const item of byDial) {
    if (!value.startsWith(item.dial)) continue;
    return {
      code: item.dial === "+1" ? "us" : item.code,
      number: value.slice(item.dial.length).trim(),
    };
  }

  return { code: "au", number: value };
}

const STEPS = ["Company details", "Logo", "About"];
const fieldClass =
  "w-full rounded-lg border border-[#cdd3e0] px-3.5 py-3 text-[15px] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all";

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className="mb-1.5 flex items-center gap-1 text-xs font-medium uppercase tracking-[0.12em] text-[#6b7a9e]">
      {children}
      {required ? (
        <Asterisk
          className="h-3.5 w-3.5 text-[#e11d48]"
          strokeWidth={3}
          aria-label="required"
        />
      ) : (
        <span className="normal-case tracking-normal text-[#9aa3b8]">
          (optional)
        </span>
      )}
    </span>
  );
}

function websiteHref(website: string) {
  const value = website.trim();
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function CompanyProfileShowcase({
  company,
  notice,
  onEdit,
}: {
  company: Company;
  notice: "" | "created" | "updated";
  onEdit: () => void;
}) {
  const site = websiteHref(company.website);
  const facts = [
    { icon: Building2, label: "Industry", value: company.industry },
    { icon: MapPin, label: "Location", value: company.location },
    { icon: Users, label: "Company size", value: company.size ? `${company.size} employees` : "" },
    { icon: Phone, label: "Phone", value: company.phone },
  ];

  return (
    <div className="space-y-5">
      {notice === "created" ? (
        <div className="rounded-2xl border border-[#86efac] bg-[#f0fdf4] px-5 py-4">
          <p className="flex items-center gap-2 text-base font-semibold text-[#166534]">
            <Check className="h-5 w-5" />
            Company profile created
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#166534]">
            Submitted for review. Hiring tools unlock once an admin approves your company.
          </p>
        </div>
      ) : null}
      {notice === "updated" ? (
        <div className="rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] px-5 py-4 text-sm font-medium text-[#1d4ed8]">
          Profile updated and sent back for review.
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-[#e6eaf2] bg-white shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)]">
        <div className="h-28 bg-[linear-gradient(120deg,#0f2744_0%,#2563eb_55%,#60a5fa_100%)]" />
        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logoUrl}
                  alt={`${company.name} logo`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Building2 className="h-8 w-8 text-[#6b7a9e]" />
              )}
            </div>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              <Pencil className="h-4 w-4" />
              Edit profile
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-[1.7rem]">
              {company.name}
            </h2>
            <StatusBadge status={company.status} />
          </div>

          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#64748b]">
            {company.industry ? <span>{company.industry}</span> : null}
            {company.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {company.location}
              </span>
            ) : null}
          </p>

          {company.status === "pending" ? (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#fffbeb] px-3.5 py-3 text-sm text-[#92400e]">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
              Pending approval. You can still edit details while our team reviews this profile.
            </p>
          ) : null}
          {company.status === "rejected" ? (
            <p className="mt-4 rounded-xl bg-[#fef2f2] px-3.5 py-3 text-sm text-[#991b1b]">
              {company.rejectionReason ||
                "Not approved. Update your details and resubmit for review."}
            </p>
          ) : null}
          {company.status === "approved" ? (
            <p className="mt-4 rounded-xl bg-[#f0fdf4] px-3.5 py-3 text-sm text-[#166534]">
              Company is active. Hiring tools are unlocked.
            </p>
          ) : null}

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {facts.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-[#e6eaf2] bg-[#f8fafc] px-4 py-3"
              >
                <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b7a9e]">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </dt>
                <dd className="mt-1 text-[15px] font-medium text-[#0f172a]">
                  {value || "—"}
                </dd>
              </div>
            ))}
          </dl>

          {site ? (
            <a
              href={site}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563eb] hover:underline"
            >
              <Globe className="h-4 w-4" />
              {company.website.replace(/^https?:\/\//i, "")}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5 shadow-sm sm:p-7">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6b7a9e]">
          About the company
        </h3>
        <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[#334155]">
          {company.about}
        </p>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: CompanyStatus }) {
  const styles =
    status === "approved"
      ? "bg-gradient-to-r from-[#d1fae5] to-[#a7f3d0] text-[#065f46] border border-[#6ee7b7]"
      : status === "rejected"
        ? "bg-gradient-to-r from-[#fee2e2] to-[#fecaca] text-[#991b1b] border border-[#f87171]"
        : "bg-gradient-to-r from-[#fef3c7] to-[#fde68a] text-[#78350f] border border-[#fcd34d]";

  const label =
    status === "approved"
      ? "✅ Active · Approved"
      : status === "rejected"
        ? "❌ Rejected"
        : "⏳ Pending Approval";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${styles}`}
    >
      {label}
    </span>
  );
}

export default function CompanyProfileForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [phoneCode, setPhoneCode] = useState("au");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [view, setView] = useState<"form" | "profile">("form");
  const [notice, setNotice] = useState<"" | "created" | "updated">("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/company", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error(data.message || "Failed to load company");
          return;
        }
        if (cancelled) return;
        if (data.company) {
          setCompany(data.company);
          setView("profile");
          const parsedPhone = parseStoredPhone(data.company.phone || "");
          setPhoneCode(parsedPhone.code);
          setPhoneLocal(parsedPhone.number);
          setForm({
            name: data.company.name || "",
            website: data.company.website || "",
            industry: data.company.industry || "",
            location: data.company.location || "",
            size: data.company.size || "",
            phone: composePhone(parsedPhone.code, parsedPhone.number) || data.company.phone || "",
            about: data.company.about || "",
            logoUrl: data.company.logoUrl || "",
          });
        }
      } catch {
        toast.error("Failed to load company");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(key: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function closeLogoCrop() {
    setCropImageSrc((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }

  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Choose a JPG, PNG, WEBP, or GIF logo");
      return;
    }
    if (!file.size || file.size > 10 * 1024 * 1024) {
      toast.error("Choose a logo under 10 MB");
      return;
    }
    setCropImageSrc((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  async function uploadLogo(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload/logo", { method: "POST", body });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Logo upload failed");
      }
      updateField("logoUrl", data.url);
      toast.success("Logo uploaded");
    } finally {
      setUploading(false);
    }
  }

  function stepError(index: number) {
    if (index === 0) {
      if (!form.name.trim() || form.name.trim().length < 2) return "Company name is required";
      if (phoneLocal.replace(/\D/g, "").length < 6) return "Enter a valid phone number";
      if (!form.industry.trim()) return "Industry is required";
      if (!form.size.trim()) return "Company size is required";
      if (!form.location.trim()) return "Location is required";
    }
    if (index === 1 && !form.logoUrl.trim()) return "Company logo is required";
    if (index === 2 && !form.about.trim()) return "About company is required";
    return "";
  }

  function goToStep(index: number) {
    if (index === step || uploading) return;
    if (index > step) {
      const error = stepError(step);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setStep(index);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      goToStep(step + 1);
      return;
    }

    for (let index = 0; index < STEPS.length; index += 1) {
      const error = stepError(index);
      if (error) {
        setStep(index);
        toast.error(error);
        return;
      }
    }

    setSaving(true);

    try {
      const method = company ? "PUT" : "POST";
      const res = await fetch("/api/company", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Save failed");
        return;
      }

      setCompany(data.company);
      setNotice(company ? "updated" : "created");
      setView("profile");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[#6b7a9e]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading company profile…
      </div>
    );
  }

  if (view === "profile" && company) {
    return (
      <CompanyProfileShowcase
        company={company}
        notice={notice}
        onEdit={() => {
          setNotice("");
          setStep(0);
          setView("form");
        }}
      />
    );
  }

  return (
    <div className="">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {company ? (
          <StatusBadge status={company.status} />
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold text-[#6b7a9e] border border-[#e6eaf2]">
            <Building2 className="h-3.5 w-3.5" />
            No profile yet
          </span>
        )}
        {company?.status === "pending" ? (
          <p className="text-sm font-medium text-[#92400e]">
            Profile submitted. Hiring tools unlock after an admin approves your
            company.
          </p>
        ) : null}
        {company?.status === "rejected" ? (
          <p className="text-sm font-medium text-[#991b1b]">
            {company.rejectionReason ||
              "Not approved. Update your details and resubmit for review."}
          </p>
        ) : null}
        {company?.status === "approved" ? (
          <p className="text-sm font-medium text-[#065f46]">
            Company is active. Major edits may send it back for admin review.
          </p>
        ) : null}
        {!company ? (
          <p className="text-sm font-medium text-[#475569]">
            Please fill your company profile and get approved to unlock the
            recruiter panel.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setView("profile")}
            className="text-sm font-semibold text-[#2563eb] hover:underline"
          >
            View profile
          </button>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm"
      >
        <ol className="grid grid-cols-3 gap-3">
          {STEPS.map((label, index) => {
            const current = index === step;
            const complete = index < step;
            return (
              <li key={label}>
                <button
                  type="button"
                  disabled={index > step || saving || uploading}
                  aria-current={current ? "step" : undefined}
                  onClick={() => goToStep(index)}
                  className={`flex w-full items-center gap-2 border-b-2 pb-3 text-left text-sm disabled:cursor-not-allowed ${
                    current
                      ? `border-[#2563eb] font-semibold ${styles.stepCurrent}`
                      : complete
                        ? "border-[#93c5fd] text-[#2563eb]"
                        : "border-[#e6eaf2] text-[#64748b]"
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs ${
                      current
                        ? styles.stepNumber
                        : complete
                          ? "bg-[#dbeafe] text-[#2563eb]"
                          : "border border-[#e6eaf2] text-[#64748b]"
                    }`}
                  >
                    {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className="min-w-0">{label}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <h2 className="text-lg font-semibold text-[#0f2744]">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </h2>

        {step === 0 ? (
          <>
            <label className="block">
              <FieldLabel required>Company name</FieldLabel>
              <input
                required
                minLength={2}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={fieldClass}
                placeholder="Gemini Education Pty Ltd"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <FieldLabel>Website</FieldLabel>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  className={fieldClass}
                  placeholder="https://"
                />
              </label>
              <label className="block">
                <FieldLabel required>Phone</FieldLabel>
                <div className="flex gap-2">
                  <select
                    aria-label="Country code"
                    value={phoneCode}
                    onChange={(e) => {
                      const next = e.target.value;
                      setPhoneCode(next);
                      updateField("phone", composePhone(next, phoneLocal));
                    }}
                    className="w-[5.75rem] shrink-0 rounded-lg border border-[#cdd3e0] bg-white px-2 py-3 text-[15px] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                  >
                    {PHONE_CODES.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.flag} {item.dial}
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={phoneLocal}
                    onChange={(e) => {
                      const next = e.target.value;
                      setPhoneLocal(next);
                      updateField("phone", composePhone(phoneCode, next));
                    }}
                    className={`${fieldClass} min-w-0 flex-1`}
                    placeholder="412 345 678"
                  />
                </div>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <FieldLabel required>Industry</FieldLabel>
                <select
                  required
                  value={form.industry}
                  onChange={(e) => updateField("industry", e.target.value)}
                  className={`${fieldClass} bg-white`}
                >
                  <option value="">Select industry</option>
                  {withCurrentOption(INDUSTRIES, form.industry).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <FieldLabel required>Company size</FieldLabel>
                <select
                  required
                  value={form.size}
                  onChange={(e) => updateField("size", e.target.value)}
                  className={`${fieldClass} bg-white`}
                >
                  <option value="">Select size</option>
                  {sizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt} employees
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <FieldLabel required>Location</FieldLabel>
              <select
                required
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                className={`${fieldClass} bg-white`}
              >
                <option value="">Select location</option>
                {form.location &&
                !LOCATIONS.some((group) => group.options.includes(form.location)) ? (
                  <option value={form.location}>{form.location}</option>
                ) : null}
                {LOCATIONS.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.options.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          </>
        ) : null}

        {step === 1 ? (
          <div className="block">
            <FieldLabel required>Company logo</FieldLabel>
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#e6eaf2] bg-[#f8fafc] p-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[#e6eaf2] bg-white">
                {form.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.logoUrl}
                    alt="Company logo preview"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Building2 className="h-6 w-6 text-[#6b7a9e]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={onLogoChange}
                  className="sr-only"
                  disabled={uploading}
                />
                <button
                  type="button"
                  className={styles.fileButton}
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? "Uploading…" : "Choose file"}
                </button>
                <p className="mt-2 text-xs text-[#6b7a9e]">
                  JPG, PNG, WEBP or GIF · drag and zoom to fit
                </p>
              </div>
              {form.logoUrl ? (
                <button
                  type="button"
                  onClick={() => updateField("logoUrl", "")}
                  className="text-sm font-medium text-[#b42318]"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <label className="block">
            <FieldLabel required>About company</FieldLabel>
            <textarea
              required
              rows={5}
              maxLength={2000}
              value={form.about}
              onChange={(e) => updateField("about", e.target.value)}
              className={fieldClass}
              placeholder="Tell candidates who you are and what you offer."
            />
          </label>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t border-[#e6eaf2] pt-5">
          <button
            type="button"
            disabled={step === 0 || saving || uploading}
            onClick={() => setStep((current) => current - 1)}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#475569] disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="submit"
              disabled={saving || uploading}
              className={styles.nextButton}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving || uploading}
              className={styles.nextButton}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {company ? "Save & submit for approval" : "Create & submit for approval"}
            </button>
          )}
        </div>
      </form>
      {cropImageSrc ? (
        <ProfilePhotoCropPopup
          imageSrc={cropImageSrc}
          shape="square"
          onCancel={closeLogoCrop}
          onComplete={async (file) => {
            try {
              await uploadLogo(file);
              closeLogoCrop();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Logo upload failed");
              throw error;
            }
          }}
        />
      ) : null}
    </div>
  );
}
