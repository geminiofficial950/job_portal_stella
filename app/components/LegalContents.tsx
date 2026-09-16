"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Section = { id: string; title: string };

export default function LegalContents({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState(false);

  return (
    <nav aria-label="On this page" className="mt-8 rounded-xl bg-[#fafafa]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#666]">
          Contents
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#888] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ol className="columns-1 gap-x-8 px-5 pb-4 sm:columns-2">
          {sections.map((section, index) => (
            <li key={section.id} className="mb-1.5 break-inside-avoid">
              <a
                href={`#${section.id}`}
                onClick={() => setOpen(false)}
                className="text-[15.5px] leading-7 text-[#333] hover:text-[#b91c1c]"
              >
                <span className="mr-2 tabular-nums text-[#aaa]">{index + 1}.</span>
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
