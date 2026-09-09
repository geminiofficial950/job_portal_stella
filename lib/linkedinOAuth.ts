import { SignJWT, jwtVerify } from "jose";

export const LINKEDIN_STATE_COOKIE = "linkedin_oauth_state";
export const LINKEDIN_IMPORT_COOKIE = "linkedin_import_draft";

export type LinkedInExperience = {
  title: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string;
};

export type LinkedInNormalizedProfile = {
  name: string;
  email: string;
  picture: string;
  memberId: string;
  locale: string;
  linkedin: string;
  headline: string;
  about: string;
  location: string;
  education: string;
  skills: string[];
  experienceLevel: "" | "entry" | "mid" | "senior";
  experience: LinkedInExperience[];
  /** openid = Sign In with LinkedIn; identityMe = Verified on LinkedIn fields */
  sources: string[];
  warnings: string[];
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing from .env");
  return new TextEncoder().encode(secret);
}

export function getLinkedInConfig() {
  const clientId = process.env.LINKEDIN_CLIENT_ID?.trim() || "";
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET?.trim() || "";
  const redirectUri =
    process.env.LINKEDIN_REDIRECT_URI?.trim() ||
    "http://localhost:3000/api/seeker/profile/linkedin/callback";
  const scopes =
    process.env.LINKEDIN_SCOPES?.trim() || "openid profile email";
  const apiVersion = process.env.LINKEDIN_API_VERSION?.trim() || "202510";

  return { clientId, clientSecret, redirectUri, scopes, apiVersion };
}

export function isLinkedInConfigured() {
  const { clientId, clientSecret } = getLinkedInConfig();
  return Boolean(clientId && clientSecret);
}

export function buildLinkedInAuthUrl(state: string) {
  const { clientId, redirectUri, scopes } = getLinkedInConfig();
  const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", scopes);
  return url.toString();
}

export async function signLinkedInState(userId: string) {
  return new SignJWT({ purpose: "linkedin_oauth" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getJwtSecret());
}

export async function verifyLinkedInState(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.purpose !== "linkedin_oauth" || !payload.sub) return null;
    return { userId: payload.sub };
  } catch {
    return null;
  }
}

export async function signLinkedInImportDraft(
  userId: string,
  profile: LinkedInNormalizedProfile,
) {
  return new SignJWT({
    purpose: "linkedin_import",
    profile,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("20m")
    .sign(getJwtSecret());
}

export async function verifyLinkedInImportDraft(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.purpose !== "linkedin_import" || !payload.sub) return null;
    return {
      userId: payload.sub,
      profile: payload.profile as LinkedInNormalizedProfile,
    };
  } catch {
    return null;
  }
}

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  error?: string;
  error_description?: string;
};

export async function exchangeLinkedInCode(code: string) {
  const { clientId, clientSecret, redirectUri } = getLinkedInConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(20000),
  });
  const data = (await res.json()) as TokenResponse;
  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description ||
        data.error ||
        "Failed to exchange LinkedIn authorization code",
    );
  }
  return data.access_token;
}

function localizedText(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    const obj = value as {
      localized?: Record<string, string>;
      preferredLocale?: { language?: string; country?: string };
    };
    const localized = obj.localized || {};
    const preferred = obj.preferredLocale;
    if (preferred?.language && preferred?.country) {
      const key = `${preferred.language}_${preferred.country}`;
      if (localized[key]) return String(localized[key]).trim();
    }
    const first = Object.values(localized)[0];
    if (first) return String(first).trim();
  }
  return "";
}

function formatStartDate(startedOn: unknown): string {
  if (!startedOn || typeof startedOn !== "object") return "";
  const { month, year } = startedOn as { month?: number; year?: number };
  if (!year) return "";
  if (month && month >= 1 && month <= 12) {
    return `${String(month).padStart(2, "0")}/${year}`;
  }
  return String(year);
}

