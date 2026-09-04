"use client";

import React, { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import GoogleAuthButton from "@/app/components/GoogleAuthButton";
import { useAuth } from "@/app/components/AuthProvider";
import { AuthShell } from "@/app/auth/AuthShell";
import "@/app/auth/auth.css";

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
    [searchParams],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isRecruiter = role === "recruiter";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
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
    <AuthShell
      role={role}
      titlePrefix="Sign in to"
      titleAccent="Gemini Education and Careers"
      subtitle={
        isRecruiter
          ? "Post roles and review verified candidates."
          : "Continue your career journey now."
      }
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href={`/register?role=${role}`}>Register</Link>
        </>
      }
    >
      <GoogleAuthButton
        role={role}
        label="Sign in with Google"
        className="auth-google"
      />

      <div className="auth-divider">or use email</div>

      <form onSubmit={onSubmit} className="auth-form">
        <div className="auth-field">
          <label htmlFor="login-email">
            Email <span className="req">*</span>
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">
            Password <span className="req">*</span>
          </label>
          <div className="auth-password">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="auth-row">
          <label className="auth-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
          <span className="auth-link" aria-hidden="true">
            Forgot password?
          </span>
        </div>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-page" />}>
      <LoginForm />
    </Suspense>
  );
}
