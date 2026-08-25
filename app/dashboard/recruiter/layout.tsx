import { requireAuth } from "@/lib/requireAuth";
import Navbar from "@/app/components/Navbar";
import RecruiterSidebar from "@/app/components/RecruiterSidebar";

export default async function RecruiterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth(["recruiter"]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-[family-name:var(--font-ui)]">
      <Navbar />
      <div className="flex min-h-[calc(100vh-68px)]">
        <RecruiterSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
