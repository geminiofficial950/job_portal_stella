"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthRole = "user" | "recruiter";
export type AuthMode = "login" | "register";

export type OpenAuthOptions = {
  mode?: AuthMode;
  role?: AuthRole;
};

type AuthModalContextValue = {
  open: boolean;
  mode: AuthMode;
  role: AuthRole;
  openAuth: (options?: OpenAuthOptions) => void;
  closeAuth: () => void;
  setMode: (mode: AuthMode) => void;
  setRole: (role: AuthRole) => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<AuthRole>("user");

  const openAuth = useCallback((options?: OpenAuthOptions) => {
    if (options?.mode) setMode(options.mode);
    if (options?.role) setRole(options.role);
    setOpen(true);
  }, []);

  const closeAuth = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({
      open,
      mode,
      role,
      openAuth,
      closeAuth,
      setMode,
      setRole,
    }),
    [open, mode, role, openAuth, closeAuth],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return ctx;
}
