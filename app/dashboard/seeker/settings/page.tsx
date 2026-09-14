import SeekerSettingsForm from "@/app/components/SeekerSettingsForm";
import SeekerPageHeader from "@/app/components/SeekerPageHeader";
import styles from "../seeker.module.css";

export default function Page() {
  return (
    <main className={styles.subpage}>
      <SeekerPageHeader title="Account Settings" subtitle="Manage your account, alerts, and password." section="MAKE THIS SPACE YOURS" icon="settings" />
      <SeekerSettingsForm />
    </main>
  );
}
