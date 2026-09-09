/**
 * Configurable Stella Careers content for benefits destinations.
 * Items marked pendingOwnerContent are placeholders — not live bookings.
 */

export type PriceLabel = "Free" | "Included for members" | string;

export type Masterclass = {
  id: string;
  title: string;
  outcome: string;
  speaker: string;
  speakerBackground: string;
  startsAt: string;
  timeZone: string;
  durationMinutes: number;
  format: "online" | "in-person";
  venueOrLink: string;
  capacity: number;
  price: PriceLabel;
  bookingStatus: "interest" | "open" | "full" | "pending_content";
  topic: string;
  pendingOwnerContent?: boolean;
};

export type Course = {
  id: string;
  title: string;
  outcome: string;
  provider: string;
  duration: string;
  mode: "online" | "blended" | "in-person";
  prerequisites: string;
  price: PriceLabel;
  trainingType: "professional-development" | "accredited" | "qualification";
  accessInstructions: string;
  pendingOwnerContent?: boolean;
};

export type ProfessionalEvent = {
  id: string;
  title: string;
  organiser: string;
  industry: string;
  location: string;
  startsAt: string;
  timeZone: string;
  format: "online" | "in-person" | "hybrid";
  accessibility: string;
  price: PriceLabel;
  hostedBy: "stella" | "external";
  bookingUrl: string | null;
  pendingOwnerContent?: boolean;
};

export type VerificationCheck = {
  id: string;
  name: string;
  evidenceNeeded: string;
  method: string;
  expectedTiming: string;
  fees: PriceLabel;
  pendingOwnerContent?: boolean;
};

export const STELLA_CONTACT = {
  companyName: "Stella Careers",
  email: "support@stellacareers.com.au",
  phone: "Pending owner content",
  supportHours: "Pending owner content — business hours AEST",
  address: "Australia (operating address pending owner content)",
  pendingOwnerContent: true as const,
};

export const BENEFIT_CARDS = [
  {
    id: "free-profile",
    title: "Free profile building",
    description:
      "Build a professional profile that shows your experience, skills and career goals. Get help presenting yourself to employers.",
    button: "Build my free profile",
    href: "/profile/setup",
  },
  {
    id: "masterclasses",
    title: "Masterclasses with industry experts",
    description:
      "Learn from industry experts about resumes, interviews and building your career.",
    button: "Explore masterclasses",
    href: "/masterclasses",
  },
  {
    id: "courses",
    title: "Professional development courses",
    description:
      "Build practical skills with professional development courses that support your next career step.",
    button: "Explore courses",
    href: "/courses",
  },
  {
    id: "events",
    title: "Professional events and connections",
    description:
      "Discover industry events, meet professionals and connect with employers.",
    button: "Find events",
    href: "/events",
  },
  {
    id: "verification",
    title: "Credential and experience verification",
    description:
      "Get eligible qualifications, work experience and relevant checks verified, with clear status updates for you and employers.",
    button: "See how verification works",
    href: "/verification",
  },
] as const;

export const FAQ_ITEMS = [
  {
    q: "What is free?",
    a: "Building and editing your Stella Careers candidate profile is free. Masterclasses, courses, events and verification may be Free, Included for members, or charged — each item shows its price.",
  },
  {
    q: "Can I join without a resume?",
    a: "Yes. You can create an account and build your profile manually. A resume upload is optional.",
  },
  {
    q: "What gets verified?",
    a: "Eligible qualifications, work experience and other checks listed on the verification page. Exact methods, timing and fees are published per check type.",
  },
  {
    q: "Who sees my profile?",
    a: "You control employer visibility from your dashboard. Contact details and supporting documents stay restricted.",
  },
  {
    q: "Can overseas qualifications be checked?",
    a: "Overseas qualifications can be submitted where Stella supports that check type. Availability and fees are listed on the verification page.",
  },
  {
    q: "Do courses guarantee a job?",
    a: "No. Courses and masterclasses support skill-building and do not guarantee employment.",
  },
] as const;

export const MASTERCLASSES: Masterclass[] = [
  {
    id: "resume-that-gets-read",
    title: "Resumes that get read",
    outcome: "Leave with a clearer structure for an Australian job-ready resume.",
    speaker: "Speaker name pending",
    speakerBackground:
      "Pending owner content — industry expert bio required before launch.",
    startsAt: "2026-10-15T18:00:00+11:00",
    timeZone: "Australia/Sydney",
    durationMinutes: 75,
    format: "online",
    venueOrLink: "Online link provided after registration opens",
    capacity: 40,
    price: "Pending owner content",
    bookingStatus: "pending_content",
    topic: "Resumes",
    pendingOwnerContent: true,
  },
  {
    id: "interview-confidence",
    title: "Interview confidence",
    outcome: "Practise answering common interview questions with clear examples.",
    speaker: "Speaker name pending",
    speakerBackground:
      "Pending owner content — industry expert bio required before launch.",
    startsAt: "2026-10-29T18:00:00+11:00",
    timeZone: "Australia/Sydney",
    durationMinutes: 90,
    format: "online",
    venueOrLink: "Online link provided after registration opens",
    capacity: 40,
    price: "Included for members",
    bookingStatus: "interest",
    topic: "Interviews",
    pendingOwnerContent: true,
  },
];

