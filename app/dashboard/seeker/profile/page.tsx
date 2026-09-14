import SeekerThemeToggle from "@/app/components/SeekerTheme";
import Link from "next/link";
import SeekerProfileForm from "@/app/components/SeekerProfileForm";
import styles from "../seeker.module.css";

export default function SeekerProfilePage() {
  return (
    <main className={`${styles.subpage} ${styles.profilePage}`}>
      <div className={styles.subpageBreadcrumb}>
        <Link href="/dashboard/seeker">Workspace</Link>
        <span>/</span>
        <strong>Profile</strong>
        <div className={styles.headerActions}><SeekerThemeToggle /></div>
      </div>
      <SeekerProfileForm />
    </main>
  );
}
