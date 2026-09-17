import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireAuth } from "@/lib/requireAuth";
import AdminSidebar from "@/app/components/AdminSidebar";
import SeekerThemeToggle, { SeekerThemeProvider } from "@/app/components/SeekerTheme";
import seekerStyles from "../seeker/seeker.module.css";
import styles from "../recruiter/recruiter.module.css";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireAuth(["admin"]);
  const preferences = await cookies();
  const theme = (preferences.get("admin-theme") ?? preferences.get("recruiter-theme") ?? preferences.get("seeker-theme"))?.value === "dark" ? "dark" : "light";

  return (
    <SeekerThemeProvider initialTheme={theme} cookieName="admin-theme">
      <div data-seeker-finish="matte" className={`${seekerStyles.workspace} ${seekerStyles.creamCanvas} min-h-screen font-[family-name:var(--font-ui)]`}>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className={`${seekerStyles.mainContent} min-w-0 flex-1 overflow-x-hidden`}>
            <header className={`${seekerStyles.topbar} ${styles.toolbar}`}>
              <div className={seekerStyles.breadcrumb}>Workspace <span>/</span> <strong>Admin</strong></div>
              <div className={seekerStyles.headerActions}>
                <SeekerThemeToggle />
                <Link href="/dashboard/admin" className={seekerStyles.account} aria-label="View the admin overview">
                  <span className={seekerStyles.avatar}>{auth.name.trim().charAt(0).toUpperCase()}</span>
                  <span>{auth.name}<small>Platform admin</small></span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </header>
            <div className={styles.content}>{children}</div>
          </div>
        </div>
      </div>
    </SeekerThemeProvider>
  );
}
