import { CalendarClock } from "lucide-react";
import SeekerPageHeader from "@/app/components/SeekerPageHeader";
import styles from "../seeker.module.css";

export default function SeekerInterviewsPage() {
  return (
    <main className={styles.subpage}>
      <SeekerPageHeader title="Interview Schedule" subtitle="See upcoming interviews and reminders in one place." section="GET READY FOR YOUR NEXT CONVERSATION" icon="interviews" />
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}><CalendarClock size={29} strokeWidth={1.6} /></div>
        <p className="text-lg font-bold text-[#e5edf9]">No interviews scheduled</p>
        <p className="mt-2 text-sm text-[#a1b0c7]">Upcoming interviews with employers will appear in this list.</p>
      </div>
    </main>
  );
}
