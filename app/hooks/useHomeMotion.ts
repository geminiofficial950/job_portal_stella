"use client";

import { useEffect } from "react";

/**
 * Scroll-triggered reveals only — fires when the user scrolls an element into view.
 * Does not auto-play below-the-fold sections on first paint.
 */
export function useHomeMotion() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const selector = "[data-home-animate], [data-home-stagger]";
    const seen = new WeakSet<Element>();

    const revealNow = (el: HTMLElement) => {
      if (seen.has(el)) return;
      el.classList.add("is-inview");
      seen.add(el);
    };

    if (reduce) {
      document
        .querySelectorAll<HTMLElement>(selector)
        .forEach((el) => revealNow(el));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          // Require a real scroll-into-view amount (not just a 1px peek)
          if (entry.intersectionRatio < 0.18) continue;
          const el = entry.target as HTMLElement;
          revealNow(el);
          observer.unobserve(el);
        }
      },
      {
        threshold: [0.18, 0.28, 0.4],
        // Trigger a bit after the element enters — feels scroll-driven
        rootMargin: "0px 0px -14% 0px",
      },
    );

    const observeAll = () => {
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        if (seen.has(el) || el.classList.contains("is-inview")) {
          seen.add(el);
          return;
        }
        observer.observe(el);
      });
    };

    observeAll();

    let moTimer = 0;
    const mo = new MutationObserver(() => {
      window.clearTimeout(moTimer);
      moTimer = window.setTimeout(observeAll, 80);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
      window.clearTimeout(moTimer);
    };
  }, []);
}
