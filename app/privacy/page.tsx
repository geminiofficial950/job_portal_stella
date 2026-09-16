import type { Metadata } from "next";
import LegalDocumentView from "@/app/components/LegalDocumentView";
import { PRIVACY_POLICY } from "@/lib/legalContent";

export const metadata: Metadata = {
  title: "Privacy Policy — Gemini Jobs",
  description:
    "Privacy and cookie policy for Gemini Jobs (geminijobs.com.au), explaining how we handle personal information as a job aggregator.",
};

export default function PrivacyPage() {
  return <LegalDocumentView doc={PRIVACY_POLICY} />;
}
