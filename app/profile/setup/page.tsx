"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";

export default function ProfileSetupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/register?role=user&next=/profile/setup");
      return;
    }
    if (user.role === "recruiter") {
      router.replace("/dashboard/recruiter");
      return;
    }
    if (user.role === "admin") {
      router.replace("/dashboard/admin");
      return;
    }
    router.replace("/dashboard/seeker/profile");
  }, [user, loading, router]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <h1 className="text-2xl font-bold text-[#0f2744]">Setting up your profile</h1>
      <p className="mt-2 text-slate-500">
        {loading ? "Checking your account…" : "Redirecting…"}
      </p>
      <p className="mt-4 text-sm text-slate-500">
        <Link href="/dashboard/seeker/profile" className="text-[#2563eb]">
          Open profile
        </Link>{" "}
        ·{" "}
        <Link
          href="/register?role=user&next=/profile/setup"
          className="text-[#2563eb]"
        >
          Create account
        </Link>
      </p>
    </main>
  );
}
