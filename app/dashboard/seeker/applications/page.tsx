import SeekerApplicationsList from "@/app/components/SeekerApplicationsList";
import SeekerPageHeader from "@/app/components/SeekerPageHeader";
import styles from "../seeker.module.css";

export default function Page() {
  return (
    <main className={styles.subpage}>
      <SeekerPageHeader title="Your Applications" subtitle="Track every role you apply to — status updates show here." section="EVERY APPLICATION, ONE PLACE" icon="applications" />
      <SeekerApplicationsList />
    </main>
  );
}
