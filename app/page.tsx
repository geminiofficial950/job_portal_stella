import GeminiHomePage from "./components/GeminiHomePage";

export default function Home() {
  // Kick job cache warm while user is on the homepage (before they open /jobs)
  if (process.env.JOBS_WARM_ON_BOOT !== "0") {
    void import("@/lib/warm-jobs-cache")
      .then(({ warmJobsCache }) => warmJobsCache())
      .catch(() => {});
  }

  return <GeminiHomePage />;
}
