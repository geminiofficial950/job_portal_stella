"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ArrowLeft, ArrowRight, Building2, Check, Loader2, Save, Upload, Asterisk } from "lucide-react";
import styles from "./CompanyProfileForm.module.css";

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
  const [step, setStep] = useState(0);

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
          setForm({
            name: data.company.name || "",
            website: data.company.website || "",
            industry: data.company.industry || "",
            location: data.company.location || "",
            size: data.company.size || "",
            phone: data.company.phone || "",
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

  async function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/upload/logo", {
        method: "POST",
        body,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Logo upload failed");
        return;
      }

      updateField("logoUrl", data.url);
      toast.success("Logo uploaded");
    } catch {
      toast.error("Logo upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function stepError(index: number) {
    if (index === 0) {
      if (!form.name.trim() || form.name.trim().length < 2) return "Company name is required";
      if (!form.phone.trim()) return "Phone is required";
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
      toast.success(data.message || "Saved");
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
        ) : null}
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
                <input
                  required
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={fieldClass}
                  placeholder="03 xxxx xxxx"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <FieldLabel required>Industry</FieldLabel>
                <input
                  required
                  value={form.industry}
                  onChange={(e) => updateField("industry", e.target.value)}
                  className={fieldClass}
                  placeholder="Aged care / Disability"
                />
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
              <input
                required
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                className={fieldClass}
                placeholder="Melbourne, VIC"
              />
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
                  JPG, PNG, WEBP or GIF · max 2MB
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
    </div>
  );
}
