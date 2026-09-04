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

function RegisterForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const role = useMemo(
    () => resolveRole(searchParams.get("role")),
    [searchParams],
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isRecruiter = role === "recruiter";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Registration failed");
        return;
      }

      await refreshUser();
      toast.success("Account created successfully");

      if (data.user?.role === "recruiter") {
        router.push("/dashboard/recruiter");
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
      titlePrefix="Join"
      titleAccent="Gemini Education and Careers"
      subtitle={
        isRecruiter
          ? "Create an employer account to post jobs."
          : "Create a profile and start getting matched."
      }
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/login?role=${role}`}>Sign in</Link>
        </>
      }
    >
      <GoogleAuthButton
        role={role}
        label="Sign up with Google"
        className="auth-google"
      />

      <div className="auth-divider">or use email</div>

      <form onSubmit={onSubmit} className="auth-form">
        <div className="auth-field">
          <label htmlFor="reg-name">
            Full name <span className="req">*</span>
          </label>
          <input
            id="reg-name"
            type="text"
            required
            minLength={2}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isRecruiter ? "Your name" : "Your full name"}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="reg-email">
            Email <span className="req">*</span>
          </label>
          <input
            id="reg-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="reg-phone">Phone (optional)</label>
          <input
            id="reg-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="04xx xxx xxx"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="reg-password">
            Password <span className="req">*</span>
          </label>
          <div className="auth-password">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
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

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? "Creating account…" : "Register"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="auth-page" />}>
      <RegisterForm />
    </Suspense>
  );
}