function guessExperienceLevel(startYear?: number): "" | "entry" | "mid" | "senior" {
  if (!startYear) return "";
  const years = new Date().getFullYear() - startYear;
  if (years < 2) return "entry";
  if (years < 6) return "mid";
  return "senior";
}

type UserInfo = {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
  locale?: string | { language?: string; country?: string };
};

async function fetchUserInfo(accessToken: string): Promise<UserInfo | null> {
  const res = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) return null;
  return (await res.json()) as UserInfo;
}

type IdentityMe = {
  id?: string;
  basicInfo?: {
    firstName?: unknown;
    lastName?: unknown;
    primaryEmailAddress?: string;
    profileUrl?: string;
    profilePicture?: {
      croppedImage?: { downloadUrl?: string };
    };
  };
  mostRecentEducation?: {
    schoolName?: unknown;
    degreeName?: unknown;
  };
  primaryCurrentPosition?: {
    title?: unknown;
    companyName?: unknown;
    companyPageUrl?: string;
    startedOn?: { month?: number; year?: number };
  };
};

async function fetchIdentityMe(
  accessToken: string,
  apiVersion: string,
): Promise<{ data: IdentityMe | null; status: number; detail: string }> {
  const res = await fetch("https://api.linkedin.com/rest/identityMe", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "LinkedIn-Version": apiVersion,
      "X-Restli-Protocol-Version": "2.0.0",
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return {
      data: null,
      status: res.status,
      detail: body.slice(0, 240),
    };
  }
  return {
    data: (await res.json()) as IdentityMe,
    status: res.status,
    detail: "",
  };
}

type SnapshotRow = Record<string, string>;

function pickField(row: SnapshotRow, keys: string[]) {
  for (const key of keys) {
    const direct = row[key];
    if (typeof direct === "string" && direct.trim()) return direct.trim();
  }
  const lowerMap = new Map(
    Object.entries(row).map(([k, v]) => [k.toLowerCase(), String(v ?? "")]),
  );
  for (const key of keys) {
    const value = lowerMap.get(key.toLowerCase());
    if (value?.trim()) return value.trim();
  }
  return "";
}

async function fetchSnapshotDomain(
  accessToken: string,
  domain: string,
): Promise<{ rows: SnapshotRow[]; status: number; detail: string }> {
  const rows: SnapshotRow[] = [];
  let start = 0;
  const count = 50;
  let status = 0;
  let detail = "";

  for (let page = 0; page < 20; page += 1) {
    const url = new URL("https://api.linkedin.com/rest/memberSnapshotData");
    url.searchParams.set("q", "criteria");
    url.searchParams.set("domain", domain);
    url.searchParams.set("start", String(start));
    url.searchParams.set("count", String(count));

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "LinkedIn-Version": "202312",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      signal: AbortSignal.timeout(30000),
    });
    status = res.status;
    if (!res.ok) {
      detail = (await res.text().catch(() => "")).slice(0, 240);
      break;
    }

    const data = (await res.json()) as {
      elements?: Array<{ snapshotDomain?: string; snapshotData?: SnapshotRow[] }>;
      paging?: { links?: Array<{ rel?: string; href?: string }> };
    };

    for (const element of data.elements || []) {
      if (element.snapshotDomain && element.snapshotDomain !== domain) continue;
      for (const row of element.snapshotData || []) {
        rows.push(row);
      }
    }

    const next = (data.paging?.links || []).find((l) => l.rel === "next")?.href;
    if (!next) break;
    const nextStart = new URL(next, "https://api.linkedin.com").searchParams.get(
      "start",
    );
    if (!nextStart) break;
    start = Number(nextStart);
    if (Number.isNaN(start)) break;
  }

  return { rows, status, detail };
}

