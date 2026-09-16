import type { Metadata } from "next";
import LegalDocumentView from "@/app/components/LegalDocumentView";
import { TERMS_OF_SERVICE } from "@/lib/legalContent";

export const metadata: Metadata = {
  title: "Terms of Service — Gemini Jobs",
  description:
    "Terms of Service for Gemini Jobs (geminijobs.com.au), a job aggregator and career platform.",
};

export default function TermsPage() {
  return <LegalDocumentView doc={TERMS_OF_SERVICE} />;
}
