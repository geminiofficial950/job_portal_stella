/** Display-only branding; persisted content and integration identifiers stay unchanged. */
export function brandText(text: string | null | undefined): string {
  return (text ?? "").replace(/\bStella(?: Careers| Jobs| Job)?\b/g, "Gemini Jobs");
}
