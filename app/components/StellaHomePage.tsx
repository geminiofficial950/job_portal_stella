"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import "../stella-jobs.css";

/* ── data ── */

const EMPLOYERS = [
  "Mercy Aged Care",
  "Ability First",
  "Baptcare Community",
  "Wyndham Health",
  "Southern Cross Care",
  "Ozcare Services",
  "Bendigo Regional Health",
  "Life Without Barriers",
  "Uniting Vic Tas",
  "Nurse Next Door",
];

const BAR_VALS = [34, 52, 41, 68, 88, 60, 94, 72, 46, 80, 58, 96];

type Lang = "en" | "hi" | "zh" | "vi" | "ar";

const LANG_LABELS: Record<Lang, string> = {
  en: "EN",
  hi: "हिन्दी",
  zh: "中文",
  vi: "Tiếng Việt",
  ar: "العربية",
};

const I18N: Record<
  Lang,
  {
    hours: string;
    searchbtn: string;
    conf: string;
    pathlab: string;
    pathh2: string;
    d1t: string;
    d1s: string;
    d2t: string;
    d2s: string;
    d3t: string;
    d3s: string;
  }
> = {
  en: {
    hours: "Lines open 7:00 to 21:00 AEST",
    searchbtn: "Search",
    conf: "Match confidence",
    pathlab: "Start here",
    pathh2: "Three ways in.",
    d1t: "I'm looking for work",
    d1s: "Build a profile that gets you called back",
    d2t: "I'm hiring",
    d2s: "We verify every candidate before you see them",
    d3t: "I'm new to Australia",
    d3s: "Work out what counts here and what to do first",
  },
  hi: {
    hours: "लाइनें खुली हैं 7:00 से 21:00 AEST",
    searchbtn: "खोजें",
    conf: "मेल की निश्चितता",
    pathlab: "यहाँ से शुरू करें",
    pathh2: "तीन रास्ते।",
    d1t: "मुझे काम चाहिए",
    d1s: "ऐसा प्रोफ़ाइल बनाएँ जिस पर कॉल आए",
    d2t: "मुझे कर्मचारी चाहिए",
    d2s: "हर उम्मीदवार की जाँच हम करते हैं",
    d3t: "मैं ऑस्ट्रेलिया में नया हूँ",
    d3s: "जानें यहाँ क्या मान्य है और पहले क्या करें",
  },
  zh: {
    hours: "服务时间 7:00 至 21:00 澳东时间",
    searchbtn: "搜索",
    conf: "匹配置信度",
    pathlab: "从这里开始",
    pathh2: "三个入口。",
    d1t: "我在找工作",
    d1s: "建立一份能收到回电的档案",
    d2t: "我要招聘",
    d2s: "我们先核实，再把人选交给您",
    d3t: "我刚到澳大利亚",
    d3s: "了解您的资历在这里如何认定",
  },
  vi: {
    hours: "Đường dây mở 7:00 đến 21:00 AEST",
    searchbtn: "Tìm kiếm",
    conf: "Độ tin cậy khớp",
    pathlab: "Bắt đầu tại đây",
    pathh2: "Ba lối vào.",
    d1t: "Tôi đang tìm việc",
    d1s: "Xây hồ sơ khiến nhà tuyển dụng gọi lại",
    d2t: "Tôi đang tuyển dụng",
    d2s: "Chúng tôi xác minh trước khi bạn xem hồ sơ",
    d3t: "Tôi mới đến Úc",
    d3s: "Biết bằng cấp của bạn được công nhận ra sao",
  },
  ar: {
    hours: "الخطوط مفتوحة من 7:00 حتى 21:00 بتوقيت شرق أستراليا",
    searchbtn: "ابحث",
    conf: "درجة التطابق",
    pathlab: "ابدأ من هنا",
    pathh2: "ثلاثة مداخل.",
    d1t: "أبحث عن عمل",
    d1s: "ابنِ ملفًا يجعلهم يتصلون بك",
    d2t: "أبحث عن موظفين",
    d2s: "نتحقق من كل مرشح قبل أن تراه",
    d3t: "أنا جديد في أستراليا",
    d3s: "اعرف كيف تُقيَّم مؤهلاتك هنا",
  },
};

