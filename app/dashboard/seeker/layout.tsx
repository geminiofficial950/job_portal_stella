import { requireAuth } from "@/lib/requireAuth";
import SeekerSidebar from "@/app/components/SeekerSidebar";
import MatchedJobsNotification from "@/app/components/MatchedJobsNotification";
import ApplicationNotifications from "@/app/components/ApplicationNotifications";
import { DASH } from "@/app/lib/dashboardTheme";

export default async function SeekerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth(["user"]);

  return (
    <div
      className="min-h-screen text-[#0f172a] font-[family-name:var(--font-ui)]"
      style={{ background: DASH.bg }}
    >
      <div className="flex min-h-screen">
        <SeekerSidebar />
        <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
      </div>
      <MatchedJobsNotification />
      <ApplicationNotifications />
    </div>
  );
}
