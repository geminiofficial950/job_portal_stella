import { requireAuth } from "@/lib/requireAuth";
import SeekerSidebar from "@/app/components/SeekerSidebar";
import MatchedJobsNotification from "@/app/components/MatchedJobsNotification";
import ApplicationNotifications from "@/app/components/ApplicationNotifications";

export default async function SeekerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth(["user"]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-[family-name:var(--font-ui)]">
      <div className="flex min-h-[calc(100vh-68px)]">
        <SeekerSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <MatchedJobsNotification />
      <ApplicationNotifications />
    </div>
  );
}
