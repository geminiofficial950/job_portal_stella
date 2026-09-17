export const COVER_LETTER_MAX_LENGTH = 1000;

export function validateCoverLetter(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return "A cover letter is required before you can apply.";
  }
  if (value.length > COVER_LETTER_MAX_LENGTH) {
    return `Keep your cover letter within ${COVER_LETTER_MAX_LENGTH} characters.`;
  }
  return null;
}