export const COURSES: Course[] = [
  {
    id: "workplace-communication",
    title: "Workplace communication essentials",
    outcome: "Practical communication skills for Australian workplaces.",
    provider: "Pending owner content",
    duration: "4 weeks",
    mode: "online",
    prerequisites: "None",
    price: "Pending owner content",
    trainingType: "professional-development",
    accessInstructions:
      "Access instructions will be published when the learning provider is confirmed.",
    pendingOwnerContent: true,
  },
  {
    id: "digital-job-search",
    title: "Digital job search skills",
    outcome: "Learn to search, shortlist and apply for roles with confidence.",
    provider: "Pending owner content",
    duration: "2 weeks",
    mode: "online",
    prerequisites: "Free Stella profile recommended",
    price: "Free",
    trainingType: "professional-development",
    accessInstructions:
      "Enrolment handoff opens when the provider link is supplied by Stella.",
    pendingOwnerContent: true,
  },
];

export const EVENTS: ProfessionalEvent[] = [
  {
    id: "industry-networking-evening",
    title: "Industry networking evening",
    organiser: "Stella Careers",
    industry: "General careers",
    location: "Sydney CBD (venue pending)",
    startsAt: "2026-11-12T17:30:00+11:00",
    timeZone: "Australia/Sydney",
    format: "in-person",
    accessibility: "Accessibility details pending owner content",
    price: "Pending owner content",
    hostedBy: "stella",
    bookingUrl: null,
    pendingOwnerContent: true,
  },
  {
    id: "employer-panel",
    title: "Employer panel: what hiring managers look for",
    organiser: "External partner (pending)",
    industry: "Professional services",
    location: "Online",
    startsAt: "2026-11-26T12:00:00+11:00",
    timeZone: "Australia/Sydney",
    format: "online",
    accessibility: "Online event — captioning status pending",
    price: "Free",
    hostedBy: "external",
    bookingUrl: null,
    pendingOwnerContent: true,
  },
];

export const VERIFICATION_CHECKS: VerificationCheck[] = [
  {
    id: "qualification",
    name: "Qualification check",
    evidenceNeeded: "Certificate or academic transcript (PDF/JPG)",
    method: "Pending owner content — staff review process to be confirmed",
    expectedTiming: "Pending owner content",
    fees: "Pending owner content",
    pendingOwnerContent: true,
  },
  {
    id: "work-experience",
    name: "Work experience check",
    evidenceNeeded:
      "Reference letter, payslip sample, or employment confirmation",
    method: "Pending owner content — employer or document review",
    expectedTiming: "Pending owner content",
    fees: "Pending owner content",
    pendingOwnerContent: true,
  },
  {
    id: "identity-work-rights",
    name: "Identity / work rights (where eligible)",
    evidenceNeeded:
      "Government ID and work rights evidence as listed at request time",
    method:
      "Pending owner content — responsible staff to be named before launch",
    expectedTiming: "Pending owner content",
    fees: "Pending owner content",
    pendingOwnerContent: true,
  },
];

export function getMasterclass(id: string) {
  return MASTERCLASSES.find((m) => m.id === id);
}
export function getCourse(id: string) {
  return COURSES.find((c) => c.id === id);
}
export function getEvent(id: string) {
  return EVENTS.find((e) => e.id === id);
}
export function formatPrice(price: PriceLabel) {
  return price;
}

export function formatWhen(iso: string, timeZone: string) {
  const match = iso.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?(?:([+-]\d{2}:\d{2})|Z)?/,
  );
  if (!match) return `${iso} (${timeZone})`;
  const [, y, m, d, hh, mm] = match;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[Number(m) - 1] || m;
  const hourNum = Number(hh);
  const suffix = hourNum >= 12 ? "pm" : "am";
  const hour12 = ((hourNum + 11) % 12) + 1;
  return `${Number(d)} ${month} ${y}, ${hour12}:${mm} ${suffix} (${timeZone})`;
}

export function upcomingMasterclasses(limit = 3) {
  const now = Date.now();
  return MASTERCLASSES.filter((m) => new Date(m.startsAt).getTime() >= now).slice(
    0,
    limit,
  );
}
export function upcomingEvents(limit = 3) {
  const now = Date.now();
  return EVENTS.filter((e) => new Date(e.startsAt).getTime() >= now).slice(
    0,
    limit,
  );
}
export function selectedCourses(limit = 3) {
  return COURSES.slice(0, limit);
}
