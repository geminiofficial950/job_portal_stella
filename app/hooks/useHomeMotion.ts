"use client";

import { useEffect } from "react";

/**
 * Jobright-style scroll reveals for the homepage.
 * Marks [data-home-animate] / [data-home-stagger] visible once in viewport.
 * Re-scans when new nodes mount (e.g. tab swaps).
 */
export function useHomeMotion() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = new WeakSet<Element>();

    const revealNow = (el: HTMLElement) => {
      el.classList.add("is-inview");
      seen.add(el);
    };

    const maybeObserve = (el: HTMLElement, observer: IntersectionObserver) => {
      if (seen.has(el) || el.classList.contains("is-inview")) {
        seen.add(el);
        return;
      }
      if (reduce) {
        revealNow(el);
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        revealNow(el);
        return;
      }
      observer.observe(el);
    };

    const scan = (observer: IntersectionObserver) => {
      document
        .querySelectorAll<HTMLElement>("[data-home-animate], [data-home-stagger]")
        .forEach((el) => maybeObserve(el, observer));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          revealNow(el);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    scan(observer);

    const mo = new MutationObserver(() => scan(observer));
    mo.observe(document.body, { childList: true, subtree: true });

    // Safety: never leave content permanently hidden if observer misses
    const safety = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>(
          "[data-home-animate]:not(.is-inview), [data-home-stagger]:not(.is-inview)",
        )
        .forEach((el) => revealNow(el));
    }, 2500);

    return () => {
      observer.disconnect();
      mo.disconnect();
      window.clearTimeout(safety);
    };
  }, []);
}
