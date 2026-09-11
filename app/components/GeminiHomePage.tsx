"use client";

import HeroSection from "./HeroSection";
import MemberBenefitsSection from "./MemberBenefitsSection";
import TalentNetworkSection from "./TalentNetworkSection";
// import DiscoverTrendingJobs from "./DiscoverTrendingJobs";
import {
  // CareerJourneyStrip,
  // LearningPreviewStrip,
  HomeFaqStrip,
} from "./StellaHomeExtras";
import { useHomeMotion } from "../hooks/useHomeMotion";
import "../gemini-home.css";
import "../reveal.css";
import CareerAppSection from "./CareerAppSection";
import TrustedJobPlatforms from "./TrustedJobPlatforms";
import FeaturedJobsSection from "./FeaturedJobsSection";
import JobsPrefetch from "./JobsPrefetch";

/**
 * Homepage built to H01–H16 only (existing Gemini Jobs visual language).
 * Old marketing sections (four things, demand board, demo tickers) removed.
 */
export default function GeminiHomePage() {
  useHomeMotion();

  return (
    <div className="gemini-home">
      <JobsPrefetch />
      <main id="top">
        {/* H02–H03 */}
        <HeroSection />
        <TrustedJobPlatforms />

        {/* H04, H06–H10 — immediately below hero */}
        <MemberBenefitsSection />

        <FeaturedJobsSection />

        {/* Talent network feature band */}
        <TalentNetworkSection />

        <CareerAppSection />

        {/* Hidden for now — keep in codebase, re-enable later
        <CareerJourneyStrip />
        <LearningPreviewStrip />
        <DiscoverTrendingJobs />
        */}

        {/* H16 */}
        <HomeFaqStrip />
      </main>
    </div>
  );
}
