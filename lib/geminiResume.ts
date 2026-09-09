import { GoogleGenAI } from "@google/genai";

export type ExtractedSeekerProfile = {
  headline: string;
  location: string;
  about: string;
  skills: string[];
  experienceLevel: "" | "entry" | "mid" | "senior";
  education: string;
  preferredEmploymentTypes: string[];
  preferredWorkModes: string[];
  salaryExpectation: string;
  linkedin: string;
  portfolio: string;
  openToWork: boolean;
};

const EXTRACTION_PROMPT = `You are extracting structured career profile data from a resume or LinkedIn profile PDF export for a job portal.

The source may be a classic resume OR a LinkedIn "Save to PDF" profile. Prioritize these fields when present:
- About / Summary / About section → about
- Location / Area / Geography → location
- Skills / Top skills / Featured skills → skills
- Education (highest or most recent) → education (Degree · School · Year)
- Headline / current role title → headline
- Experience history → experienceLevel

Return ONLY valid JSON (no markdown) matching this exact shape:
{
  "headline": "short professional title, max 120 chars",
  "location": "city/region/country if present else empty string",
  "about": "2-4 sentence professional summary based on the document",
  "skills": ["skill1", "skill2"],
  "experienceLevel": "entry" | "mid" | "senior" | "",
  "education": "highest education as Degree · School · Year (or best available)",
  "preferredEmploymentTypes": [],
  "preferredWorkModes": [],
  "salaryExpectation": "",
  "linkedin": "full linkedin URL if found else empty string",
  "portfolio": "portfolio/github/website URL if found else empty string",
  "openToWork": true
}

Rules:
- skills: max 20 distinct technical/professional skills (from Skills section when available)
- about: prefer the About/Summary section text; if missing, synthesize 2-4 sentences from experience without inventing facts
- location: use the profile location line when present
- education: prefer Education section; one concise line
- experienceLevel: entry (<2y), mid (2-6y), senior (6y+) based on work history; "" if unclear
- preferredEmploymentTypes may only include: full-time, part-time, casual, contract
- preferredWorkModes may only include: onsite, hybrid, remote
- Do not invent employers, degrees, or URLs that are not in the document
- If a field is unknown, use "" or [] as appropriate`;

const DEFAULT_MODELS = [
  process.env.GOOGLE_GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash-lite",
].filter(Boolean) as string[];

function getClient() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey });
}

export function geminiErrorMessage(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);

  try {
    const parsed = JSON.parse(raw) as {
      error?: { message?: string; status?: string; code?: number };
    };
    const msg = parsed.error?.message || raw;
    const status = parsed.error?.status || "";
    if (/denied access/i.test(msg)) {
      return "Gemini project access denied — check your API key / billing in Google AI Studio";
    }
    if (
      parsed.error?.code === 429 ||
      /RESOURCE_EXHAUSTED/i.test(status) ||
      /quota|rate.?limit|RESOURCE_EXHAUSTED/i.test(msg)
    ) {
      return "Gemini API quota exceeded. Wait a bit, or enable billing / raise limits in Google AI Studio (ai.google.dev), then try again.";
    }
    if (/API key|INVALID_ARGUMENT|permission/i.test(msg)) {
      return "Gemini API key is invalid or missing permissions";
    }
    return msg.slice(0, 220);
  } catch {
    if (/denied access/i.test(raw)) {
      return "Gemini project access denied — check your API key / billing in Google AI Studio";
    }
    if (/429|RESOURCE_EXHAUSTED|quota|rate.?limit/i.test(raw)) {
      return "Gemini API quota exceeded. Wait a bit, or enable billing / raise limits in Google AI Studio (ai.google.dev), then try again.";
    }
    return raw.slice(0, 220);
  }
}

export function isGeminiQuotaError(error: unknown): boolean {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);
  return /429|RESOURCE_EXHAUSTED|quota|rate.?limit/i.test(raw);
}

function normalizeExtracted(raw: unknown): ExtractedSeekerProfile {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;

  const skills = Array.isArray(obj.skills)
    ? obj.skills
        .map((s) => String(s).trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];

  const employment = Array.isArray(obj.preferredEmploymentTypes)
    ? obj.preferredEmploymentTypes
        .map((s) => String(s).toLowerCase())
        .filter((s) =>
          ["full-time", "part-time", "casual", "contract"].includes(s)
        )
    : [];

  const modes = Array.isArray(obj.preferredWorkModes)
    ? obj.preferredWorkModes
        .map((s) => String(s).toLowerCase())
        .filter((s) => ["onsite", "hybrid", "remote"].includes(s))
    : [];

  const level = String(obj.experienceLevel || "");
  const experienceLevel = (["entry", "mid", "senior"].includes(level)
    ? level
    : "") as ExtractedSeekerProfile["experienceLevel"];

  return {
    headline: String(obj.headline || "").trim().slice(0, 120),
    location: String(obj.location || "").trim().slice(0, 120),
    about: String(obj.about || "").trim().slice(0, 2000),
    skills,
    experienceLevel,
    education: String(obj.education || "").trim().slice(0, 200),
    preferredEmploymentTypes: employment,
    preferredWorkModes: modes,
    salaryExpectation: String(obj.salaryExpectation || "").trim().slice(0, 80),
    linkedin: String(obj.linkedin || "").trim().slice(0, 200),
    portfolio: String(obj.portfolio || "").trim().slice(0, 200),
    openToWork: obj.openToWork !== false,
  };
}

