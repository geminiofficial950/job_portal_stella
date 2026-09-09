import Link from "next/link";
import { STELLA_CONTACT } from "@/lib/stellaContent";

export const metadata = { title: "Privacy — Stella Careers" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <h1 className="text-3xl font-bold text-[#0f2744]">Privacy</h1>
      <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
        <strong>Pending owner content:</strong> publish approved privacy wording.
        Contact{" "}
        <a href={`mailto:${STELLA_CONTACT.email}`} className="text-[#2563eb]">
          {STELLA_CONTACT.email}
        </a>
        .
      </p>
      <p className="mt-4 text-sm">
        <Link href="/terms" className="text-[#2563eb]">
          Terms
        </Link>{" "}
        · <Link href="/">Home</Link>
      </p>
    </main>
  );
}
