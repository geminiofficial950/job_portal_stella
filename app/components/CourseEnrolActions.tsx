"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/app/components/AuthProvider";

export default function CourseEnrolActions({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<{
    referenceId: string;
    status: string;
    accessUrl?: string | null;
    message?: string;
  } | null>(null);

  async function enrol() {
    if (!user) {
      window.location.href = `/login?role=user&next=/courses/${slug}`;
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/learning/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Enrolment failed");
        return;
      }
      setInfo({
        referenceId: data.referenceId,
        status: data.status,
        accessUrl: data.accessUrl,
        message: data.message,
      });
      toast.success("Enrolment recorded");
    } catch {
      toast.error("Enrolment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <button
        type="button"
        disabled={loading}
        onClick={enrol}
        className="rounded-lg bg-[#00082C] px-4 py-2.5 text-sm font-semibold text-white"
      >
        {loading ? "Working…" : "Request enrolment / handoff"}
      </button>
      {info ? (
        <p className="text-sm text-slate-600">
          Ref <strong>{info.referenceId}</strong> · status{" "}
          <strong>{info.status}</strong>
          <br />
          {info.message}
          {info.accessUrl ? (
            <>
              {" "}
              <a
                href={info.accessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#2563eb]"
              >
                Open provider
              </a>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
