import Link from "next/link";
import { BENEFIT_CARDS, STELLA_CONTACT } from "@/lib/stellaContent";

const NAV_LINKS = [
  { label: "Find Jobs", href: "/jobs" },
  { label: "Benefits", href: "/#benefits" },
  { label: "For Employers", href: "/employers" },
  ...BENEFIT_CARDS.slice(1).map((c) => ({ label: c.title, href: c.href })),
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
] as const;

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-slate-500">
      <div className="mx-auto max-w-[1180px] px-6 py-11 pb-14 sm:px-8">
        <div className="flex flex-wrap items-center gap-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-[19px] font-semibold tracking-tight text-slate-900 no-underline"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logonew.jpeg"
              alt="Stella Careers"
              className="h-7 w-auto object-contain"
            />
          </Link>
          <nav className="ms-auto flex flex-wrap gap-5 text-[13.5px]">
            {NAV_LINKS.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="text-slate-500 no-underline transition-colors hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-7 max-w-[82ch] text-[12.5px] leading-relaxed text-slate-500">
          Stella Careers helps candidates build free profiles, grow skills, and
          present checked credentials to employers. Contact{" "}
          <a
            href={`mailto:${STELLA_CONTACT.email}`}
            className="text-[#005682] hover:underline"
          >
            {STELLA_CONTACT.email}
          </a>
          . {STELLA_CONTACT.pendingOwnerContent
            ? "Operating-company details pending owner content before launch."
            : null}
        </p>
      </div>
    </footer>
  );
}
