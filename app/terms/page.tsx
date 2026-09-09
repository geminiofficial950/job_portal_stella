import Link from "next/link";
import { STELLA_CONTACT } from "@/lib/stellaContent";

export const metadata = { title: "Terms — Stella Careers" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <h1 className="text-3xl font-bold text-[#0f2744]">Terms of use</h1>
      <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
        <strong>Pending owner content:</strong> replace with lawyer-approved
        Stella Careers terms. Contact{" "}
        <a href={`mailto:${STELLA_CONTACT.email}`} className="text-[#2563eb]">
          {STELLA_CONTACT.email}
        </a>
        .
      </p>
      <p className="mt-4 text-sm">
        <Link href="/privacy" className="text-[#2563eb]">
          Privacy
        </Link>{" "}
        · <Link href="/">Home</Link>
      </p>
    </main>
  );
}
