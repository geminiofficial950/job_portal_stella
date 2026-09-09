import { requireAuth } from "@/lib/requireAuth";
import { getRecruiterCompanyAccess } from "@/lib/recruiterCompanyAccess";
import RecruiterSidebar from "@/app/components/RecruiterSidebar";
import RecruiterAccessShell from "@/app/components/RecruiterAccessShell";
import ApplicationNotifications from "@/app/components/ApplicationNotifications";
import { DASH } from "@/app/lib/dashboardTheme";

export default async function RecruiterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireAuth(["recruiter"]);
  const access = await getRecruiterCompanyAccess(auth.sub);

  return (
    <div
      className="min-h-screen text-[#0f172a] font-[family-name:var(--font-ui)]"
      style={{ background: DASH.bg }}
    >
      <div className="flex min-h-screen">
        <RecruiterSidebar access={access} />
        <div className="min-w-0 flex-1 overflow-x-hidden">
          <RecruiterAccessShell access={access}>{children}</RecruiterAccessShell>
        </div>
      </div>
      {access.approved ? <ApplicationNotifications /> : null}
    </div>
  );
}
