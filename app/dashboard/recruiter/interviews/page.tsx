import { CalendarClock } from "lucide-react";

export default function RecruiterInterviewsPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
          Interview Schedule
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Upcoming phone screens and in-person interviews.
        </p>
      </div>

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
