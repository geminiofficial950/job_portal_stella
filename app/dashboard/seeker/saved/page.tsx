import SeekerSavedJobsList from "@/app/components/SeekerSavedJobsList";
import SeekerPageHeader from "@/app/components/SeekerPageHeader";
import styles from "../seeker.module.css";

export default function Page() {
  return (
    <main className={styles.subpage}>
      <SeekerPageHeader title="Saved Jobs" subtitle="Roles you bookmarked — open any card to review details or apply." section="KEEP YOUR POSSIBILITIES CLOSE" icon="saved" />
      <SeekerSavedJobsList />
    </main>
  );
}
