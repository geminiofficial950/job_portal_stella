export const INDUSTRIES = [
  "Aged Care",
  "Disability Support",
  "Healthcare & Medical",
  "Community Services",
  "Education & Training",
  "Information Technology",
  "Construction",
  "Hospitality & Tourism",
  "Accounting & Finance",
  "Retail & Consumer",
  "Engineering",
  "Government & Defence",
  "Mining & Resources",
  "Transport & Logistics",
  "Sales & Marketing",
  "Legal",
  "Administration",
  "Manufacturing",
  "Agriculture",
  "Professional Services",
];

export const LOCATIONS = [
  {
    group: "Australia",
    options: [
      "Sydney, NSW",
      "Melbourne, VIC",
      "Brisbane, QLD",
      "Perth, WA",
      "Adelaide, SA",
      "Canberra, ACT",
      "Hobart, TAS",
      "Darwin, NT",
      "Gold Coast, QLD",
      "Newcastle, NSW",
      "Remote, Australia",
    ],
  },
  {
    group: "USA",
    options: [
      "New York, NY",
      "Los Angeles, CA",
      "Chicago, IL",
      "San Francisco, CA",
      "Seattle, WA",
      "Austin, TX",
      "Boston, MA",
      "Remote, USA",
    ],
  },
  {
    group: "UK",
    options: ["London", "Manchester", "Birmingham", "Edinburgh", "Glasgow", "Remote, UK"],
  },
  {
    group: "New Zealand",
    options: ["Auckland", "Wellington", "Christchurch", "Remote, New Zealand"],
  },
  {
    group: "Canada",
    options: [
      "Toronto, ON",
      "Vancouver, BC",
      "Montreal, QC",
      "Calgary, AB",
      "Ottawa, ON",
      "Remote, Canada",
    ],
  },
  {
    group: "Singapore",
    options: ["Singapore", "Remote, Singapore"],
  },
];

export function withCurrentOption(options: string[], current: string) {
  const value = current.trim();
  if (value && !options.includes(value)) return [value, ...options];
  return options;
}
