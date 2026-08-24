"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { toast } from "react-toastify";
import { getFirebaseAuth, googleProvider } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";

type AuthRole = "user" | "recruiter";

const ROLE_KEY = "stella_google_role";

interface GoogleAuthButtonProps {
  role: AuthRole;
  label?: string;
}

function redirectForRole(role: string, router: ReturnType<typeof useRouter>) {
  if (role === "recruiter") router.push("/dashboard/recruiter");
  else if (role === "admin") router.push("/dashboard/admin");
  else router.push("/dashboard/seeker");
  router.refresh();
}

function firebaseErrorMessage(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: string }).code)
      : "";

  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "";
    case "auth/popup-blocked":
      return "Popup blocked. Allow popups for this site and try again.";
    case "auth/unauthorized-domain":
      return "This domain is not allowed. Add localhost in Firebase → Authentication → Settings → Authorized domains.";
    case "auth/operation-not-allowed":
      return "Google sign-in is disabled. Enable Google in Firebase → Authentication → Sign-in method.";
    case "auth/configuration-not-found":
      return "Firebase Auth is not set up. Enable Authentication in Firebase Console.";
    case "auth/api-key-not-valid":
    case "auth/invalid-api-key":
      return "Invalid Firebase API key. Check your .env Firebase config.";
    case "auth/network-request-failed":
      return "Network error. Check your internet and try again.";
    case "auth/account-exists-with-different-credential":
      return "This email is already registered with another sign-in method.";
    default: {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: string }).message)
          : "";
      return message || `Google sign-in failed${code ? ` (${code})` : ""}`;
    }
  }
}

async function finishGoogleLogin(
  idToken: string,
  role: AuthRole,
  router: ReturnType<typeof useRouter>,
  refreshUser: () => Promise<void>
) {
  const res = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, role }),
  });
  const data = await res.json();

  if (!res.ok || !data.success) {
    toast.error(data.message || "Google sign-in failed");
    return false;
  }

  await refreshUser();
  toast.success(data.message || "Signed in with Google");
  redirectForRole(data.user?.role || role, router);
  return true;
}

export default function GoogleAuthButton({
  role,
  label = "Continue with Google",
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function handleRedirect() {
      try {
        const result = await getRedirectResult(getFirebaseAuth());
        if (!result || cancelled) return;

        setLoading(true);
        const savedRole =
          (sessionStorage.getItem(ROLE_KEY) as AuthRole | null) || role;
        sessionStorage.removeItem(ROLE_KEY);

        const idToken = await result.user.getIdToken(true);
        await finishGoogleLogin(idToken, savedRole, router, refreshUser);
      } catch (error) {
        console.error("Google redirect error:", error);
        const msg = firebaseErrorMessage(error);
        if (msg) toast.error(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void handleRedirect();
    return () => {
      cancelled = true;
    };
  }, [role, router, refreshUser]);

  async function handleGoogle() {
    setLoading(true);
    try {
      const auth = getFirebaseAuth();

      try {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken(true);
        await finishGoogleLogin(idToken, role, router, refreshUser);
      } catch (popupError) {
        const code =
          popupError && typeof popupError === "object" && "code" in popupError
            ? String((popupError as { code: string }).code)
            : "";

        if (code === "auth/popup-closed-by-user") {
          toast.info("Google sign-in cancelled");
          return;
        }

        if (
          code === "auth/popup-blocked" ||
          code.includes("internal-error") ||
          !code
        ) {
          sessionStorage.setItem(ROLE_KEY, role);
          await signInWithRedirect(auth, googleProvider);
          return;
        }

        throw popupError;
      }
    } catch (error) {
      console.error("Google auth client error:", error);
      const msg = firebaseErrorMessage(error);
      if (msg) toast.error(msg);
      else toast.info("Google sign-in cancelled");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogle}
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-[#cdd3e0] bg-white px-4 py-3 text-[15px] font-semibold text-[#b91c1c] transition hover:border-[#dc2626] hover:bg-[#fffafa] disabled:opacity-60"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        />
        <path
          fill="#FBBC05"
          d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.321 0 2.508.455 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        />
      </svg>
      {loading ? "Connecting…" : label}
    </button>
  );
}
