"use client";

import { useEffect, useMemo, useState } from "react";
import { ReactLenis } from "lenis/react";
import type { LenisOptions } from "lenis";
import "lenis/dist/lenis.css";

/**
 * Site-wide smooth scrolling. Always keeps the same React tree so hero
 * entrance animations are not remounted / replayed on load.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const options = useMemo<LenisOptions>(
    () => ({
      lerp: reduceMotion ? 1 : 0.08,
      duration: reduceMotion ? 0 : 1.2,
      smoothWheel: !reduceMotion,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
      autoRaf: true,
      prevent: (node) =>
        node.hasAttribute("data-lenis-prevent") ||
        node.classList.contains("jobs-sidebar") ||
        node.classList.contains("job-detail-panel__scroll") ||
        node.classList.contains("jobs-filter-options--scroll") ||
        node.classList.contains("recruiters-list-scroll") ||
        node.classList.contains("recruiters-detail-scroll"),
    }),
    [reduceMotion],
  );

  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  );
}
