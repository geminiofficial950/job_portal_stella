"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, X } from "lucide-react";
import { toast } from "react-toastify";
import GoogleAuthButton from "@/app/components/GoogleAuthButton";
import { useAuth } from "@/app/components/AuthProvider";
import {
  useAuthModal,
  type AuthMode,
} from "@/app/components/AuthModalProvider";
import "@/app/auth/auth.css";

export default function AuthModal() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { open, mode, role, closeAuth, setMode, setRole } = useAuthModal();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";
  const isRecruiter = role === "recruiter";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuth();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, closeAuth]);

  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setShowPassword(false);
      setLoading(false);
    }
  }, [open]);

  async function redirectAfterAuth(userRole?: string) {
    closeAuth();
    if (userRole === "recruiter") router.push("/dashboard/recruiter");
    else if (userRole === "admin") router.push("/dashboard/admin");
    else router.push("/dashboard/seeker");
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
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
        await redirectAfterAuth(data.user?.role);
      } else {
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
        await redirectAfterAuth(data.user?.role);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="auth-modal-overlay"
      role="presentation"
      onClick={closeAuth}
    >
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="auth-modal-close"
          onClick={closeAuth}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="auth-modal-visual" aria-hidden="true">
          <div className="auth-visual-blob" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/auth/hero.png" alt="" />
        </div>

        <div className="auth-modal-panel">
          <h2 id="auth-modal-title" className="auth-brand">
            {isLogin ? "Sign in to" : "Join"}{" "}
            <span>Gemini Education and Careers</span>
          </h2>
          <p className="auth-sub">
            {isLogin
              ? isRecruiter
                ? "Post roles and review verified candidates."
                : "Continue your career journey now."
              : isRecruiter
                ? "Create an employer account to post jobs."
                : "Create a profile and start getting matched."}
          </p>

          <div className="auth-role-switch" role="tablist" aria-label="Account type">
            <button
              type="button"
              className={!isRecruiter ? "is-active" : ""}
              onClick={() => setRole("user")}
            >
              Job seeker
            </button>
            <button
              type="button"
              className={isRecruiter ? "is-active" : ""}
              onClick={() => setRole("recruiter")}
            >
              Recruiter
            </button>
          </div>

          <GoogleAuthButton
            role={role}
            label={isLogin ? "Sign in with Google" : "Sign up with Google"}
            className="auth-google"
          />

          <div className="auth-divider">or use email</div>

          <form onSubmit={onSubmit} className="auth-form">
            {!isLogin ? (
              <div className="auth-field">
                <label htmlFor="auth-modal-name">
                  Full name <span className="req">*</span>
                </label>
                <input
                  id="auth-modal-name"
                  type="text"
                  required
                  minLength={2}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isRecruiter ? "Your name" : "Your full name"}
                />
              </div>
            ) : null}

            <div className="auth-field">
              <label htmlFor="auth-modal-email">
                Email <span className="req">*</span>
              </label>
              <input
                id="auth-modal-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            {!isLogin ? (
              <div className="auth-field">
                <label htmlFor="auth-modal-phone">Phone (optional)</label>
                <input
                  id="auth-modal-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="04xx xxx xxx"
                />
              </div>
            ) : null}

            <div className="auth-field">
              <label htmlFor="auth-modal-password">
                Password <span className="req">*</span>
              </label>
              <div className="auth-password">
                <input
                  id="auth-modal-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={isLogin ? undefined : 6}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    isLogin ? "Enter your password" : "At least 6 characters"
                  }
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

            {isLogin ? (
              <div className="auth-row">
                <label className="auth-remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
              </div>
            ) : null}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading
                ? isLogin
                  ? "Signing in…"
                  : "Creating account…"
                : isLogin
                  ? "Sign in"
                  : "Register"}
            </button>
          </form>

          <p className="auth-footer">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="auth-footer-btn"
                  onClick={() => setMode("register" satisfies AuthMode)}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="auth-footer-btn"
                  onClick={() => setMode("login" satisfies AuthMode)}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
