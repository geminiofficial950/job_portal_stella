import SeekerCoverLettersList from "@/app/components/SeekerCoverLettersList";
import SeekerPageHeader from "@/app/components/SeekerPageHeader";
import styles from "../seeker.module.css";

export default function Page() {
  return (
    <main className={styles.subpage}>
      <SeekerPageHeader
        title="Cover letters"
        subtitle="Letters you have already used when applying. Reuse them on the next application."
        section="YOUR APPLICATION NOTES"
        icon="letters"
      />
      <SeekerCoverLettersList />
    </main>
  );
}
