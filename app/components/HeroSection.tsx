"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

const animatedWords = ["remote jobs", "tech roles", "design gigs", "marketing", "freelance work"];

const bgIcons = [
  { d: "M20 6h-1V4c0-1.1-.9-2-2-2H7C5.9 2 5 2.9 5 4v2H4C2.9 6 2 6.9 2 8v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 11l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z", top: "9%", left: "5%", rotate: -10, size: 36 },
  { d: "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z", top: "10%", left: "20%", rotate: 8, size: 28 },
  { d: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z", top: "7%", left: "75%", rotate: -5, size: 32 },
  { d: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z", top: "12%", left: "88%", rotate: 12, size: 28 },
  { d: "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z", top: "60%", left: "3%", rotate: 6, size: 30 },
  { d: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z", top: "72%", left: "14%", rotate: -8, size: 28 },
  { d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z", top: "65%", left: "84%", rotate: 5, size: 30 },
  { d: "M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.34 8-7 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-4h-2c0-3.25 3-3 3-5 0-1.1-.9-2-2-2s-2 .9-2 2h-2c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.5-3 2.75-3 5z", top: "42%", left: "93%", rotate: -11, size: 26 },
];

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useReveal() as React.RefObject<HTMLDivElement>;

  const [textIndex, setTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const targetWord = animatedWords[textIndex];
    let speed = isDeleting ? 45 : 100;
    if (!isDeleting && currentText === targetWord) speed = 2000;
    else if (isDeleting && currentText === "") speed = 350;

    const timer = setTimeout(() => {
      if (!isDeleting && currentText !== targetWord) {
        setCurrentText(targetWord.substring(0, currentText.length + 1));
      } else if (!isDeleting && currentText === targetWord) {
        setIsDeleting(true);
      } else if (isDeleting && currentText !== "") {
        setCurrentText(targetWord.substring(0, currentText.length - 1));
      } else {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % animatedWords.length);
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, textIndex]);

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#fffafa" }}
    >
      {bgIcons.map((icon, i) => (
        <div key={i} className="absolute pointer-events-none select-none"
          style={{ top: icon.top, left: icon.left, transform: `rotate(${icon.rotate}deg)`, opacity: 0.08 }}>
          <svg width={icon.size} height={icon.size} viewBox="0 0 24 24" fill="#334155">
            <path d={icon.d} />
          </svg>
        </div>
      ))}

      <div
        ref={contentRef}
        className="reveal relative max-w-5xl mx-auto px-4 sm:px-6 pt-14 pb-16 sm:pt-16 sm:pb-20 text-center z-10"
      >
        <h1 className="font-extrabold tracking-tight mb-5 font-manrope leading-tight"
          style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", color: "#111827" }}>
          The largest job board for{" "}
          <br className="hidden sm:block" />
          <span style={{ color: "#b91c1c" }}>
            {currentText}
            <span className="inline-block w-[3px] h-[1em] ml-1 align-middle rounded-sm animate-pulse"
              style={{ background: "#b91c1c", verticalAlign: "middle" }} />
          </span>
        </h1>

        <p className="text-slate-500 mb-10 max-w-lg mx-auto font-inter leading-relaxed"
          style={{ fontSize: "clamp(0.9rem, 2vw, 1.05rem)" }}>
          Discover simplicity and efficiency — the #1 choice for jobs for over a decade!
        </p>

        <div className="flex items-center bg-white rounded-2xl max-w-2xl mx-auto px-4 py-3 sm:py-3.5 gap-3"
          style={{ border: "1px solid #e2e8f0", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search remote jobs"
            className="flex-1 bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none font-inter text-sm sm:text-base" />
          {query.length > 0 && (
            <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors shrink-0">Clear</button>
          )}
          <div className="h-6 w-px bg-slate-200 shrink-0" />
          <Link href={`/jobs${query ? `?q=${encodeURIComponent(query)}` : ""}`}
            className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 shrink-0 hover:opacity-90 active:scale-95"
            style={{ background: "#b91c1c", boxShadow: "0 4px 14px rgba(185,28,28,0.25)" }}>
            Search
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {["Remote", "Full-time", "Part-time", "Contract", "Freelance"].map((tag) => (
            <button key={tag} type="button" onClick={() => setQuery(tag)}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:border-red-300 hover:text-red-600 transition-all duration-200"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
