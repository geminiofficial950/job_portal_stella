/**
 * Australian location suggestions for job search (Seek-style labels).
 * Includes metro "All …" entries plus common suburbs with postcodes.
 */

export type AuLocation = {
  /** Display label, e.g. "All Sydney NSW" or "Adelaide SA 5000" */
  label: string;
  /** Tokens used for typeahead matching */
  tokens: string[];
};

function loc(label: string, extra: string[] = []): AuLocation {
  const tokens = [
    label.toLowerCase(),
    ...extra.map((t) => t.toLowerCase()),
    ...label.toLowerCase().split(/[\s,&/]+/).filter(Boolean),
  ];
  return { label, tokens: [...new Set(tokens)] };
}

/** Major metros first — match Seek "All City STATE" pattern. */
const METROS: AuLocation[] = [
  loc("All Sydney NSW", ["sydney", "nsw"]),
  loc("All Melbourne VIC", ["melbourne", "vic", "victoria"]),
  loc("All Brisbane QLD", ["brisbane", "qld", "queensland"]),
  loc("All Perth WA", ["perth", "wa"]),
  loc("All Adelaide SA", ["adelaide", "sa"]),
  loc("All Canberra ACT", ["canberra", "act"]),
  loc("All Gold Coast QLD", ["gold coast", "qld"]),
  loc("All Newcastle NSW", ["newcastle", "nsw"]),
  loc("All Wollongong NSW", ["wollongong", "nsw"]),
  loc("All Hobart TAS", ["hobart", "tas", "tasmania"]),
  loc("All Darwin NT", ["darwin", "nt"]),
  loc("All Geelong VIC", ["geelong", "vic"]),
  loc("All Sunshine Coast QLD", ["sunshine coast", "qld"]),
  loc("All Townsville QLD", ["townsville", "qld"]),
  loc("All Cairns QLD", ["cairns", "qld"]),
];