function parseJsonText(text: string): unknown {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

async function generateJson(
  parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  >
): Promise<ExtractedSeekerProfile> {
  const ai = getClient();
  const tried = new Set<string>();
  let lastError: unknown;

  for (const model of DEFAULT_MODELS) {
    if (tried.has(model)) continue;
    tried.add(model);
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Gemini returned an empty response");
      }
      return normalizeExtracted(parseJsonText(text));
    } catch (error) {
      lastError = error;
      // Quota is project-wide — don't burn more calls on other models
      if (isGeminiQuotaError(error)) {
        throw error instanceof Error
          ? error
          : new Error(geminiErrorMessage(error));
      }
      const msg = geminiErrorMessage(error);
      // If model redirects to another name, try extracting suggested model
      const suggest = String(
        error instanceof Error ? error.message : error
      ).match(/use models\/([a-z0-9.-]+)/i)?.[1];
      if (suggest && !tried.has(suggest)) {
        DEFAULT_MODELS.push(suggest);
      }
      // Keep trying other models on 404/unavailable
      if (!/no longer available|not found|NOT_FOUND/i.test(msg)) {
        continue;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(geminiErrorMessage(lastError));
}

export async function extractProfileFromResumeFile(input: {
  buffer: Buffer;
  mimeType: string;
}): Promise<ExtractedSeekerProfile> {
  return generateJson([
    { text: EXTRACTION_PROMPT },
    {
      inlineData: {
        mimeType: input.mimeType,
        data: input.buffer.toString("base64"),
      },
    },
  ]);
}

export async function extractProfileFromResumeText(
  resumeText: string
): Promise<ExtractedSeekerProfile> {
  return generateJson([
    {
      text: `${EXTRACTION_PROMPT}\n\nResume text:\n${resumeText.slice(0, 60000)}`,
    },
  ]);
}

/**
 * Fetch LinkedIn profile details from a public URL via Gemini URL Context
 * (+ Google Search fallback). LinkedIn often blocks direct HTTP scrapes.
 */
export async function extractProfileFromLinkedInUrl(
  linkedinUrl: string,
): Promise<ExtractedSeekerProfile> {
  const ai = getClient();
  const prompt = `You must extract a job-seeker career profile from this LinkedIn profile URL:
${linkedinUrl}

Instructions:
1. Use the url_context tool to retrieve content from that LinkedIn URL.
2. If the page is blocked or sparse, use google_search for public professional info about this person (name/headline from the URL slug and any indexed LinkedIn snippets).
3. Prefer About/Summary, Location, Skills, Education, Experience/headline from LinkedIn when available.
4. Return ONLY valid JSON (no markdown) matching this exact shape:
{
  "headline": "short professional title, max 120 chars",
  "location": "city/region/country if present else empty string",
  "about": "2-4 sentence professional summary",
  "skills": ["skill1", "skill2"],
  "experienceLevel": "entry" | "mid" | "senior" | "",
  "education": "highest education as Degree · School · Year (or best available)",
  "preferredEmploymentTypes": [],
  "preferredWorkModes": [],
  "salaryExpectation": "",
  "linkedin": "${linkedinUrl}",
  "portfolio": "portfolio/github/website URL if found else empty string",
  "openToWork": true
}

Rules:
- skills: max 20 distinct skills
- about: min ~30 chars when any bio/experience exists
- Do not invent employers, degrees, or skills that are not supported by retrieved content
- If a field is unknown, use "" or []
- linkedin must be exactly: ${linkedinUrl}`;

  const tried = new Set<string>();
  let lastError: unknown;

  for (const model of DEFAULT_MODELS) {
    if (tried.has(model)) continue;
    tried.add(model);
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          tools: [{ urlContext: {} }, { googleSearch: {} }],
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Gemini returned an empty response for LinkedIn URL");
      }
      return normalizeExtracted(parseJsonText(text));
    } catch (error) {
      lastError = error;
      // Quota is project-wide — don't burn more calls on other models
      if (isGeminiQuotaError(error)) {
        throw error instanceof Error
          ? error
          : new Error(geminiErrorMessage(error));
      }
      const msg = geminiErrorMessage(error);
      const suggest = String(
        error instanceof Error ? error.message : error,
      ).match(/use models\/([a-z0-9.-]+)/i)?.[1];
      if (suggest && !tried.has(suggest)) {
        DEFAULT_MODELS.push(suggest);
      }
      if (!/no longer available|not found|NOT_FOUND/i.test(msg)) {
        continue;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(geminiErrorMessage(lastError));
}

export function hasExtractedProfileContent(
  profile: ExtractedSeekerProfile,
): boolean {
  return Boolean(
    profile.headline.trim() ||
      profile.about.trim() ||
      profile.location.trim() ||
      profile.education.trim() ||
      profile.skills.length > 0,
  );
}