type PathTab = "seek" | "hire" | "new";
type Region = "all" | "vic" | "nsw" | "qld" | "remote";

interface BoardRow {
  role: string;
  where: string;
  reg: string;
  pay: string;
  open: number;
  t: "" | "up" | "hot";
  tl: string;
  s: number[];
}

const BOARD_ROWS: BoardRow[] = [
  {
    role: "Personal care worker",
    where: "Melbourne West, VIC",
    reg: "vic",
    pay: "$34 to 38/hr",
    open: 412,
    t: "hot",
    tl: "+38%",
    s: [3, 4, 4, 6, 7, 9, 10],
  },
  {
    role: "Disability support worker",
    where: "Western Sydney, NSW",
    reg: "nsw",
    pay: "$36 to 41/hr",
    open: 361,
    t: "hot",
    tl: "+31%",
    s: [4, 4, 5, 6, 6, 8, 10],
  },
  {
    role: "Enrolled nurse",
    where: "Brisbane North, QLD",
    reg: "qld",
    pay: "$40 to 46/hr",
    open: 188,
    t: "up",
    tl: "+14%",
    s: [5, 5, 6, 6, 7, 7, 8],
  },
  {
    role: "Aged care cook",
    where: "Geelong, VIC",
    reg: "vic",
    pay: "$31 to 34/hr",
    open: 96,
    t: "up",
    tl: "+9%",
    s: [5, 6, 5, 6, 7, 7, 8],
  },
  {
    role: "Support coordinator",
    where: "Adelaide, SA",
    reg: "other",
    pay: "$78 to 88k",
    open: 74,
    t: "",
    tl: "+2%",
    s: [6, 6, 7, 6, 6, 7, 6],
  },
  {
    role: "Community services worker",
    where: "Newcastle, NSW",
    reg: "nsw",
    pay: "$33 to 37/hr",
    open: 68,
    t: "up",
    tl: "+11%",
    s: [4, 5, 5, 6, 7, 7, 8],
  },
  {
    role: "Remote admin support",
    where: "Offshore, IST",
    reg: "remote",
    pay: "Contract",
    open: 52,
    t: "up",
    tl: "+17%",
    s: [3, 4, 5, 5, 6, 8, 9],
  },
  {
    role: "Chef, regional venue",
    where: "Bendigo, VIC",
    reg: "vic",
    pay: "$70 to 80k",
    open: 44,
    t: "",
    tl: "0%",
    s: [6, 6, 6, 7, 6, 6, 6],
  },
];

const TICKER_ITEMS = [
  ["Priya N.", "reached Level 5 after a phone screen", "2 min ago"],
  ["Mercy Aged Care", "shortlisted 4 verified candidates", "6 min ago"],
  ["Daniel K.", "had 3 credentials verified at the source", "11 min ago"],
  ["Ability First", "filled 2 night shifts in Werribee", "18 min ago"],
  ["Rania S.", "completed a free newcomer consult in Arabic", "24 min ago"],
];

const PATH_CONTENT: Record<
  PathTab,
  {
    steps: { title: string; desc: string }[];
    human: {
      header: string;
      initials: string;
      name: string;
      role: string;
      rows: [string, string][];
      speaks: string[];
    };
  }
