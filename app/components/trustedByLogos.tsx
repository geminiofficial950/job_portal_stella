import React from "react";

type LogoProps = { className?: string };

export function UnitingLogo({ className = "" }: LogoProps) {
  return (
    <svg viewBox="0 0 120 36" className={className} aria-hidden="true">
      <text
        x="0"
        y="26"
        fill="#c0267a"
        fontFamily="Georgia, serif"
        fontSize="22"
        fontWeight="700"
      >
        Uniting
      </text>
    </svg>
  );
}

export function MercyHealthLogo({ className = "" }: LogoProps) {
  return (
    <svg viewBox="0 0 160 40" className={className} aria-hidden="true">
      <rect x="0" y="8" width="24" height="24" rx="4" fill="#0ea5e9" />
      <path d="M12 14v12M6 20h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <text x="32" y="18" fill="#1e3a5f" fontSize="11" fontWeight="700">
        Mercy
      </text>
      <text x="32" y="30" fill="#64748b" fontSize="10" fontWeight="600">
        Health
      </text>
    </svg>
  );
}

export function AbilityFirstLogo({ className = "" }: LogoProps) {
  return (
    <svg viewBox="0 0 150 40" className={className} aria-hidden="true">
      <circle cx="14" cy="20" r="12" fill="#2563eb" opacity="0.15" />
      <path
        d="M14 10l2.5 5h5.5l-4.5 3.5 1.5 5.5L14 21l-5 3 1.5-5.5L6 15h5.5z"
        fill="#2563eb"
      />
      <text x="34" y="18" fill="#1e3a5f" fontSize="11" fontWeight="700">
        Ability
      </text>
      <text x="34" y="30" fill="#64748b" fontSize="10" fontWeight="600">
        First
      </text>
    </svg>
  );
}

export function BaptistcareLogo({ className = "" }: LogoProps) {
  return (
    <svg viewBox="0 0 150 40" className={className} aria-hidden="true">
      <path
        d="M8 28c0-8 6-14 12-14s8 4 8 10c0 6-4 10-10 10H8z"
        fill="#16a34a"
      />
      <path d="M20 14c4 0 8 3 8 8" stroke="#86efac" strokeWidth="2" fill="none" />
      <text x="36" y="25" fill="#1e3a5f" fontSize="13" fontWeight="700">
        Baptistcare
      </text>
    </svg>
  );
}

export function StVincentsLogo({ className = "" }: LogoProps) {
  return (
    <svg viewBox="0 0 150 40" className={className} aria-hidden="true">
      <path d="M12 8h8l-4 24-4-24z" fill="#2563eb" />
      <circle cx="12" cy="12" r="3" fill="#fff" />
      <text x="28" y="18" fill="#1e3a5f" fontSize="10" fontWeight="700">
        St Vincent&apos;s
      </text>
      <text x="28" y="30" fill="#64748b" fontSize="9" fontWeight="600">
        Health
      </text>
    </svg>
  );
}

export function SouthernCrossLogo({ className = "" }: LogoProps) {
  return (
    <svg viewBox="0 0 170 40" className={className} aria-hidden="true">
      <circle cx="14" cy="20" r="11" fill="#dbeafe" />
      <path
        d="M14 12l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z"
        fill="#2563eb"
      />
      <text x="32" y="18" fill="#1e3a5f" fontSize="10" fontWeight="700">
        Southern
      </text>
      <text x="32" y="30" fill="#64748b" fontSize="10" fontWeight="600">
        Cross
      </text>
    </svg>
  );
}

export function PfizerLogo({ className = "" }: LogoProps) {
  return (
    <svg viewBox="0 0 120 40" className={className} aria-hidden="true">
      <ellipse cx="18" cy="20" rx="16" ry="14" fill="none" stroke="#2563eb" strokeWidth="3" />
      <path d="M18 8v24M10 20h16" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
      <text x="42" y="25" fill="#2563eb" fontSize="16" fontWeight="700" fontStyle="italic">
        Pfizer
      </text>
    </svg>
  );
}

export function SiemensLogo({ className = "" }: LogoProps) {
  return (
    <svg viewBox="0 0 120 36" className={className} aria-hidden="true">
      <text
        x="0"
        y="26"
        fill="#009999"
        fontFamily="Arial, sans-serif"
        fontSize="20"
        fontWeight="700"
        letterSpacing="2"
      >
        SIEMENS
      </text>
    </svg>
  );
}

export function AnzLogo({ className = "" }: LogoProps) {
  return (
    <svg viewBox="0 0 100 40" className={className} aria-hidden="true">
      <text x="0" y="28" fill="#007dba" fontSize="26" fontWeight="800">
        ANZ
      </text>
      <path
        d="M72 18c6 0 10 4 10 9s-4 9-10 9"
        stroke="#007dba"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const TRUSTED_LOGOS_ROW1 = [
  { name: "Uniting", Logo: UnitingLogo },
  { name: "Mercy Health", Logo: MercyHealthLogo },
  { name: "Ability First", Logo: AbilityFirstLogo },
  { name: "Baptistcare", Logo: BaptistcareLogo },
  { name: "St Vincent's", Logo: StVincentsLogo },
] as const;

export const TRUSTED_LOGOS_ROW2 = [
  { name: "Southern Cross", Logo: SouthernCrossLogo },
  { name: "Pfizer", Logo: PfizerLogo },
  { name: "Siemens", Logo: SiemensLogo },
  { name: "ANZ", Logo: AnzLogo },
] as const;

export const TRUSTED_LOGOS_ALL = [...TRUSTED_LOGOS_ROW1, ...TRUSTED_LOGOS_ROW2];
