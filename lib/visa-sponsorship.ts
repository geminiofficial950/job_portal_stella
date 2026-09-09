/** Detect visa sponsorship mentions in job copy */
export function jobOffersVisaSponsorship(job: {
  title?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  category?: string;
}): boolean {
  const hay = [
    job.title,
    job.description,
    job.requirements,
    job.responsibilities,
    job.benefits,
    job.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (!hay) return false;
  return (
    /visa\s*sponsorship/.test(hay) ||
    /sponsorship\s*(available|provided|offered)/.test(hay) ||
    /sponsor(s|ed|ing)?\s+(a\s+)?visa/.test(hay) ||
    /visa\s+sponsor/.test(hay) ||
    /will\s+sponsor/.test(hay) ||
    /relocation\s+(and|&)\s+visa/.test(hay) ||
    /\b482\b/.test(hay) ||
    /\btss\s+visa\b/.test(hay) ||
    /\b186\b.*visa|visa.*\b186\b/.test(hay)
  );
}