> = {
  seek: {
    steps: [
      {
        title: "Bring what you already have",
        desc: "Import LinkedIn, upload certificates, add overseas qualifications. Once, not ten times.",
      },
      {
        title: "Prove the parts that matter",
        desc: "Short assessments on job-relevant skills. Each one lifts your level and your ranking.",
      },
      {
        title: "Get a call, not an auto-reply",
        desc: "Reach Level 5 and a consultant rings you, in English or your first language.",
      },
      {
        title: "Go to employers pre-checked",
        desc: "Your clearances and screening note travel with you, so interviews start at the real questions.",
      },
    ],
    human: {
      header: "Seeker support line",
      initials: "AK",
      name: "Anjali Kaur",
      role: "Candidate consultant, Melbourne",
      rows: [
        ["Direct line", "1300 000 000"],
        ["Typical answer", "< 90 sec"],
        ["Callback", "Same day"],
      ],
      speaks: ["English", "हिन्दी", "ਪੰਜਾਬੀ", "Interpreter"],
    },
  },
  hire: {
    steps: [
      {
        title: "Post the role in five minutes",
        desc: "Or call your account manager and dictate it. Both work.",
      },
      {
        title: "Set your own bar",
        desc: "Choose the minimum level, clearances, and availability. Anything below it never reaches you.",
      },
      {
        title: "We verify the details for you",
        desc: "Identity, work rights, qualifications, and clearances checked at the source before a candidate reaches your shortlist.",
      },
      {
        title: "Read the note, not just the score",
        desc: "Every shortlisted candidate has been interviewed by phone and written up by a person you can ring.",
      },
      {
        title: "Fill the shift",
        desc: "Compliance evidence is attached before the first interview, so onboarding does not stall.",
      },
    ],
    human: {
      header: "Your account manager",
      initials: "MT",
      name: "Marcus Tan",
      role: "Dedicated employer manager",
      rows: [
        ["Direct mobile", "Yours, not a queue"],
        ["Knows your roster", "Every role you run"],
        ["Pipeline call", "Weekly, 15 min"],
      ],
      speaks: ["English", "中文", "Bahasa", "Interpreter"],
    },
  },
  new: {
    steps: [
      {
        title: "Find out what your qualification counts as",
        desc: "We map overseas study to the Australian framework and tell you plainly where the gap is.",
      },
      {
        title: "Understand your work rights",
        desc: "Visa conditions, hour limits, and what employers are allowed to ask. No jargon.",
      },
      {
        title: "Get the missing pieces",
        desc: "Police check, NDIS screening, first aid, whatever your target job actually requires.",
      },
      {
        title: "Talk to someone who has done it",
        desc: "A consultant who speaks your language walks through the first job, not the tenth.",
      },
    ],
    human: {
      header: "Newcomer support",
      initials: "RS",
      name: "Rania Salim",
      role: "Settlement and skills adviser",
      rows: [
        ["First consult", "Free, 30 min"],
        ["Walk-in centres", "Melbourne, Sydney"],
        ["Written summary", "In your language"],
      ],
      speaks: ["English", "العربية", "Tiếng Việt", "Interpreter"],
    },
  },
};

/* ── helpers ── */

function ArrowIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Reveal({
  children,
  className = "",
  ...rest
}: React.ComponentPropsWithoutRef<"div">) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in");
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`rv ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

function Spark({ vals, up }: { vals: number[]; up: boolean }) {
  return (
    <span className={`spark ${up ? "up" : ""}`}>
      {vals.map((v, i) => (
        <i key={i} style={{ height: `${v * 2}px` }} />
      ))}
    </span>
  );
}

function CountStat({
  target,
  suffix = "",
  text,
}: {
  target: number;
  suffix?: string;
  text?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(text ?? "0");

  useEffect(() => {
    if (text) {
      setDisplay(text);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        if (reduced) {
          setDisplay(`${target.toLocaleString()}${suffix}`);
          return;
        }

        const dur = 1300;
        const t0 = performance.now();

        const step = (ts: number) => {
          const p = Math.min((ts - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(`${Math.round(target * eased).toLocaleString()}${suffix}`);
          if (p < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix, text]);

  return (
    <b ref={ref} data-count={target} data-suffix={suffix}>
      {display}
    </b>
  );
}

/* ── main page ── */

export default function StellaHomePage() {
  const [progress, setProgress] = useState(0);
  const [activePath, setActivePath] = useState<PathTab>("seek");
  const [region, setRegion] = useState<Region>("all");
  const [lang, setLang] = useState<Lang>("en");
  const [jobQuery, setJobQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [barsAnimated, setBarsAnimated] = useState(false);
  const [ladderFill, setLadderFill] = useState(false);
  const [tickerOffset, setTickerOffset] = useState(0);
  const [tickerTransition, setTickerTransition] = useState(true);

  const barsRef = useRef<HTMLDivElement>(null);
  const ladderRef = useRef<HTMLDivElement>(null);
  const tickViewRef = useRef<HTMLDivElement>(null);

  const t = I18N[lang];

  const filteredRows =
    region === "all" ? BOARD_ROWS : BOARD_ROWS.filter((r) => r.reg === region);

  const boardNote =
    region === "all"
      ? "Showing all regions · figures illustrative"
      : `Showing ${region.toUpperCase()} · figures illustrative`;

  /* scroll progress */
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* bento bars animation */
  useEffect(() => {
    const el = barsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBarsAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ladder fill */
  useEffect(() => {
    const el = ladderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLadderFill(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* live ticker */
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const rowHeight = () => {
      const h = tickViewRef.current?.getBoundingClientRect().height;
      return h && h > 0 ? Math.round(h) : 52;
    };

    let idx = 0;
    const id = setInterval(() => {
      idx++;
      setTickerTransition(true);
      setTickerOffset(idx * rowHeight());

      if (idx >= TICKER_ITEMS.length) {
        setTimeout(() => {
          setTickerTransition(false);
          setTickerOffset(0);
          idx = 0;
        }, 620);
      }
    }, 3000);

    const onResize = () => {
      setTickerTransition(false);
      setTickerOffset(idx * rowHeight());
    };
    window.addEventListener("resize", onResize);

    return () => {
      clearInterval(id);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /* language dir */
  useEffect(() => {
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute(
      "lang",
      lang === "en" ? "en-AU" : lang,
    );
  }, [lang]);

  const selectPath = useCallback((tab: PathTab) => setActivePath(tab), []);

  const pathContent = PATH_CONTENT[activePath];

  const goToJobs = useCallback(() => {
    const params = new URLSearchParams();
    if (jobQuery.trim()) params.set("q", jobQuery.trim());
    if (locationQuery.trim()) params.set("location", locationQuery.trim());
    const qs = params.toString();
    window.location.href = `/jobs${qs ? `?${qs}` : ""}`;
  }, [jobQuery, locationQuery]);

  return (
    <div className="stella-home">
      <div id="prog" style={{ width: `${progress}%` }} />

      <main id="top">
        {/* hero */}
        <section className="hero hero-next">
          <div className="hero-floats" aria-hidden="true">
            <div className="hero-float hero-float--company">
              <strong>51–200</strong>
              <span>Company size</span>
            </div>

            <div className="hero-float hero-float--icon hero-float--slack">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#36C5F0"
                  d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z"
                />
                <path
                  fill="#36C5F0"
                  d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
                />
                <path
                  fill="#2EB67D"
                  d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z"
                />
                <path
                  fill="#2EB67D"
                  d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
                />
                <path
                  fill="#ECB22E"
                  d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z"
                />
                <path
                  fill="#ECB22E"
                  d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"
                />
                <path
                  fill="#E01E5A"
                  d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z"
                />
                <path
                  fill="#E01E5A"
                  d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.528 2.528 0 0 1 2.52-2.52h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
                />
              </svg>
            </div>

            <div className="hero-float hero-float--icon hero-float--plant">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 22V12"
                  stroke="#16a34a"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path d="M12 12C12 6 18 4 20 4c0 4-2 8-8 8z" fill="#22c55e" />
                <path d="M12 14C12 8 6 6 4 6c0 4 2 8 8 8z" fill="#4ade80" />
                <rect x="9" y="20" width="6" height="2" rx="1" fill="#92400e" />
              </svg>
            </div>

            <div className="hero-float hero-float--mail">
              <div className="hero-float-mail-icon" aria-hidden="true">
                <span className="g">G</span>
              </div>
              <div>
                <p className="hero-float-mail-title">New message</p>
                <p className="hero-float-mail-copy">
                  You have 5 interviews ready
                </p>
              </div>
            </div>

            <div className="hero-float hero-float--icon hero-float--notion">
              <span>N</span>
            </div>
          </div>

          <div className="shell hero-next-in">
            <p className="hero-eyebrow">
              OVER 130K REMOTE &amp; LOCAL STARTUP JOBS
            </p>
            <h1 className="hero-next-title">Find what&apos;s next:</h1>

            <div className="hero-search-pill" role="search">
              <div className="hero-search-field">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  aria-label="Job title"
                  placeholder="Job title"
                  value={jobQuery}
                  onChange={(e) => setJobQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goToJobs();
                  }}
                />
              </div>
              <div className="hero-search-divider" />
              <div className="hero-search-field hero-search-field--loc">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <input
                  type="text"
                  aria-label="Location"
                  placeholder="Location"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goToJobs();
                  }}
                />
              </div>
              <button
                type="button"
                className="hero-search-btn"
                onClick={goToJobs}
              >
                Search
              </button>
            </div>
          </div>
        </section>

        {/* marquee */}
        <div className="marq" aria-label="Employers hiring on Stella">
          <div className="marq-t">
            {[...EMPLOYERS, ...EMPLOYERS].map((name, i) => (
              <span key={`${name}-${i}`}>
                <i aria-hidden="true" />
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* difference */}
        <section id="difference">
          <div className="shell">
            <Reveal className="diff-intro">
              <h2>Four things a job board cannot do.</h2>
              <p>
                Matching is the easy part. Everything around it is where hiring
                actually breaks.
              </p>
            </Reveal>

            <Reveal className="diff-panel">
              <article className="diff-cell diff-match">
                <div className="diff-cell-top">
                  <span className="diff-lab">Matching Engine</span>
                  <span className="diff-chip">98% Match Score</span>
                </div>
                <h3>Ranked with the reasoning shown.</h3>
                <p>
                  Every score comes with its evidence: which credential matched,
                  which shift pattern fits, and exactly what is missing. No black
                  box, no unexplained rejection.
                </p>
                <div className="diff-bars">
                  {[
                    { label: "Shift Pattern & Availability", val: "96%" },
                    { label: "Verified Credentials & Clearances", val: "94%" },
                    { label: "Role Capability & Skills Test", val: "88%" },
                  ].map((bar) => (
                    <div key={bar.label} className="diff-bar">
                      <div className="diff-bar-top">
                        <span>{bar.label}</span>
                        <b>{bar.val}</b>
                      </div>
                      <div className="diff-bar-track">
                        <i style={{ width: bar.val }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="diff-cell diff-verify">
                <div className="diff-cell-top">
                  <span className="diff-lab">Instant Verification</span>
                </div>
                <h3>We check, so you don&apos;t.</h3>
                <ul className="diff-checks">
                  {[
                    { label: "Identity matched", sub: "Passport & Driver License" },
                    { label: "Work rights via VEVO", sub: "Direct DHA Database Link" },
                    { label: "Qualification at source", sub: "University & TAFE Verified" },
                    { label: "Clearance current today", sub: "NDIS & Police Check Valid" },
                  ].map((item) => (
                    <li key={item.label}>
                      <strong>{item.label}</strong>
                      <span>{item.sub}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="diff-cell diff-lang">
                <div className="diff-cell-top">
                  <span className="diff-lab">Multilingual Support</span>
                </div>
                <h3>Twelve languages on the phones.</h3>
                <p>Interpreters at no cost to candidates.</p>
                <ul className="diff-langs">
                  {[
                    "English",
                    "हिन्दी",
                    "中文",
                    "ਪੰਜਾਬੀ",
                    "Tiếng Việt",
                    "العربية",
                    "नेपाली",
                    "+5 More",
                  ].map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </article>

              <article className="diff-cell diff-screen">
                <div className="diff-cell-top">
                  <span className="diff-lab">Level 5 Pre-Screened</span>
                  <span className="diff-chip">Phone Verified</span>
                </div>
                <h3>A phone interview before the shortlist.</h3>
                <p>
                  Once a candidate reaches Level 5, a consultant calls, works through
                  a script built from the gaps in that profile, and writes a note that
                  travels with them. Employers read the note, not just the number.
                </p>
                <blockquote className="diff-note">
                  <cite>Consultant Notes (Anjali K.)</cite>
                  <p>
                    &ldquo;5+ years aged care experience. Full 24/7 availability.
                    Excellent communication skills and verified NDIS clearance.&rdquo;
                  </p>
                </blockquote>
              </article>
            </Reveal>
          </div>
        </section>

        <hr className="rule" />

        {/* paths */}
        <section id="paths">
          <div className="shell">
            <Reveal className="paths-head">
              <h2>{t.pathh2}</h2>
              <div
                className="paths-switch"
                role="tablist"
                aria-label="Choose your path"
              >
                {(
                  [
                    { id: "seek" as PathTab, t: t.d1t, s: t.d1s },
                    { id: "hire" as PathTab, t: t.d2t, s: t.d2s },
                    { id: "new" as PathTab, t: t.d3t, s: t.d3s },
                  ] as const
                ).map((door) => (
                  <button
                    key={door.id}
                    type="button"
                    className="paths-switch-btn"
                    role="tab"
                    aria-selected={activePath === door.id}
                    aria-controls={`p-${door.id}`}
                    onClick={() => selectPath(door.id)}
                  >
                    {door.t}
                  </button>
                ))}
              </div>
              <p className="paths-lead">
                {
                  (
                    {
                      seek: t.d1s,
                      hire: t.d2s,
                      new: t.d3s,
                    } as const
                  )[activePath]
                }
              </p>
            </Reveal>

            <div
              className="path"
              id={`p-${activePath}`}
              role="tabpanel"
              aria-labelledby={`tab-${activePath}`}
            >
              <ol
                className="paths-rail"
                style={{
                  ["--paths-count" as string]: pathContent.steps.length,
                }}
              >
                {pathContent.steps.map((step, i) => (
                  <li key={step.title}>
                    <span className="paths-rail-n">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <b>{step.title}</b>
                    <span>{step.desc}</span>
                  </li>
                ))}
              </ol>

              <div className="paths-contact">
                <div className="paths-contact-who">
                  <span>{pathContent.human.header}</span>
                  <strong>{pathContent.human.name}</strong>
                  <em>{pathContent.human.role}</em>
                </div>
                <div className="paths-contact-meta">
                  {pathContent.human.rows.map(([label, value]) => (
                    <p key={label}>
                      <span>{label}</span>
                      <b>{value}</b>
                    </p>
                  ))}
                </div>
                <div className="paths-contact-langs">
                  {pathContent.human.speaks.map((lang) => (
                    <span key={lang}>{lang}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* demand board */}
        <section id="demand">
          <div className="shell">
            <Reveal className="board-top">
              <div className="head">
                <h2>What Australia is actually hiring for.</h2>
                <p className="sub">
                  Open roles on Stella right now, ranked by unfilled positions.
                  Updated hourly.
                </p>
              </div>
              <div
                className="filters"
                role="group"
                aria-label="Filter by region"
              >
                {(["all", "vic", "nsw", "qld", "remote"] as Region[]).map(
                  (r) => (
                    <button
                      key={r}
                      type="button"
                      className="filt"
                      aria-pressed={region === r}
                      onClick={() => setRegion(r)}
                    >
                      {r === "all" ? "ALL" : r.toUpperCase()}
                    </button>
                  ),
                )}
              </div>
            </Reveal>

            <Reveal>
              <div className="board-card-wrapper">
                <table className="board">
                  <thead>
                    <tr>
                      <th style={{ width: "32%" }}>Role</th>
                      <th>Location</th>
                      <th>Pay guide</th>
                      <th className="num">Open Positions</th>
                      <th className="num" style={{ width: 170 }}>
                        30-day trend
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "32px 0",
                            textAlign: "center",
                            color: "#64748b",
                          }}
                        >
                          No open roles in this region right now. Try another
                          region filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row) => (
                        <tr key={row.role}>
                          <td className="role">
                            <span className="role-title">{row.role}</span>
                          </td>
                          <td className="dim">
                            <span className="loc-text">{row.where}</span>
                          </td>
                          <td className="dim">
                            <span className="pay-pill">{row.pay}</span>
                          </td>
                          <td className="num cnt">
                            <span className="open-count-tag">{row.open}</span>
                          </td>
                          <td className="num trend-cell">
                            <Spark vals={row.s} up={row.t !== ""} />
                            <span className={`trend-pill ${row.t}`}>
                              {row.tl}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="board-note">{boardNote}</p>

              <div className="tick-wrap">
                <span className="tick-lab">
                  <span className="pulse-green-dot" />
                  Live Activity
                </span>
                <div className="tick-view" ref={tickViewRef}>
                  <ul
                    style={{
                      transform: `translateY(-${tickerOffset}px)`,
                      transition: tickerTransition
                        ? "transform .6s cubic-bezier(.16,1,.3,1)"
                        : "none",
                    }}
                  >
                    {[...TICKER_ITEMS, TICKER_ITEMS[0]].map(
                      ([who, what, when], i) => (
                        <li key={i}>
                          <b className="tick-who">{who}</b>
                          <span className="tick-what">{what}</span>
                          <em className="tick-when">{when}</em>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <hr className="rule" />

        {/* support */}
        <section id="support">
          <div className="shell">
            <Reveal className="support-intro">
              <h2>The matching is automated. The judgement is not.</h2>
              <p>
                Two support desks, staffed by people with names, direct lines,
                and enough context to be useful on the first call.
              </p>
            </Reveal>

            <Reveal className="support-metrics">
              <div className="support-metric">
                <CountStat target={90} suffix="s" />
                <span>Median answer time, seeker line</span>
              </div>
              <div className="support-metric">
                <CountStat target={1} />
                <span>Account manager per employer</span>
              </div>
              <div className="support-metric">
                <CountStat target={12} />
                <span>Languages across both desks</span>
              </div>
              <div className="support-metric">
                <CountStat target={6} suffix="h" />
                <span>Posting to screened shortlist</span>
              </div>
            </Reveal>

            <Reveal className="support-desks">
              <article className="support-desk">
                <p className="support-desk-label">For job seekers</p>
                <div className="support-desk-body">
                  <h3>A phone line a person picks up.</h3>
                  <p>
                    Not a chatbot, not a ticket number. If your application
                    stalls, you ring and find out why.
                  </p>
                  <ul>
                    <li>
                      Free help writing your profile and choosing assessments
                    </li>
                    <li>Structured phone interview once you reach Level 5</li>
                    <li>
                      Honest feedback when you are not ready for a role yet
                    </li>
                    <li>Interpreter arranged at no cost for any call</li>
                  </ul>
                </div>
              </article>
              <article className="support-desk">
                <p className="support-desk-label">For employers</p>
                <div className="support-desk-body">
                  <h3>We do the verifying, you do the hiring.</h3>
                  <p>
                    Identity, work rights, qualifications, and clearances are
                    checked at the source before a shortlist reaches you.
                  </p>
                  <ul>
                    <li>
                      Every credential verified with the issuing body, not just
                      uploaded
                    </li>
                    <li>
                      Work rights confirmed against VEVO, expiry dates tracked
                      for you
                    </li>
                    <li>
                      Clearances checked as current on the day you see the
                      profile
                    </li>
                    <li>
                      Direct mobile to your manager, no call queue, no ticket
                      triage
                    </li>
                  </ul>
                </div>
              </article>
            </Reveal>
          </div>
        </section>

        <hr className="rule" />

        {/* levels */}
        <section id="levels">
          <div className="shell">
            <Reveal className="levels-intro">
              <p className="levels-kicker">The level system</p>
              <h2>A level you earn, not a badge you buy.</h2>
              <p>
                Every profile starts at one. Each level adds evidence that somebody actually
                checked. Employers filter on it, so it has to mean something.
              </p>
            </Reveal>

            <Reveal className="levels-board">
              <div className="levels-steps">
                {[
                  {
                    n: "L1",
                    title: "Profile started",
                    desc: "History, availability, location.",
                  },
                  {
                    n: "L2",
                    title: "Identity and work rights",
                    desc: "ID matched, visa status confirmed.",
                  },
                  {
                    n: "L3",
                    title: "Credentials verified",
                    desc: "Checked at the source, overseas study included.",
                  },
                  {
                    n: "L4",
                    title: "Skills tested",
                    desc: "Job-relevant assessments and referees.",
                  },
                ].map((rung) => (
                  <div key={rung.n} className="levels-step">
                    <span className="levels-n">{rung.n}</span>
                    <h3>{rung.title}</h3>
                    <p>{rung.desc}</p>
                  </div>
                ))}
              </div>

              <div
                className={`levels-gate${ladderFill ? " on" : ""}`}
                ref={ladderRef}
              >
                <div className="levels-gate-in">
                  <span className="levels-n">L5</span>
                  <div>
                    <h3>Human screened</h3>
                    <p>Phone interview, written note, shortlist ready.</p>
                  </div>
                </div>
                <span className="levels-gate-mark">Gate</span>
              </div>
            </Reveal>
          </div>
        </section>

        <hr className="rule" />

        {/* quote + stats */}
        <section className="sec-quote">
          <div className="shell qgrid">
            <Reveal className="quote">
              <p>
                We stopped chasing certificates. The shortlist arrives already
                checked, and there is a person I can ring about every name on
                it.
              </p>
              <p className="who">
                Operations manager, 240-bed residential aged care provider,
                Melbourne
              </p>
            </Reveal>
            <Reveal
              className="stats"
              style={{ marginTop: 0, gridTemplateColumns: "1fr 1fr" }}
            >
              <div className="stat">
                <CountStat target={412} />
                <span>Open personal care roles, VIC</span>
              </div>
              <div className="stat">
                <CountStat target={84} suffix="k" />
                <span>Verified profiles on Stella</span>
              </div>
              <div className="stat">
                <CountStat target={97} suffix="%" />
                <span>Shortlists accepted first round</span>
              </div>
              <div className="stat">
                <CountStat target={0} text="$0" />
                <span>Cost for a candidate to join</span>
              </div>
            </Reveal>
          </div>
        </section>

        <hr className="rule" />

        {/* newcomers */}
        <section id="newcomers">
          <div className="shell">
            <Reveal className="new-panel">
              <div className="new-main">
                <p className="new-kicker">New to Australia</p>
                <h2>Nobody should have to guess how this country works.</h2>
                <p>
                  If you arrived recently, the hardest part is not the job. It is knowing which
                  of your qualifications count, what an employer is allowed to ask, and which check
                  to get first. That information is free here, whether you ever apply for a role
                  or not.
                </p>
                <div className="new-actions">
                  <a className="btn ac sm" href="#cta">
                    Book a free consult <ArrowIcon />
                  </a>
                  <a className="btn ghost sm" href="#demand">
                    See what is in demand
                  </a>
                </div>
              </div>
              <div className="new-grid">
                {[
                  {
                    title: "Does my degree count?",
                    desc: "How overseas qualifications are assessed against the Australian framework.",
                  },
                  {
                    title: "Work rights by visa",
                    desc: "Hour limits, conditions, and what changes when your visa does.",
                  },
                  {
                    title: "Checks and clearances",
                    desc: "Police check, NDIS screening, working with children. Which one, and when.",
                  },
                  {
                    title: "Your first Australian job",
                    desc: "Pay rates, award basics, and the questions employers cannot legally ask.",
                  },
                ].map((card) => (
                  <a key={card.title} className="new-cell" href="#cta">
                    <h3>{card.title}</h3>
                    <p>{card.desc}</p>
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* cta */}
        <section style={{ paddingTop: 0 }}>
          <div className="shell">
            <Reveal className="cta" id="cta">
              <div className="glow" aria-hidden="true" />
              <h2>Whichever side you are on, someone picks up.</h2>
              <p>
                Post a role, build a profile, or just ring and ask. The first
                conversation costs nothing.
              </p>
              <div className="row">
                <a className="btn ac" href="#">
                  Post a job <ArrowIcon />
                </a>
                <a className="btn ghost" href="#">
                  Create your profile
                </a>
              </div>
              <p className="callout">
                1300 000 000 · 7:00 to 21:00 AEST · interpreters available
              </p>
            </Reveal>
          </div>
        </section>
      </main>

    </div>
  );
}