/** Suburb / city + state + postcode style entries. */
const SUBURBS: AuLocation[] = [
  // Sydney
  loc("Sydney NSW 2000", ["sydney", "cbd"]),
  loc("Parramatta NSW 2150", ["parramatta"]),
  loc("Chatswood NSW 2067", ["chatswood"]),
  loc("North Sydney NSW 2060", ["north sydney"]),
  loc("Bondi NSW 2026", ["bondi"]),
  loc("Bondi Junction NSW 2022", ["bondi junction"]),
  loc("Surry Hills NSW 2010", ["surry hills"]),
  loc("Pyrmont NSW 2009", ["pyrmont"]),
  loc("Newtown NSW 2042", ["newtown"]),
  loc("Manly NSW 2095", ["manly"]),
  loc("Hornsby NSW 2077", ["hornsby"]),
  loc("Penrith NSW 2750", ["penrith"]),
  loc("Liverpool NSW 2170", ["liverpool"]),
  loc("Blacktown NSW 2148", ["blacktown"]),
  loc("Ryde NSW 2112", ["ryde"]),
  loc("Macquarie Park NSW 2113", ["macquarie park"]),
  loc("Barangaroo NSW 2000", ["barangaroo"]),
  loc("Circular Quay NSW 2000", ["circular quay"]),
  loc("Mascot NSW 2020", ["mascot"]),
  loc("Alexandria NSW 2015", ["alexandria"]),
  loc("Redfern NSW 2016", ["redfern"]),
  loc("Ultimo NSW 2007", ["ultimo"]),
  loc("Haymarket NSW 2000", ["haymarket"]),
  loc("Darlinghurst NSW 2010", ["darlinghurst"]),
  loc("Paddington NSW 2021", ["paddington"]),
  loc("Randwick NSW 2031", ["randwick"]),
  loc("Cronulla NSW 2230", ["cronulla"]),
  loc("Hurstville NSW 2220", ["hurstville"]),
  loc("Bankstown NSW 2200", ["bankstown"]),
  loc("Castle Hill NSW 2154", ["castle hill"]),

  // Melbourne
  loc("Melbourne VIC 3000", ["melbourne", "cbd"]),
  loc("Southbank VIC 3006", ["southbank"]),
  loc("Docklands VIC 3008", ["docklands"]),
  loc("Richmond VIC 3121", ["richmond"]),
  loc("South Yarra VIC 3141", ["south yarra"]),
  loc("St Kilda VIC 3182", ["st kilda", "saint kilda"]),
  loc("Carlton VIC 3053", ["carlton"]),
  loc("Fitzroy VIC 3065", ["fitzroy"]),
  loc("Collingwood VIC 3066", ["collingwood"]),
  loc("Brunswick VIC 3056", ["brunswick"]),
  loc("Footscray VIC 3011", ["footscray"]),
  loc("Box Hill VIC 3128", ["box hill"]),
  loc("Dandenong VIC 3175", ["dandenong"]),
  loc("Frankston VIC 3199", ["frankston"]),
  loc("Ringwood VIC 3134", ["ringwood"]),
  loc("Glen Waverley VIC 3150", ["glen waverley"]),
  loc("Hawthorn VIC 3122", ["hawthorn"]),
  loc("Prahran VIC 3181", ["prahran"]),
  loc("Port Melbourne VIC 3207", ["port melbourne"]),
  loc("Sunshine VIC 3020", ["sunshine"]),
  loc("Werribee VIC 3030", ["werribee"]),
  loc("Geelong VIC 3220", ["geelong"]),

  // Brisbane
  loc("Brisbane QLD 4000", ["brisbane", "cbd"]),
  loc("Fortitude Valley QLD 4006", ["fortitude valley", "the valley"]),
  loc("South Brisbane QLD 4101", ["south brisbane"]),
  loc("West End QLD 4101", ["west end"]),
  loc("Newstead QLD 4006", ["newstead"]),
  loc("Chermside QLD 4032", ["chermside"]),
  loc("Indooroopilly QLD 4068", ["indooroopilly"]),
  loc("Toowong QLD 4066", ["toowong"]),
  loc("Sunnybank QLD 4109", ["sunnybank"]),
  loc("Logan Central QLD 4114", ["logan"]),
  loc("Ipswich QLD 4305", ["ipswich"]),
  loc("Cleveland QLD 4163", ["cleveland"]),
  loc("Capalaba QLD 4157", ["capalaba"]),
  loc("North Lakes QLD 4509", ["north lakes"]),
  loc("Springfield QLD 4300", ["springfield"]),

  // Perth
  loc("Perth WA 6000", ["perth", "cbd"]),
  loc("East Perth WA 6004", ["east perth"]),
  loc("West Perth WA 6005", ["west perth"]),
  loc("Northbridge WA 6003", ["northbridge"]),
  loc("Fremantle WA 6160", ["fremantle"]),
  loc("Subiaco WA 6008", ["subiaco"]),
  loc("Joondalup WA 6027", ["joondalup"]),
  loc("Mandurah WA 6210", ["mandurah"]),
  loc("Rockingham WA 6168", ["rockingham"]),
  loc("Midland WA 6056", ["midland"]),
  loc("Cannington WA 6107", ["cannington"]),
  loc("Morley WA 6062", ["morley"]),

  // Adelaide
  loc("Adelaide SA 5000", ["adelaide", "cbd"]),
  loc("North Adelaide SA 5006", ["north adelaide"]),
  loc("Glenelg SA 5045", ["glenelg"]),
  loc("Norwood SA 5067", ["norwood"]),
  loc("Unley SA 5061", ["unley"]),
  loc("Prospect SA 5082", ["prospect"]),
  loc("Mawson Lakes SA 5095", ["mawson lakes"]),
  loc("Elizabeth SA 5112", ["elizabeth"]),
  loc("Marion SA 5043", ["marion"]),
  loc("Port Adelaide SA 5015", ["port adelaide"]),

  // Canberra / Hobart / Darwin / Gold Coast / others
  loc("Canberra ACT 2600", ["canberra", "cbd"]),
  loc("Belconnen ACT 2617", ["belconnen"]),
  loc("Woden ACT 2606", ["woden"]),
  loc("Tuggeranong ACT 2900", ["tuggeranong"]),
  loc("Gungahlin ACT 2912", ["gungahlin"]),
  loc("Hobart TAS 7000", ["hobart"]),
  loc("Launceston TAS 7250", ["launceston"]),
  loc("Darwin NT 0800", ["darwin"]),
  loc("Palmerston NT 0830", ["palmerston"]),
  loc("Southport QLD 4215", ["southport"]),
  loc("Surfers Paradise QLD 4217", ["surfers paradise"]),
  loc("Broadbeach QLD 4218", ["broadbeach"]),
  loc("Robina QLD 4226", ["robina"]),
  loc("Coolangatta QLD 4225", ["coolangatta"]),
  loc("Maroochydore QLD 4558", ["maroochydore"]),
  loc("Caloundra QLD 4551", ["caloundra"]),
  loc("Noosa Heads QLD 4567", ["noosa"]),
  loc("Newcastle NSW 2300", ["newcastle"]),
  loc("Wollongong NSW 2500", ["wollongong"]),
  loc("Central Coast NSW 2250", ["central coast", "gosford"]),
  loc("Gosford NSW 2250", ["gosford"]),
  loc("Townsville QLD 4810", ["townsville"]),
  loc("Cairns QLD 4870", ["cairns"]),
  loc("Toowoomba QLD 4350", ["toowoomba"]),
  loc("Ballarat VIC 3350", ["ballarat"]),
  loc("Bendigo VIC 3550", ["bendigo"]),
  loc("Albury NSW 2640", ["albury"]),
  loc("Wagga Wagga NSW 2650", ["wagga"]),
  loc("Orange NSW 2800", ["orange"]),
  loc("Dubbo NSW 2830", ["dubbo"]),
  loc("Tamworth NSW 2340", ["tamworth"]),
  loc("Bunbury WA 6230", ["bunbury"]),
  loc("Alice Springs NT 0870", ["alice springs"]),
];

