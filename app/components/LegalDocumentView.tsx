import Link from "next/link";
import LegalContents from "@/app/components/LegalContents";
import { LEGAL_META, type LegalDocument } from "@/lib/legalContent";

const OTHER = {
  terms: { href: "/privacy", label: "Privacy Policy" },
  privacy: { href: "/terms", label: "Terms of Service" },
} as const;

function renderInline(text: string) {
  const email = LEGAL_META.email;
  if (!text.includes(email) && !text.includes("oaic.gov.au")) return text;

  const pattern = new RegExp(
    `(${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}|oaic\\.gov\\.au)`,
    "g"
  );
  const parts = text.split(pattern);
  return parts.map((part, index) => {
    if (part === email) {
      return (
        <a key={index} href={`mailto:${email}`} className="font-medium text-[#b91c1c] underline decoration-[#b91c1c]/30 underline-offset-2 hover:decoration-[#b91c1c]">
          {email}
        </a>
      );
    }
    if (part === "oaic.gov.au") {
      return (
        <a
          key={index}
          href="https://www.oaic.gov.au/"
          className="font-medium text-[#b91c1c] underline decoration-[#b91c1c]/30 underline-offset-2 hover:decoration-[#b91c1c]"
          target="_blank"
          rel="noopener noreferrer"
        >
          oaic.gov.au
        </a>
      );
    }
    return part;
  });
}

export default function LegalDocumentView({ doc }: { doc: LegalDocument }) {
  const other = OTHER[doc.kind];

  return (
    <main className="flex-1 bg-white text-[#1c1917]">
      <article className="mx-auto w-full max-w-[1080px] px-5 py-14 sm:px-8 sm:py-16">
        <header className="border-b border-[#eee] pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b91c1c]">
            {LEGAL_META.brand}
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold leading-tight tracking-tight text-[#111] sm:text-[2.35rem]">
            {doc.title}
          </h1>
          <p className="mt-4 text-[18px] leading-8 text-[#444]">
            {doc.summary}
          </p>
        </header>

        <LegalContents sections={doc.sections} />

        <div className="mt-4">
          {doc.sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24 border-b border-[#f0f0f0] py-8 last:border-b-0"
            >
              <h2 className="text-[1.45rem] font-semibold tracking-tight text-[#111]">
                <span className="mr-2 tabular-nums text-[#b91c1c]">{index + 1}.</span>
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-[18px] leading-8 text-[#3f3f3f]">
                {section.blocks.map((block, blockIndex) =>
                  block.type === "list" ? (
                    <ul key={blockIndex} className="list-disc space-y-2 pl-5 marker:text-[#ccc]">
                      {block.items.map((item) => (
                        <li key={item}>{renderInline(item)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={blockIndex}>{renderInline(block.text)}</p>
                  )
                )}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#eee] pt-6 text-sm text-[#666]">
          <Link href={other.href} className="font-medium text-[#b91c1c] hover:underline">
            {other.label}
          </Link>
          <span className="text-[#ddd]" aria-hidden="true">
            /
          </span>
          <Link href="/" className="hover:text-[#111]">
            Home
          </Link>
          <span className="text-[#ddd]" aria-hidden="true">
            /
          </span>
          <a href={`mailto:${LEGAL_META.email}`} className="hover:text-[#111]">
            {LEGAL_META.email}
          </a>
        </footer>
      </article>
    </main>
  );
}
