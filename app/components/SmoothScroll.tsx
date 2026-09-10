"use client";

import { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";
import type { LenisOptions } from "lenis";
import "lenis/dist/lenis.css";

const LENIS_OPTIONS: LenisOptions = {
  lerp: 0.08,
  duration: 1.2,
  smoothWheel: true,
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
};

/**
 * Site-wide buttery smooth scrolling (Jobright-style momentum).
 * Skips when the user prefers reduced motion.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      {children}
    </ReactLenis>
  );
}
