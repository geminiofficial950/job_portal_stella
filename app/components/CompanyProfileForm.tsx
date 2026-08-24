"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Building2, Loader2, Save, Upload, Asterisk } from "lucide-react";

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error("Company name is required");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Phone is required");
      return;
    }
    if (!form.industry.trim()) {
      toast.error("Industry is required");
      return;
    }
    if (!form.size.trim()) {
      toast.error("Company size is required");
      return;
    }
    if (!form.location.trim()) {
      toast.error("Location is required");
      return;
    }
    if (!form.logoUrl.trim()) {
      toast.error("Company logo is required");
      return;
    }
    if (!form.about.trim()) {
      toast.error("About company is required");
      return;
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
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#fef2f2] to-[#fef2f2] px-3 py-1 text-xs font-semibold text-[#6b7a9e] border border-[#e6eaf2]">
            <Building2 className="h-3.5 w-3.5" />
            No profile yet
          </span>
        )}
        {company?.status === "pending" ? (
          <p className="text-sm font-medium text-[#92400e]">
            ⏳ Waiting for admin approval before this company goes live.
          </p>
        ) : null}
        {company?.status === "rejected" ? (
          <p className="text-sm font-medium text-[#991b1b]">
            ❌ {company.rejectionReason ||
              "Rejected. Update details and resubmit."}
          </p>
        ) : null}
        {company?.status === "approved" ? (
          <p className="text-sm font-medium text-[#065f46]">
            ✅ Company is active. Editing will send it back to pending review.
          </p>
        ) : null}
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm"
      >
        <label className="block">
          <FieldLabel required>Company name</FieldLabel>
          <input
            required
            minLength={2}
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full rounded-lg border border-[#cdd3e0] px-3.5 py-3 text-[15px] outline-none focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
            placeholder="Stella Care Pty Ltd"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <FieldLabel>Website</FieldLabel>
            <input
              type="text"
              value={form.website}
              onChange={(e) => updateField("website", e.target.value)}
              className="w-full rounded-lg border border-[#cdd3e0] px-3.5 py-3 text-[15px] outline-none focus:border-[#dc2626]"
              placeholder="https://"
            />
          </label>
          <label className="block">
            <FieldLabel required>Phone</FieldLabel>
            <input
              required
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="w-full rounded-lg border border-[#cdd3e0] px-3.5 py-3 text-[15px] outline-none focus:border-[#dc2626]"
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
              className="w-full rounded-lg border border-[#cdd3e0] px-3.5 py-3 text-[15px] outline-none focus:border-[#dc2626]"
              placeholder="Aged care / Disability"
            />
          </label>
          <label className="block">
            <FieldLabel required>Company size</FieldLabel>
            <select
              required
              value={form.size}
              onChange={(e) => updateField("size", e.target.value)}
              className="w-full rounded-lg border border-[#cdd3e0] bg-white px-3.5 py-3 text-[15px] outline-none focus:border-[#dc2626]"
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
            className="w-full rounded-lg border border-[#cdd3e0] px-3.5 py-3 text-[15px] outline-none focus:border-[#dc2626]"
            placeholder="Melbourne, VIC"
          />
        </label>

        <div className="block">
          <FieldLabel required>Company logo</FieldLabel>
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#e0e7ff] bg-gradient-to-br from-[#fef2f2] to-[#f5f3ff] p-4">
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
                className="block w-full text-sm text-[#4a5878] file:mr-3 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-[#dc2626] file:to-[#b91c1c] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90 transition-all"
                disabled={uploading}
              />
              <p className="mt-2 text-xs text-[#6b7a9e]">
                JPG, PNG, WEBP or GIF · max 2MB · uploads to Cloudinary
              </p>
              {uploading ? (
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[#b91c1c]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading…
                </p>
              ) : null}
            </div>
            {form.logoUrl ? (
              <button
                type="button"
                onClick={() => updateField("logoUrl", "")}
                className="text-sm font-medium text-[#b42318] hover:underline"
              >
                Remove
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-[#6b7a9e]">
                <Upload className="h-3.5 w-3.5" />
                Choose file
              </span>
            )}
          </div>
        </div>

        <label className="block">
          <FieldLabel required>About company</FieldLabel>
          <textarea
            required
            rows={5}
            maxLength={2000}
            value={form.about}
            onChange={(e) => updateField("about", e.target.value)}
            className="w-full rounded-lg border border-[#cdd3e0] px-3.5 py-3 text-[15px] outline-none focus:border-[#dc2626]"
            placeholder="Tell candidates who you are and what you offer."
          />
        </label>

        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#dc2626] to-[#b91c1c] px-5 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 hover:scale-[1.02] disabled:opacity-60 transition-all"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {company
            ? "Save & Submit for Approval"
            : "Create & Submit for Approval"}
        </button>
      </form>
    </div>
  );
}
