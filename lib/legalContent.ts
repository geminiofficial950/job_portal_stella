import { STELLA_CONTACT } from "@/lib/stellaContent";

/** Published legal copy for Gemini Jobs. Rendered by the terms and privacy pages. */

export const LEGAL_META = {
  brand: "Gemini Jobs",
  websiteLabel: "www.geminijobs.com.au",
  websiteUrl: "https://www.geminijobs.com.au",
  email: STELLA_CONTACT.email,
  region: "Australia",
} as const;

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  kind: "terms" | "privacy";
  title: string;
  shortTitle: string;
  summary: string;
  sections: LegalSection[];
};

const email = LEGAL_META.email;
const site = LEGAL_META.websiteLabel;

export const TERMS_OF_SERVICE: LegalDocument = {
  kind: "terms",
  title: "Terms of Service",
  shortTitle: "Terms",
  summary:
    "These Terms govern your use of Gemini Jobs, a job aggregator and career platform at geminijobs.com.au. We list roles from employers and from other job sources. We are not an employment agency and we do not guarantee a job.",
  sections: [
    {
      id: "who-we-are",
      title: "Who we are",
      blocks: [
        {
          type: "p",
          text: `“Gemini Jobs”, “we”, “our” and “us” mean the operator of the website at ${site} and the related applications and features described in these Terms. Gemini Jobs is a job aggregator and career platform operated from Australia.`,
        },
        {
          type: "p",
          text: `Contact: ${email}. Notices under these Terms may be sent to that address, or to the email linked to your account.`,
        },
      ],
    },
    {
      id: "what-these-terms-cover",
      title: "What these Terms cover",
      blocks: [
        {
          type: "p",
          text: "These Terms govern your access to and use of:",
        },
        {
          type: "list",
          items: [
            `the website at ${site} and any subdomains we operate,`,
            "Gemini Jobs web applications and dashboards for job seekers, employers and recruiters,",
            "job search, aggregation, matching and application features,",
            "profile, résumé, learning, event and verification features, and",
            "all associated content we make available through those Services (together, the Services).",
          ],
        },
        {
          type: "p",
          text: "Our Privacy Policy explains how we handle personal information. It is incorporated into these Terms. If you do not agree with these Terms or the Privacy Policy, do not use the Services.",
        },
      ],
    },
    {
      id: "definitions",
      title: "Key definitions",
      blocks: [
        {
          type: "list",
          items: [
            "Aggregated Listing: a job advertisement we display that originated on a third-party job board, publisher or employer site, rather than a role posted directly on Gemini Jobs.",
            "Content: text, graphics, data and other materials in the Services, including job listings, AI-assisted extracts and our own pages.",
            "Employer: a company, recruiter or other hirer that posts a role, reviews candidates, or uses hiring tools on Gemini Jobs.",
            "Job Seeker: a person who browses roles, creates a profile, or applies for work through the Services.",
            "User Content: materials you upload or submit, including résumés, profile details, job descriptions, applications and messages.",
            "Paid Services: any fee-based feature we clearly price before you buy it. Core search and profile tools are free unless a price is shown at the time of purchase.",
          ],
        },
      ],
    },
    {
      id: "acceptance",
      title: "Acceptance of these Terms",
      blocks: [
        {
          type: "p",
          text: "By creating an account, browsing listings, posting a role, or otherwise using the Services, you agree to these Terms and to our Privacy Policy. If you use the Services for an organisation, you confirm you have authority to bind that organisation.",
        },
      ],
    },
    {
      id: "eligibility",
      title: "Eligibility and accounts",
      blocks: [
        {
          type: "p",
          text: "You must be able to form a binding contract in your place of residence. The Services are not directed at children. If you are under 18, you may use the Services only with the consent of a parent or guardian, and you must not submit another person’s personal information without authority to do so.",
        },
        {
          type: "p",
          text: "You must give accurate account information, keep it current, and protect your password. You are responsible for activity under your account. Tell us promptly at the contact email above if you believe your account has been used without permission. You may sign in with email and password or with Google, where that option is offered.",
        },
      ],
    },
    {
      id: "aggregation",
      title: "Job aggregation",
      blocks: [
        {
          type: "p",
          text: "Gemini Jobs helps people find work by bringing listings into one place. Some roles are posted by Employers on Gemini Jobs. Others are Aggregated Listings sourced from third-party platforms, which may include Adzuna, Jooble, Himalayas and similar publishers.",
        },
        {
          type: "p",
          text: "We do not employ the people advertised in Aggregated Listings, and we do not control whether an external role is still open, accurate, or lawfully advertised. Titles, locations, salaries, visa information and descriptions may be incomplete or out of date. Always check the original listing and the Employer’s own information before you rely on it or apply.",
        },
        {
          type: "p",
          text: "When you open an Aggregated Listing, we may show a summary on Gemini Jobs and link you to the source site to read the full advertisement or apply. That source site has its own terms and privacy notice. We are not a party to any application you submit there.",
        },
      ],
    },
    {
      id: "seekers",
      title: "Job seeker profiles and applications",
      blocks: [
        {
          type: "p",
          text: "You may create a profile, upload a résumé, import publicly available professional details you authorise from LinkedIn, save roles, and apply to roles that are posted on Gemini Jobs. You decide what to include. Do not upload information you are not allowed to share.",
        },
        {
          type: "p",
          text: "If you apply to a role posted on Gemini Jobs, you authorise us to send your application, résumé and the contact details you included to the Employer who posted that role. We do not automatically submit applications to external job boards on your behalf. Applying on a third-party site is your own action.",
        },
        {
          type: "p",
          text: "Discovery and matching tools compare roles with information in your profile, such as skills, titles, location and preferences, and may suggest roles or candidates. Suggestions are rankings to help you search. They are not a decision about your right to work, your suitability as an employee, or an Employer’s obligation to interview or hire you. You choose what to apply for. Employers choose whom to contact.",
        },
        {
          type: "p",
          text: "If you turn on profile discovery, approved Employers may see the profile fields you have made available for that purpose. Contact details are not released to an Employer merely because your profile is discoverable. Follow the controls in your account if you want to pause discovery or hide your profile.",
        },
      ],
    },
    {
      id: "employers",
      title: "Employers and recruiters",
      blocks: [
        {
          type: "p",
          text: "If you post a role or use hiring tools, you confirm that you are advertising a genuine opportunity, that you have the right to do so, and that the listing complies with Australian employment, advertising and anti-discrimination laws that apply to you. You must not advertise a role that does not exist, harvest candidate data for an unrelated purpose, or misrepresent the employer, the pay, or the right-to-work requirements.",
        },
        {
          type: "p",
          text: "Candidate information is provided so you can assess an application or a discoverable profile for a role. You must handle that information under privacy law that applies to you, use it only for recruitment related to the opportunity, and not sell it or add it to an unrelated marketing list.",
        },
        {
          type: "p",
          text: "We may refuse, edit the display of, or remove a listing or Employer account that we reasonably believe is misleading, unlawful, spam, or harmful to job seekers or to the platform.",
        },
      ],
    },
    {
      id: "learning",
      title: "Learning, events and verification",
      blocks: [
        {
          type: "p",
          text: "Courses, masterclasses and events shown on Gemini Jobs may be hosted by us or by someone else. External events are labelled. A click to an external booking page is not a booking with Gemini Jobs, and the organiser’s own terms apply.",
        },
        {
          type: "p",
          text: "Qualification or work-history checks are optional. If you ask us to check a claim, you consent to us reviewing the evidence you provide for that check. A verification status is not a government clearance, a licence to work, or a promise that an Employer will hire you.",
        },
      ],
    },
    {
      id: "communications",
      title: "Communications and marketing",
      blocks: [
        {
          type: "p",
          text: "We send service and transactional messages about your account, applications, interviews, security and similar matters. Those messages are part of providing the Services. You can adjust many notification preferences in your account settings.",
        },
        {
          type: "p",
          text: "Marketing email, including the newsletter, is sent only if you opt in — for example by joining the list in the website footer — or where the Spam Act 2003 (Cth) otherwise allows a message to an existing customer about our own similar services. Every commercial message will identify Gemini Jobs and include a way to unsubscribe. Unsubscribing does not close your account and does not affect your ability to search or apply.",
        },
      ],
    },
    {
      id: "prices",
      title: "Prices, renewals and refunds",
      blocks: [
        {
          type: "p",
          text: "Unless a price is clearly displayed before you confirm a purchase, the job search, profile and application features are provided without a subscription fee. If we introduce Paid Services, the price, billing period and what is included will be shown before you pay. Prices will be in Australian dollars and will state whether GST is included.",
        },
        {
          type: "p",
          text: "Where a Paid Service renews automatically, we will tell you that before you subscribe, and you may cancel at least 24 hours before the end of the current period to avoid the next charge. Consumer guarantees under the Australian Consumer Law are not excluded. Nothing in this section limits a refund or remedy you are entitled to by law.",
        },
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      blocks: [
        {
          type: "p",
          text: "You must not:",
        },
        {
          type: "list",
          items: [
            "break the law, or infringe anyone’s intellectual property or privacy rights;",
            "harass, discriminate, or post hate, fraudulent or illegal content;",
            "misrepresent your identity, qualifications, right to work, employer, or a job;",
            "upload malware, probe or disrupt the Services, or access an account or listing you are not allowed to use;",
            "scrape, harvest or republish listings, profiles or other data at scale, or use the Services to train a competing model or product, without our prior written consent;",
            "send spam, or use automation to create fake accounts, fake applications or fake jobs; or",
            "reverse engineer the Services except to the extent a non-excludable law allows.",
          ],
        },
        {
          type: "p",
          text: "To keep the platform reliable we may rate-limit, queue, reject or temporarily restrict searches, uploads and submissions.",
        },
      ],
    },
    {
      id: "user-content",
      title: "Licence to your content",
      blocks: [
        {
          type: "p",
          text: "You keep ownership of your User Content. You grant us a worldwide, non-exclusive, royalty-free licence to host, store, reproduce, process, adapt and display that content only so we can operate, secure, improve and provide the Services — including showing an application to the Employer you applied to, and showing a discoverable profile to Employers when you have turned that on. This licence ends when you delete the content or your account, except for copies we must keep for legal, security or backup reasons, and except for content already sent to an Employer at your request.",
        },
        {
          type: "p",
          text: "If you send us feedback or suggestions, you grant us a perpetual, irrevocable licence to use that feedback to improve the Services, without any obligation to pay you or to implement it.",
        },
      ],
    },
    {
      id: "ip",
      title: "Our intellectual property",
      blocks: [
        {
          type: "p",
          text: "The Services, our branding, and Content other than User Content and third-party listings are owned by us or our licensors. We grant you a personal, revocable, non-transferable licence to use the Services for your own job search or recruitment. You may not copy, sell, lease or create derivative works from our Content except as these Terms allow or as law permits. Aggregated Listings remain subject to the source publisher’s rights.",
        },
      ],
    },
    {
      id: "ai",
      title: "AI-assisted features and matching",
      blocks: [
        {
          type: "p",
          text: "Some features use automated processing. Résumé import may send the text of a file you upload to a model provider (currently Google Gemini) to extract structured profile fields. Job matching may rank roles or candidates using the details held on an account.",
        },
        {
          type: "p",
          text: "AI output and match scores can be wrong, incomplete or out of date. They are general tools, not professional, legal, migration or career advice. Review anything extracted from a résumé before you save or submit it. Do not include payment-card numbers, government identity numbers, or health information in a résumé unless you choose to and a form specifically asks for it.",
        },
        {
          type: "p",
          text: "Employers and job boards may use their own screening or automation detection. We do not guarantee that an application will be received, read, or successful.",
        },
      ],
    },
    {
      id: "third-parties",
      title: "Third-party services",
      blocks: [
        {
          type: "p",
          text: "The Services rely on or link to third parties, including job publishers, Google (sign-in and AI processing), LinkedIn (if you import a profile), and file-hosting providers. Those services have their own terms. We do not control their availability, ranking, or privacy practices. If you connect an account, you confirm you have the right to do so and you authorise us to use the access token only to perform the import or action you requested. We may delete tokens that are unused, compromised, or no longer needed.",
        },
        {
          type: "p",
          text: "We are not liable for a third party suspending, rejecting or altering a listing, application or connected account, except to the extent a non-excludable law says otherwise.",
        },
      ],
    },
    {
      id: "security",
      title: "Security and beta features",
      blocks: [
        {
          type: "p",
          text: "We use reasonable technical and organisational safeguards, including access controls and encrypted connections where appropriate. No online service is perfectly secure. Features marked as new, preview or experimental may change or be withdrawn.",
        },
      ],
    },
    {
      id: "not-an-agency",
      title: "Not an employment agency; no guarantees",
      blocks: [
        {
          type: "p",
          text: "Gemini Jobs is software that aggregates listings and provides career tools. We are not an employment agency or labour-hire business. We do not employ you, supply you as a worker, negotiate your pay or conditions, or enter an employment contract on your behalf. A listing, match, introduction or message is not an offer of employment.",
        },
        {
          type: "p",
          text: "We do not guarantee interviews, offers, response times, visa sponsorship, salary figures, or that any listing is genuine. Employment decisions are made by Employers, not by us.",
        },
      ],
    },
    {
      id: "warranties",
      title: "Consumer guarantees and warranties",
      blocks: [
        {
          type: "p",
          text: "To the maximum extent permitted by law, the Services are provided “as is” and “as available”. We do not warrant that listings are complete, that the Services will be uninterrupted, or that AI extracts will be accurate.",
        },
        {
          type: "p",
          text: "Nothing in these Terms excludes, restricts or modifies any consumer guarantee, right or remedy under the Australian Consumer Law or any other law that cannot be excluded. If we supply services to a consumer and a guarantee is not met, you may be entitled to a remedy. Where the law allows us to limit that liability, and the services are not of a kind ordinarily acquired for personal, domestic or household use, our liability is limited to resupplying the services or paying the cost of resupply.",
        },
      ],
    },
    {
      id: "liability",
      title: "Limitation of liability",
      blocks: [
        {
          type: "p",
          text: "Subject to the consumer-guarantee section above, we are not liable for indirect, incidental, special or consequential loss, or for loss of profits, revenue, goodwill, data or opportunity, whether in contract, tort (including negligence) or otherwise, even if foreseeable.",
        },
        {
          type: "p",
          text: "Subject to non-excludable rights, our total aggregate liability for direct loss arising out of the Services is limited to the greater of AUD $100 or the fees you paid us for Paid Services in the six months before the event giving rise to the claim.",
        },
        {
          type: "p",
          text: "Nothing in these Terms limits liability that cannot legally be limited, including liability for fraud, or for death or personal injury caused by negligence where such a limit is prohibited.",
        },
      ],
    },
    {
      id: "indemnity",
      title: "Indemnity",
      blocks: [
        {
          type: "p",
          text: "You will indemnify us against reasonable losses, damages and legal costs arising from your User Content, your breach of these Terms, a listing or application you submit that is unlawful or misleading, or your misuse of candidate or Employer information. We will give you notice of a claim, and this indemnity does not apply to the extent the loss was caused by our breach, negligence or fraud. Consumer rights that cannot be waived are unaffected.",
        },
      ],
    },
    {
      id: "termination",
      title: "Suspension and termination",
      blocks: [
        {
          type: "p",
          text: "You may stop using the Services and delete your account at any time from your settings, or by emailing us. We may suspend or close access if you breach these Terms, if we must do so for security or legal reasons, if fees for a Paid Service are unpaid, or if we discontinue a feature. Sections that by their nature should survive — including intellectual property, disclaimers, liability, indemnity and governing law — continue after termination.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes",
      blocks: [
        {
          type: "p",
          text: "We may update these Terms. If a change is material, we will post the new version on the website and, where we have your email, give at least 14 days’ notice before it takes effect, unless a shorter period is required for security or by law. If you keep using the Services after the effective date, you accept the updated Terms. If you do not agree, stop using the Services and delete your account.",
        },
        {
          type: "p",
          text: "We may add, change or remove features. If we materially reduce a Paid Service you have already paid for, we will give reasonable notice and a pro-rata refund of unused prepaid fees if you cancel before the change takes effect, in addition to any rights you have under the Australian Consumer Law.",
        },
      ],
    },
    {
      id: "general",
      title: "General",
      blocks: [
        {
          type: "p",
          text: "These Terms are governed by the laws of Australia. You and we submit to the non-exclusive jurisdiction of the courts of Australia, so that mandatory consumer venue rights are preserved. If you are a consumer, you may also have the right to bring a claim in your local court or tribunal.",
        },
        {
          type: "p",
          text: "We may assign these Terms to an affiliate or to a successor of the business. You may not assign your account without our consent. If a provision is unenforceable, the rest remain in force. A failure to enforce a right is not a waiver. These Terms and the Privacy Policy are the entire agreement about the Services and replace earlier website terms. Headings are for convenience only.",
        },
        {
          type: "p",
          text: "Neither party is liable for delay or failure caused by events beyond reasonable control, including outages, cyberattacks, labour disputes, government action, or a third-party job source changing or withdrawing its feed.",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact",
      blocks: [
        {
          type: "p",
          text: `Questions about these Terms: ${email}. Privacy questions can be sent to the same address. Please include “Privacy” in the subject line.`,
        },
      ],
    },
  ],
};

export const PRIVACY_POLICY: LegalDocument = {
  kind: "privacy",
  title: "Privacy & Cookie Policy",
  shortTitle: "Privacy",
  summary:
    "This Policy explains how Gemini Jobs collects, uses and shares personal information when you search jobs, build a profile, apply, hire, or email us. It is written for a job aggregator operating in Australia.",
  sections: [
    {
      id: "who-we-are",
      title: "Who we are",
      blocks: [
        {
          type: "p",
          text: `Gemini Jobs (${site}) is the organisation that collects and handles personal information described in this Policy. We operate from Australia as a job aggregator and career platform.`,
        },
        {
          type: "p",
          text: `Privacy contact: ${email}. Put “Privacy” in the subject line so we can route your request. You can also use that address for access, correction and complaint requests.`,
        },
      ],
    },
    {
      id: "scope",
      title: "What this Policy covers",
      blocks: [
        {
          type: "p",
          text: "This Policy covers personal information we process through the Gemini Jobs website and applications, including:",
        },
        {
          type: "list",
          items: [
            "job search and aggregated listings,",
            "job seeker profiles, résumés and applications,",
            "employer and recruiter accounts, job posts and candidate review,",
            "optional LinkedIn import, Google sign-in, and AI-assisted résumé parsing,",
            "learning, events, verification requests and the newsletter,",
            "support emails and technical logs.",
          ],
        },
        {
          type: "p",
          text: "It does not cover third-party sites you open from an Aggregated Listing, or an Employer’s own handling of an application after we have delivered it. Those organisations are responsible for their own privacy practices.",
        },
      ],
    },
    {
      id: "collect",
      title: "Information we collect",
      blocks: [
        {
          type: "p",
          text: "Depending on how you use Gemini Jobs, we may collect:",
        },
        {
          type: "list",
          items: [
            "Account and contact details: name, email, phone, password hash or Google account identifier, role (job seeker, recruiter or admin), and notification preferences.",
            "Profile and job-search materials: headline, location, skills, experience, education, work preferences, résumé files, photo, portfolio and LinkedIn URL, and fields extracted from a résumé or LinkedIn import that you choose to save.",
            "Application and hiring data: roles you save or apply for, messages and interview requests, Employer company profiles, job posts, and team-member invites.",
            "Verification evidence you submit for an optional check, and the status of that check.",
            "Newsletter and marketing preferences, including whether you joined the footer list or turned marketing email on.",
            "Technical data: IP address, device and browser type, cookie identifiers, and logs needed to keep the site secure and to understand which features fail.",
          ],
        },
        {
          type: "p",
          text: "Please do not include sensitive information — such as health, biometric, racial or ethnic information, or government identity numbers — in your profile, résumé or application unless a form specifically asks for it and you choose to provide it. Job advertisements sometimes ask for right-to-work information. If you provide that, we pass it on only as part of the application you submit.",
        },
        {
          type: "p",
          text: "Aggregated Listings are published vacancies. We display them so you can search. We do not treat the text of a public job advertisement as your personal information.",
        },
      ],
    },
    {
      id: "how",
      title: "How we collect it",
      blocks: [
        {
          type: "list",
          items: [
            "Directly from you, when you register, edit a profile, upload a file, apply, post a job, join the newsletter, or email support.",
            "From Google, if you choose Google sign-in. We receive your name, verified email and a Google account identifier. We do not receive your Google password.",
            "From LinkedIn, if you start an import and approve access. We use that access only to pre-fill profile fields for you to review. We do not post to LinkedIn on your behalf.",
            "From Employers, when they post a role or record an application or interview on the platform.",
            "Automatically, through cookies and server logs when you use the site.",
            "From job-data publishers, as listing content rather than as a file about you.",
          ],
        },
      ],
    },
    {
      id: "use",
      title: "How we use information",
      blocks: [
        {
          type: "p",
          text: "We use personal information to:",
        },
        {
          type: "list",
          items: [
            "create and secure your account, and authenticate you;",
            "show, search, filter and rank job listings, including Aggregated Listings;",
            "generate match suggestions from profile fields you have saved, such as skills, titles, location and preferences;",
            "deliver applications you submit to the Employer who posted the role;",
            "let Employers manage jobs, candidates and interviews they are running on Gemini Jobs;",
            "parse a résumé or imported profile when you ask us to, and show you the extracted fields before you rely on them;",
            "operate optional verification, learning and event features;",
            "send service messages you have asked for or that we need to send to provide the Services;",
            "send marketing only where you have opted in, or where the Spam Act allows, and honour unsubscribes;",
            "detect abuse, fake jobs, fake accounts and security incidents;",
            "fix errors, understand aggregate feature usage, and improve reliability; and",
            "meet legal, tax and regulatory duties.",
          ],
        },
        {
          type: "p",
          text: "We do not sell personal information. We do not use your résumé, applications or profile to train a public AI model. Where a model provider processes a résumé to extract fields, we send only what is needed for that request.",
        },
      ],
    },
    {
      id: "matching",
      title: "Matching and automated ranking",
      blocks: [
        {
          type: "p",
          text: "Search and “suggested role” features compare saved profile details with available jobs and order the results. Similar tools may help an Employer see candidates who opted into discovery. This is automated ranking to organise a search. It does not decide whether you are offered a job, and it does not submit applications for you.",
        },
        {
          type: "p",
          text: "You can change or delete profile fields, turn discovery off, and choose which roles to apply for. If you believe a match is irrelevant, update your skills, location and preferences — that is the information the ranking uses.",
        },
      ],
    },
    {
      id: "ai",
      title: "AI processing",
      blocks: [
        {
          type: "p",
          text: "If you upload a résumé for parsing, we send the document content to our model provider (currently Google Gemini) to return structured suggestions such as job titles, skills and education. You should review and edit those suggestions before saving them. We store the résumé and the fields you keep so we can show them in your account and, if you apply or turn on discovery, share the relevant profile with Employers as described in this Policy.",
        },
        {
          type: "p",
          text: "We do not record interviews, keep raw audio, or run a live interview-coaching product. Interview tools on Gemini Jobs are for scheduling and status between a job seeker and an Employer.",
        },
      ],
    },
    {
      id: "applications",
      title: "Applications and external listings",
      blocks: [
        {
          type: "p",
          text: "When you apply to a role posted on Gemini Jobs, we transmit the application you submitted — typically your name, contact details, résumé and answers — to that Employer. From that point the Employer handles the information for their recruitment. We do not redact fields for you.",
        },
        {
          type: "p",
          text: "When you follow an Aggregated Listing to another site, that site collects whatever you choose to enter there. We may log that you opened the listing so we can show your history and measure which listings are used. We do not receive a copy of an application you complete only on the other site unless that publisher sends it to us, which our current integration does not do.",
        },
      ],
    },
    {
      id: "marketing",
      title: "Marketing",
      blocks: [
        {
          type: "p",
          text: "The footer newsletter and the marketing-email setting are separate from service notifications such as application updates. We record that you subscribed, the address you gave, and when you unsubscribe. You can unsubscribe in the message itself or by emailing us. We do not use profile matching to send marketing unless you have already opted in, and opting out of marketing does not change your access to job search.",
        },
        {
          type: "p",
          text: "We do not upload your email to advertising audience-matching products. If we start a campaign that requires that, we will ask for consent and update this Policy first.",
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies and similar technologies",
      blocks: [
        {
          type: "p",
          text: "We use cookies and local storage that are needed to run the Services, and a small number of preference cookies:",
        },
        {
          type: "list",
          items: [
            "Sign-in cookie, so you stay logged in.",
            "Short-lived cookies for Google or LinkedIn sign-in and import, so we can complete the redirect securely.",
            "Theme and interface preferences, stored in a cookie or in your browser.",
            "A short-lived cookie used while a résumé discovery flow is in progress.",
          ],
        },
        {
          type: "p",
          text: "We do not set third-party advertising cookies. You can block cookies in your browser. If you block the sign-in cookie, you will need to log in again and some features will not work. Because we do not use non-essential advertising cookies, we do not show a marketing cookie banner.",
        },
      ],
    },
    {
      id: "sharing",
      title: "Who we share information with",
      blocks: [
        {
          type: "p",
          text: "We share personal information only as needed for the purposes above:",
        },
        {
          type: "list",
          items: [
            "Employers and recruiters on Gemini Jobs, when you apply to their role or when you have made your profile discoverable. They handle that information as a separate organisation for their hiring process.",
            "Service providers who process data on our instructions: Google (authentication and Gemini résumé parsing), Cloudinary (résumé and image hosting), and our database and hosting providers. They may only use the information to provide services to us.",
            "Job-data publishers, to the extent a click or search request is sent to retrieve a public listing. We do not send your résumé to those publishers as part of search.",
            "LinkedIn, only if you choose to connect and only for the import you start.",
            "Professional advisers, insurers, or a buyer of the business, under confidentiality, if we restructure or sell the platform.",
            "Authorities, where required by law or where we reasonably believe it is necessary to prevent fraud, protect someone’s safety, or respond to a lawful request.",
          ],
        },
      ],
    },
    {
      id: "overseas",
      title: "Overseas disclosure",
      blocks: [
        {
          type: "p",
          text: "We operate from Australia. Some providers we use store or access information outside Australia. In particular, Google (sign-in and Gemini) and Cloudinary may process information in the United States or other countries where they operate, and job publishers may host listing requests in the country where that service runs. Those countries may not have privacy laws identical to the Australian Privacy Principles.",
        },
        {
          type: "p",
          text: "Before we disclose personal information overseas we take reasonable steps to require the recipient to handle it in a way that is consistent with this Policy and with Australian Privacy Principle 8, including contract terms that limit use to the service we asked for. By creating an account or uploading a résumé for parsing, you acknowledge that this overseas processing is part of providing those features.",
        },
      ],
    },
    {
      id: "retention",
      title: "How long we keep information",
      blocks: [
        {
          type: "list",
          items: [
            "Account and profile data: for as long as your account is open, then deleted or de-identified within a reasonable period after you close it, unless we must keep a record.",
            "Applications already sent to an Employer: the Employer’s copy is theirs. Our copy is deleted with the account, or earlier if you delete the application and we are not required to retain it.",
            "Résumé files and photos: until you delete them or close your account. Backups are overwritten or purged on a rolling basis, usually within 30 days of deletion from the live system.",
            "Newsletter records: until you unsubscribe, then we keep a suppression record so we do not email you again.",
            "Security and error logs: generally up to 24 months.",
            "Verification files: for the life of the check and a limited period afterwards so we can respond to a dispute, then deleted.",
          ],
        },
      ],
    },
    {
      id: "rights",
      title: "Access, correction and complaints",
      blocks: [
        {
          type: "p",
          text: `You can review and edit most profile information in your account. You may ask us for access to other personal information we hold about you, or ask us to correct it, by emailing ${email}. We will respond within a reasonable period, usually 30 days. We may refuse access where the Privacy Act 1988 (Cth) allows us to — for example where giving access would unreasonably affect someone else’s privacy — and we will tell you why, unless the law says we should not.`,
        },
        {
          type: "p",
          text: "You may ask us to delete your account. We will delete or de-identify personal information we no longer need, subject to records we must keep by law and copies already provided to an Employer at your request.",
        },
        {
          type: "p",
          text: "If you are unhappy with how we handled your information, email us first and we will try to resolve it. If you are not satisfied, you can complain to the Office of the Australian Information Commissioner (OAIC) at oaic.gov.au. We will not charge you for making a request or a complaint. We may charge a reasonable fee if an access request is unusually large, and we will tell you before we do.",
        },
      ],
    },
    {
      id: "security",
      title: "Security",
      blocks: [
        {
          type: "p",
          text: "We use reasonable safeguards: access controls, password hashing, encrypted transport, and hosting restrictions. Staff and providers only access account data when they need to in order to operate or support the Services. You should use a unique password and tell us if you suspect unauthorised access. We cannot guarantee that transmission or storage will be uninterrupted or error-free.",
        },
      ],
    },
    {
      id: "children",
      title: "Children",
      blocks: [
        {
          type: "p",
          text: `The Services are not directed at children under 16. We do not knowingly collect personal information from a child under 16. If you believe we have, email ${email} and we will delete it.`,
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to this Policy",
      blocks: [
        {
          type: "p",
          text: "We will post updates on this page. If a change is material — for example a new kind of disclosure or a new use of résumé data — we will also provide a notice on the website or by email before it takes effect, and we will seek consent where the law requires it.",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact",
      blocks: [
        {
          type: "p",
          text: `Gemini Jobs — ${site}. Privacy and access requests: ${email}.`,
        },
      ],
    },
  ],
};

export const LEGAL_DOCUMENTS = {
  terms: TERMS_OF_SERVICE,
  privacy: PRIVACY_POLICY,
} as const;
