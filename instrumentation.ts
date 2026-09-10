/**
 * Next.js instrumentation — warm job caches as soon as the Node server boots,
 * before users hit /jobs.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.JOBS_WARM_ON_BOOT === "0") return;

  // Defer slightly so boot isn't blocked; still finishes before typical first visit
  setTimeout(() => {
    void import("./lib/warm-jobs-cache")
      .then(({ warmJobsCache }) => warmJobsCache({ force: true }))
      .then((result) => {
        if (result.ok) {
          console.info(
            `[jobs-warm] ready — AU:${result.adzunaAu} all:${result.adzunaAll} himalayas:${result.himalayas} jooble:${result.jooble} snapshots:${result.browseSnapshots.length}`,
          );
        } else {
          console.warn("[jobs-warm] failed:", result.error);
        }
      })
      .catch((err) => console.warn("[jobs-warm] error:", err));
  }, 1500);
}
