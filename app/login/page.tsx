"use client";

import React, { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, UserRound, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import GoogleAuthButton from "@/app/components/GoogleAuthButton";
import { useAuth } from "@/app/components/AuthProvider";

type AuthRole = "user" | "recruiter";

function resolveRole(value: string | null): AuthRole {
  return value === "recruiter" ? "recruiter" : "user";
}

function LoginForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const role = useMemo(
    () => resolveRole(searchParams.get("role")),
    [searchParams]
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isRecruiter = role === "recruiter";
  const title = isRecruiter ? "Sign in as recruiter" : "Sign in as job seeker";
  const subtitle = isRecruiter
    ? "Post roles and review verified candidates."
    : "Access your profile, matches and applications.";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Login failed");
        return;
      }

      await refreshUser();
      toast.success("Signed in successfully");

      if (data.user?.role === "recruiter") {
        router.push("/dashboard/recruiter");
      } else if (data.user?.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/seeker");
      }
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fffafa] text-[#b91c1c] font-[family-name:var(--font-ui)]">
      <header className="border-b border-[#e6eaf2] bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link href="/" className="text-[19px] font-semibold tracking-[-0.05em]">
            Stella<span className="font-normal text-[#6b7a9e]">Jobs</span>
          </Link>
          <Link
            href={isRecruiter ? "/login?role=user" : "/login?role=recruiter"}
            className="text-sm text-[#6b7a9e] hover:text-[#b91c1c]"
          >
            {isRecruiter ? "Job seeker login" : "Recruiter login"}
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col px-5 py-14">
        <div className="mb-8 flex items-center gap-3">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              isRecruiter ? "bg-[#dc2626] text-white" : "bg-[#fef2f2] text-[#b91c1c]"
            }`}
          >
            {isRecruiter ? <Building2 className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
          </span>
          <div>
            <h1 className="text-2xl font-medium tracking-[-0.04em]">{title}</h1>
            <p className="mt-1 text-sm text-[#6b7a9e]">{subtitle}</p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-[16px] border border-[#e6eaf2] bg-white p-6 shadow-[0_10px_30px_-14px_rgba(185,28,28,0.16)]"
        >
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[#6b7a9e]">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#cdd3e0] bg-white px-3.5 py-3 text-[15px] outline-none focus:border-[#dc2626]"
              placeholder="you@email.com"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[#6b7a9e]">
              Password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#cdd3e0] bg-white px-3.5 py-3 pr-11 text-[15px] outline-none focus:border-[#dc2626]"
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-[#6b7a9e]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#dc2626] px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-[#b91c1c] hover:text-white disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
            {!loading ? <ArrowRight className="h-4 w-4" /> : null}
          </button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#e6eaf2]" />
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#6b7a9e]">
              or
            </span>
            <span className="h-px flex-1 bg-[#e6eaf2]" />
          </div>

          <GoogleAuthButton role={role} label="Sign in with Google" />
        </form>

        <p className="mt-6 text-center text-sm text-[#6b7a9e]">
          New here?{" "}
          <Link
            href={`/register?role=${role}`}
            className="font-semibold text-[#b91c1c] underline decoration-[#dc2626] underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fffafa]" />}>
      <LoginForm />
    </Suspense>
  );
}
