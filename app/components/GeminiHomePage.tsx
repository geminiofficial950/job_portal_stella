"use client";

import HeroSection from "./HeroSection";
import MemberBenefitsSection from "./MemberBenefitsSection";
import DiscoverTrendingJobs from "./DiscoverTrendingJobs";
import {
  CareerJourneyStrip,
  LearningPreviewStrip,
  HomeFaqStrip,
} from "./StellaHomeExtras";
import "../gemini-home.css";

/**
 * Homepage built to H01–H16 only (existing Stella visual language).
 * Old marketing sections (four things, demand board, demo tickers) removed.
 */
export default function GeminiHomePage() {
  return (
    <div className="gemini-home">
      <main id="top">
        {/* H02–H03 */}
        <HeroSection />

        {/* H04, H06–H10 — immediately below hero */}
        <MemberBenefitsSection />

        {/* H11 */}
        <CareerJourneyStrip />

        {/* H12 */}
        <LearningPreviewStrip />

        {/* H15 — trending discovery */}
        <DiscoverTrendingJobs />

        {/* H16 */}
        <HomeFaqStrip />
      </main>
    </div>
  );
}