export const AU_LOCATIONS: AuLocation[] = [...METROS, ...SUBURBS];

/** Value sent to job search APIs (strip Seek-style "All " + postcodes). */
export function locationSearchValue(label: string) {
  return label
    .replace(/^All\s+/i, "")
    .replace(/\b\d{4}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const AU_STATE_TOKENS = new Set([
  "nsw",
  "vic",
  "qld",
  "sa",
  "wa",
  "tas",
  "act",
  "nt",
  "victoria",
  "queensland",
  "tasmania",
]);

const LOCATION_NOISE = new Set([
  "all",
  "australia",
  "australian",
  "remote",
  "hybrid",
  "onsite",
  "on-site",
]);

function isGenericRemoteLocation(hay: string) {
  const t = hay.replace(/\s+/g, " ").trim();
  if (!t) return true;
  if (
    /^(remote|work from home|wfh|anywhere)([\s,/-]*(australia|au|only))?$/i.test(
      t,
    )
  ) {
    return true;
  }
  if (/^remote([\s,/-]+australia)?$/i.test(t)) return true;
  if (t === "australia" || t === "au") return true;
  return false;
}

/**
 * Whether a job's location string is relevant to the user's location query.
 * Rejects bare "Remote Australia" style hits when a city was searched.
 */
export function jobMatchesLocationQuery(
  jobLocation: string,
  query: string,
): boolean {
  const cleaned = locationSearchValue(query).toLowerCase();
  if (!cleaned) return true;

  const hay = String(jobLocation || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  if (!hay) return false;
  if (hay.includes(cleaned)) return true;

  const tokens = cleaned
    .split(/[\s,/|+-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !LOCATION_NOISE.has(t));

  const placeTokens = tokens.filter((t) => !AU_STATE_TOKENS.has(t));
  const stateTokens = tokens.filter((t) => AU_STATE_TOKENS.has(t));

  if (placeTokens.length >= 2) {
    const phrase = placeTokens.join(" ");
    if (hay.includes(phrase)) return true;
  }

  if (placeTokens.some((t) => hay.includes(t))) return true;

  // User asked for a city — don't keep country-wide remote listings.
  if (placeTokens.length > 0 && isGenericRemoteLocation(hay)) {
    return false;
  }

  // Same state (e.g. Parramatta NSW when searching Sydney NSW), but not bare remote.
  if (
    stateTokens.some((t) => hay.includes(t)) &&
    !isGenericRemoteLocation(hay)
  ) {
    return true;
  }

  return tokens.some((t) => hay.includes(t));
}

/**
 * Ranked typeahead matches for a typed query.
 * Digits match postcodes preferentially. Empty query → no suggestions.
 */
export function suggestAuLocations(query: string, limit = 8): AuLocation[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const isPostcode = /^\d{2,4}$/.test(q);
  const scored: { loc: AuLocation; score: number }[] = [];

  for (const item of AU_LOCATIONS) {
    let score = 0;
    const label = item.label.toLowerCase();

    if (label === q) score = 1000;
    else if (label.startsWith(q)) score = 800;
    else if (label.includes(q)) score = 500;

    for (const token of item.tokens) {
      if (token === q) score = Math.max(score, 900);
      else if (token.startsWith(q)) score = Math.max(score, 700);
      else if (token.includes(q)) score = Math.max(score, 400);
    }

    if (isPostcode && label.includes(q)) {
      score = Math.max(score, 950);
    }

    // Prefer metro "All …" when the query is a city name
    if (item.label.startsWith("All ") && score > 0) {
      score += 40;
    }

    if (score > 0) scored.push({ loc: item, score });
  }

  scored.sort(
    (a, b) =>
      b.score - a.score || a.loc.label.localeCompare(b.loc.label),
  );

  return scored.slice(0, limit).map((s) => s.loc);
}
