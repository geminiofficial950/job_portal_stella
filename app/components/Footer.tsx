import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { BENEFIT_CARDS, STELLA_CONTACT } from "@/lib/stellaContent";

const EXPLORE = [
  { label: "Find Jobs", href: "/jobs" },
  { label: "Benefits", href: "/#benefits" },
  { label: "For Employers", href: "/employers" },
  { label: "Verification", href: "/verification" },
] as const;

const SUPPORT = BENEFIT_CARDS.map((c) => ({
  label: c.title,
  href: c.href,
}));

const LEGAL = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer relative mt-auto overflow-hidden border-t border-[#4f6cf5]/15 bg-white text-[#0f172a]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 0% 0%, rgba(200,240,102,0.28), transparent 55%), radial-gradient(ellipse 45% 50% at 100% 100%, rgba(79,108,245,0.12), transparent 50%), linear-gradient(180deg, #ffffff 0%, #fafcfa 55%, #f4f6ff 100%)",
        }}
      />

      <div className="relative mx-auto max-w-[1200px] px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:gap-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logonew.jpeg"
                alt="Stella Careers"
                className="h-8 w-auto rounded-md object-contain"
              />
            </Link>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-slate-600">
              Build your free profile, grow skills, and present checked
              credentials to employers across Australia.
            </p>
            <div className="mt-5 space-y-2.5 text-[13px] text-slate-600">
              <a
                href={`mailto:${STELLA_CONTACT.email}`}
                className="inline-flex items-center gap-2 font-medium text-[#4f6cf5] transition hover:text-[#3f5ce8]"
              >
                <Mail className="h-4 w-4" strokeWidth={2} />
                {STELLA_CONTACT.email}
              </a>
              <p className="flex items-start gap-2">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#6b8f12]"
                  strokeWidth={2}
                />
                <span>{STELLA_CONTACT.address}</span>
              </p>
            </div>
            <Link
              href="/profile/setup"
              className="mt-6 inline-flex rounded-lg bg-[#4f6cf5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3f5ce8]"
            >
              Build my free profile
            </Link>
          </div>

          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#4f6cf5]">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {EXPLORE.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-slate-600 transition hover:text-[#4f6cf5]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#4f6cf5]">
              Career support
            </h3>
            <ul className="mt-4 space-y-2.5">
              {SUPPORT.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] leading-snug text-slate-600 transition hover:text-[#4f6cf5]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#4f6cf5]">
              Legal
            </h3>
            <ul className="mt-4 space-y-2.5">
              {LEGAL.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-slate-600 transition hover:text-[#4f6cf5]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[#4f6cf5]/15 pt-6">
          <p className="text-[12.5px] text-slate-500">
            © {year} Stella Careers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
