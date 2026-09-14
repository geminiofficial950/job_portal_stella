import SeekerSuggestedJobsList from "@/app/components/SeekerSuggestedJobsList";
import SeekerPageHeader from "@/app/components/SeekerPageHeader";
import styles from "../seeker.module.css";

export default function Page() {
  return (
    <main className={styles.subpage}>
      <SeekerPageHeader title="Suggested Jobs" subtitle="Roles matched to your profile skills — open any card to review or apply." section="OPPORTUNITIES THAT FIT YOU" icon="suggested" />
      <SeekerSuggestedJobsList />
    </main>
  );
}
