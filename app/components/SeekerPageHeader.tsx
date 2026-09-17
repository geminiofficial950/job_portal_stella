import SeekerThemeToggle from "@/app/components/SeekerTheme";
import Link from "next/link";
import { ArrowUpRight, Bookmark, Briefcase, CalendarCheck, FileText, Mail, Settings, Search, Bell } from "lucide-react";
import styles from "@/app/dashboard/seeker/seeker.module.css";

const icons = { suggested: Search, applications: FileText, saved: Bookmark, jobs: Briefcase, interviews: CalendarCheck, settings: Settings, preferences: Bell, letters: Mail };

export default function SeekerPageHeader({ title, subtitle, section, icon }: {
  title: string;
  subtitle: string;
  section: string;
  icon: keyof typeof icons;
}) {
  const Icon = icons[icon];
  return (
    <>
      <div className={styles.subpageBreadcrumb}>
        <Link href="/dashboard/seeker">Workspace</Link><span>/</span><strong>{title}</strong>
        <div className={styles.headerActions}><SeekerThemeToggle /></div>
      </div>
      <header className={styles.subpageHeader}>
        <div className={styles.subpageTitle}>
          <span className={styles.pageIcon}><Icon size={25} strokeWidth={1.7} /></span>
          <div><p className={styles.eyebrow}>{section}</p><h1>{title}</h1><p className={styles.pageSubtitle}>{subtitle}</p></div>
        </div>
        <Link href="/dashboard/seeker" className={styles.overviewLink}>Overview <ArrowUpRight size={15} /></Link>
      </header>
    </>
  );
}
