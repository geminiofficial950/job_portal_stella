import { CalendarCheck, CalendarClock } from "lucide-react";

export default function RecruiterInterviewsPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#e2e8f0] border-l-4 border-l-[#dc2626] bg-white shadow-sm p-6 sm:p-8 mb-8">
        <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-28 w-28 rounded-full bg-[#fed7aa]/40 blur-2xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#64748b]">
            <CalendarCheck className="h-3 w-3" />
            Interviews
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0f172a]">
            Interview Schedule
          </h1>
          <p className="mt-2 max-w-xl text-[#64748b] text-sm">
            Upcoming phone screens and in-person interviews.
          </p>
        </div>
      </div>

      {/* Empty state */}
      <div className="rounded-2xl border-2 border-dashed border-[#fed7aa] bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f97316] to-[#fb923c] shadow-lg">
          <CalendarClock className="h-8 w-8 text-white" />
        </div>
        <p className="text-lg font-bold text-[#7c2d12]">No interviews booked</p>
        <p className="mt-2 text-sm text-[#6b7a9e]">
          Scheduled interviews will appear in this list.
        </p>
      </div>
    </main>
  );
}
