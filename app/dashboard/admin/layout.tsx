import { requireAuth } from "@/lib/requireAuth";
import AdminSidebar from "@/app/components/AdminSidebar";
import { DASH } from "@/app/lib/dashboardTheme";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth(["admin"]);

  return (
    <div
      className="min-h-screen text-[#0f172a] font-[family-name:var(--font-ui)]"
      style={{ background: DASH.bg }}
    >
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
