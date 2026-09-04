"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import "./auth.css";

type AuthRole = "user" | "recruiter";

export function AuthShell({
  role,
  titlePrefix,
  titleAccent,
  subtitle,
  children,
  footer,
}: {
  role: AuthRole;
  titlePrefix: string;
  titleAccent: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const isRecruiter = role === "recruiter";

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <Link href="/" className="auth-home-btn">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Home
        </Link>

        <div className="auth-card">
          <aside className="auth-visual" aria-hidden="true">
            <div className="auth-visual-blob" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/auth/hero.png" alt="" />
          </aside>

          <div className="auth-panel">
            <div className="auth-mobile-hero" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/auth/hero.png" alt="" />
            </div>

            <h1 className="auth-brand">
              {titlePrefix} <span>{titleAccent}</span>
            </h1>
            <p className="auth-sub">{subtitle}</p>

            <div
              className="auth-role-switch"
              role="tablist"
              aria-label="Account type"
            >
              <Link
                href={`?role=user`}
                className={!isRecruiter ? "is-active" : ""}
                scroll={false}
              >
                Job seeker
              </Link>
              <Link
                href={`?role=recruiter`}
                className={isRecruiter ? "is-active" : ""}
                scroll={false}
              >
                Recruiter
              </Link>
            </div>

            {children}

            <div className="auth-footer">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
