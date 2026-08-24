import { FileText, Inbox } from "lucide-react";

export default function SeekerApplicationsPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#059669] via-[#047857] to-[#34d399] p-6 sm:p-8 mb-8">
        <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <FileText className="h-3 w-3" />
            Applications
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            Your Applications
          </h1>
          <p className="mt-2 text-white/70 text-sm">
            Track every role you apply to — status updates will show here.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-[#a7f3d0] bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#059669] to-[#34d399] shadow-lg">
          <Inbox className="h-8 w-8 text-white" />
        </div>
        <p className="text-lg font-bold text-[#065f46]">Nothing here yet</p>
        <p className="mt-2 text-sm text-[#6b7a9e]">
          This section will fill up as you apply to roles on Stella Jobs.
        </p>
      </div>
    </main>
  );
}