async function fetchDmaCareerSnapshot(accessToken: string) {
  const domains = ["PROFILE", "POSITIONS", "EDUCATION", "SKILLS"] as const;
  const results = await Promise.all(
    domains.map(async (domain) => {
      // Snapshot can lag right after consent — brief retry
      let last = await fetchSnapshotDomain(accessToken, domain);
      if (
        last.status === 404 ||
        (last.status === 200 && last.rows.length === 0)
      ) {
        await new Promise((r) => setTimeout(r, 1500));
        last = await fetchSnapshotDomain(accessToken, domain);
      }
      return [domain, last] as const;
    }),
  );

  return Object.fromEntries(results) as Record<
    (typeof domains)[number],
    Awaited<ReturnType<typeof fetchSnapshotDomain>>
  >;
}

/**
 * Fetch + normalize LinkedIn member data via official OAuth APIs.
 * - OpenID /userinfo → name, email, picture
 * - Member Data Portability (DMA) snapshot → PROFILE/POSITIONS/EDUCATION/SKILLS
 *   (requires product access + r_dma_portability_3rd_party; typically EU/EEA/CH members)
 */
export async function fetchLinkedInNormalizedProfile(
  accessToken: string,
): Promise<LinkedInNormalizedProfile> {
  const { scopes } = getLinkedInConfig();
  const warnings: string[] = [];
  const sources: string[] = [];

  const wantsDma = /\br_dma_portability_3rd_party\b/.test(scopes);

  const [userInfo, identityResult, dma] = await Promise.all([
    fetchUserInfo(accessToken),
    fetchIdentityMe(accessToken, getLinkedInConfig().apiVersion),
    wantsDma
      ? fetchDmaCareerSnapshot(accessToken)
      : Promise.resolve(null),
  ]);
  const identityMe = identityResult.data;

  if (userInfo) sources.push("openid_userinfo");
  if (identityMe) sources.push("identityMe");
  if (dma && Object.values(dma).some((d) => d.rows.length > 0)) {
    sources.push("dma_snapshot");
  }

  const profileRow = dma?.PROFILE.rows[0] || {};
  const positionRows = dma?.POSITIONS.rows || [];
  const educationRows = dma?.EDUCATION.rows || [];
  const skillRows = dma?.SKILLS.rows || [];

  const first =
    pickField(profileRow, ["First Name"]) ||
    localizedText(identityMe?.basicInfo?.firstName) ||
    userInfo?.given_name ||
    "";
  const last =
    pickField(profileRow, ["Last Name"]) ||
    localizedText(identityMe?.basicInfo?.lastName) ||
    userInfo?.family_name ||
    "";
  const name =
    [first, last].filter(Boolean).join(" ").trim() ||
    userInfo?.name?.trim() ||
    "";

  const email =
    identityMe?.basicInfo?.primaryEmailAddress?.trim() ||
    userInfo?.email?.trim() ||
    "";

  const picture =
    identityMe?.basicInfo?.profilePicture?.croppedImage?.downloadUrl?.trim() ||
    userInfo?.picture?.trim() ||
    "";

  const linkedin = identityMe?.basicInfo?.profileUrl?.trim() || "";

  const experience: LinkedInExperience[] = positionRows.map((row) => ({
    title: pickField(row, ["Title", "Position"]),
    company: pickField(row, ["Company Name", "Company"]),
    description: pickField(row, ["Description"]),
    startDate: pickField(row, ["Started On", "Start Date"]),
    endDate: pickField(row, ["Finished On", "End Date"]) || "Present",
  }));

  // Fallback: Plus identityMe current role
  if (!experience.length) {
    const title = localizedText(identityMe?.primaryCurrentPosition?.title);
    const company = localizedText(
      identityMe?.primaryCurrentPosition?.companyName,
    );
    const startDate = formatStartDate(
      identityMe?.primaryCurrentPosition?.startedOn,
    );
    if (title || company) {
      experience.push({
        title,
        company,
        description: "",
        startDate,
        endDate: "Present",
      });
    }
  }

  const educationFromDma = educationRows
    .map((row) => {
      const degree = pickField(row, [
        "Degree Name",
        "Degree",
        "Notes",
      ]);
      const school = pickField(row, ["School Name", "School"]);
      return [degree, school].filter(Boolean).join(" · ");
    })
    .filter(Boolean);

  const degree = localizedText(identityMe?.mostRecentEducation?.degreeName);
  const school = localizedText(identityMe?.mostRecentEducation?.schoolName);
  const educationFallback = [degree, school].filter(Boolean).join(" · ");
  const education =
    educationFromDma[0] || educationFallback || educationFromDma.join(" | ");

  const skills = skillRows
    .map((row) => pickField(row, ["Name", "Skill Name", "Skill"]))
    .filter(Boolean)
    .slice(0, 30);

  const headline =
    pickField(profileRow, ["Headline"]) ||
    (experience[0]
      ? experience[0].company
        ? `${experience[0].title} at ${experience[0].company}`.trim()
        : experience[0].title
      : "");

  const aboutFromProfile = pickField(profileRow, ["Summary", "About"]);
  const aboutFromExperience = experience
    .slice(0, 3)
    .map((job) => {
      const when = [job.startDate, job.endDate || "Present"]
        .filter(Boolean)
        .join(" – ");
      const head = [job.title, job.company].filter(Boolean).join(" at ");
      const line = [head, when].filter(Boolean).join(" · ");
      return job.description ? `${line}\n${job.description}` : line;
    })
    .filter(Boolean)
    .join("\n\n");

  let about = aboutFromProfile || aboutFromExperience;
  if (!about && name && headline) {
    about = `${name} is a ${headline}.`;
  }
  if (!about && name) {
    about = `${name} imported their LinkedIn identity. Add a short professional summary here.`;
  }

  const location = pickField(profileRow, [
    "Geo Location",
    "Location",
    "Address",
  ]);

  const startYearMatch = experience[0]?.startDate?.match(/(19|20)\d{2}/);
  const startYear = startYearMatch
    ? Number(startYearMatch[0])
    : identityMe?.primaryCurrentPosition?.startedOn?.year;

  if (wantsDma) {
    const profileStatus = dma?.PROFILE.status || 0;
    if (profileStatus === 403) {
      warnings.push(
        "Member Data Portability API returned 403. Request access to “Member Data Portability API (3rd Party)” in Products, then re-import and approve permissions.",
      );
    } else if (
      !dma?.PROFILE.rows.length &&
      !dma?.POSITIONS.rows.length &&
      !dma?.EDUCATION.rows.length &&
      !dma?.SKILLS.rows.length
    ) {
      warnings.push(
        "Portability snapshot is empty. LinkedIn often limits this to EU/EEA/Switzerland profile locations, and data can take a few minutes after first consent — try again shortly.",
      );
    }
  } else {
    warnings.push(
      "Enable “Member Data Portability API (3rd Party)” in LinkedIn Products and add scope r_dma_portability_3rd_party for About, experience, education, and skills.",
    );
  }

  if (!aboutFromProfile && about.length > 0) {
    warnings.push(
      "About was built from experience/headline because LinkedIn Summary was empty — edit if needed.",
    );
  }

  const locale =
    typeof userInfo?.locale === "string"
      ? userInfo.locale
      : userInfo?.locale
        ? `${userInfo.locale.language || ""}-${userInfo.locale.country || ""}`
        : "";

  return {
    name,
    email,
    picture,
    memberId: identityMe?.id || userInfo?.sub || "",
    locale,
    linkedin,
    headline: headline.slice(0, 120),
    about: about.slice(0, 2000),
    location: location.slice(0, 120),
    education: education.slice(0, 200),
    skills,
    experienceLevel: guessExperienceLevel(startYear),
    experience,
    sources,
    warnings,
  };
}

export function linkedInToSeekerProfileFields(
  profile: LinkedInNormalizedProfile,
) {
  return {
    headline: profile.headline,
    location: profile.location,
    about: profile.about,
    skills: profile.skills,
    experienceLevel: profile.experienceLevel,
    education: profile.education,
    linkedin: profile.linkedin,
    preferredEmploymentTypes: [] as string[],
    preferredWorkModes: [] as string[],
    salaryExpectation: "",
    portfolio: "",
    resumeUrl: "",
    openToWork: true,
  };
}
