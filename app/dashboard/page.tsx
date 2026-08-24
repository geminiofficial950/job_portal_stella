import { redirect } from "next/navigation";
import { getAuthFromCookies } from "@/lib/auth";
import { dashboardPathForRole } from "@/lib/auth-edge";

export default async function DashboardIndexPage() {
  const auth = await getAuthFromCookies();
  if (!auth) {
    redirect("/login");
  }
  redirect(dashboardPathForRole(auth.role));
}
