import SeekerJobsList from "@/app/components/SeekerJobsList";
import SeekerPageHeader from "@/app/components/SeekerPageHeader";
import styles from "../seeker.module.css";

export default function Page() {
  return (
    <main className={styles.subpage}>
      <SeekerPageHeader title="Open Roles" subtitle="Live openings from approved employers on Gemini Jobs." section="FIND YOUR NEXT CHAPTER" icon="jobs" />
      <SeekerJobsList />
    </main>
  );
}
