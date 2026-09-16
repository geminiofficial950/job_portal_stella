"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "recruiter" | "admin";
  phone?: string;
  photoUrl?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const requestVersion = useRef(0);
  const loggingOut = useRef(false);

  const endSession = useCallback(() => {
    requestVersion.current += 1;
    setUser(null);
    setExpiresAt(null);
    setLoading(false);
    const { pathname, search } = window.location;
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      const params = new URLSearchParams({
        role: pathname.startsWith("/dashboard/recruiter") ? "recruiter" : "user",
        next: pathname + search,
      });
      // A full navigation also discards protected content in the router cache.
      window.location.replace(`/login?${params}`);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (loggingOut.current) return;
    const version = ++requestVersion.current;
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (version !== requestVersion.current) return;
      if (res.status === 401) {
        endSession();
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      if (version !== requestVersion.current) return;
      if (data.success && data.user && Number.isFinite(data.expiresAt) && Number.isFinite(data.serverTime)) {
        const remaining = data.expiresAt - data.serverTime;
        if (remaining <= 0) {
          endSession();
          return;
        }
        setExpiresAt(Date.now() + remaining);
        setUser({
          id: String(data.user.id),
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          phone: data.user.phone,
          photoUrl: data.user.photoUrl || "",
        });
      } else {
        endSession();
      }
    } catch {
      // A temporary network failure must not log out a valid session.
      // The local expiry timer still clears it at its known deadline.
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [endSession]);

  const logout = useCallback(async () => {
    loggingOut.current = true;
    requestVersion.current += 1;
    setUser(null);
    setExpiresAt(null);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      loggingOut.current = false;
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initialCheck = window.setTimeout(() => void refreshUser(), 0);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshUser();
    };
    const onFocus = () => void refreshUser();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onFocus);
    return () => {
      window.clearTimeout(initialCheck);
      requestVersion.current += 1;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onFocus);
    };
  }, [refreshUser]);

  useEffect(() => {
    if (expiresAt === null) return;
    const timeout = window.setTimeout(endSession, Math.max(0, expiresAt - Date.now()));
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refreshUser();
    }, 30_000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [expiresAt, endSession, refreshUser]);

  const value = useMemo(
    () => ({ user, loading, refreshUser, logout }),
    [user, loading, refreshUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
