import Link from "next/link";

function LogoMark() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2l2.4 7.1L21.6 9l-5.9 4.4 2.3 7.2-6-4.4-6 4.4 2.3-7.2L2.4 9l7.2.1z"
        fill="currentColor"
      />
    </svg>
  );
}

const NAV_LINKS = [
  { label: "Platform", href: "/#difference" },
  { label: "Demand", href: "/#demand" },
  { label: "Newcomers", href: "/#newcomers" },
  { label: "Privacy", href: "#" },
  { label: "Contact", href: "#" },
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
            <LogoMark />
            Gemini{" "}
            <span className="font-normal text-slate-500">
              Education and Careers
            </span>
          </Link>
          <nav className="ms-auto flex flex-wrap gap-5 text-[13.5px]">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-slate-500 no-underline transition-colors hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-7 max-w-[82ch] text-[12.5px] leading-relaxed text-slate-500">
          Gemini Education and Careers verifies credentials and work rights supplied by
          candidates. Assessments measure job-relevant capability against a
          published rubric and are never used to rank candidates on attributes
          protected under Australian anti-discrimination law. Interpreter
          services are provided at no cost to candidates.
        </p>
      </div>
    </footer>
  );
}
