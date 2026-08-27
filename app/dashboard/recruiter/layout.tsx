import { requireAuth } from "@/lib/requireAuth";
import RecruiterSidebar from "@/app/components/RecruiterSidebar";
import ApplicationNotifications from "@/app/components/ApplicationNotifications";
import { DASH } from "@/app/lib/dashboardTheme";

export default async function RecruiterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth(["recruiter"]);

  return (
    <div
      className="min-h-screen text-[#0f172a] font-[family-name:var(--font-ui)]"
      style={{ background: DASH.bg }}
    >
      <div className="flex min-h-screen">
        <RecruiterSidebar />
        <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
      </div>
      <ApplicationNotifications />
    </div>
  );
}
