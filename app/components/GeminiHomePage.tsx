"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  MapPin,
  Users,
  Heart,
  ShieldCheck,
  Building2,
  ChevronRight,
  Utensils,
  Stethoscope,
  Laptop,
  HeartHandshake,
  TrendingUp,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import "../gemini-home.css";
import HeroSection from "./HeroSection";
import TrustedBySection from "./TrustedBySection";
import FourThingsSection from "./FourThingsSection";
import PathsSection from "./PathsSection";
import SupportSection from "./SupportSection";
import LevelsSection from "./LevelsSection";
import NewcomersSection from "./NewcomersSection";
import CtaSection from "./CtaSection";

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
  icon: React.ElementType;
  iconBg: string;
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
    icon: HeartHandshake,
    iconBg: "bg-[#0284c7]",
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
    icon: Users,
    iconBg: "bg-purple-600",
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
    icon: Stethoscope,
    iconBg: "bg-emerald-600",
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
    icon: Utensils,
    iconBg: "bg-amber-500",
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
    icon: Users,
    iconBg: "bg-sky-500",
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
    icon: Building2,
    iconBg: "bg-teal-500",
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
    icon: Laptop,
    iconBg: "bg-indigo-600",
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
    icon: Utensils,
    iconBg: "bg-orange-600",
  },
];

const TICKER_ITEMS = [
  ["Priya N.", "reached Level 5 after a phone screen", "2 min ago"],
  ["Mercy Aged Care", "shortlisted 4 verified candidates", "6 min ago"],
  ["Daniel K.", "had 3 credentials verified at the source", "11 min ago"],
  ["Ability First", "filled 2 night shifts in Werribee", "18 min ago"],
  ["Rania S.", "completed a free newcomer consult in Arabic", "24 min ago"],
];

/* ── helpers ── */

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

/* ── main page ── */

export default function GeminiHomePage() {
  const [progress, setProgress] = useState(0);
  const [region, setRegion] = useState<Region>("all");
  const [lang, setLang] = useState<Lang>("en");
  const [barsAnimated, setBarsAnimated] = useState(false);
  const [tickerOffset, setTickerOffset] = useState(0);
  const [tickerTransition, setTickerTransition] = useState(true);

  const barsRef = useRef<HTMLDivElement>(null);
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

  return (
    <div className="gemini-home">
      <div id="prog" style={{ width: `${progress}%` }} />

      <main id="top">
        <HeroSection />

        <TrustedBySection />

        <FourThingsSection />

        <hr className="rule" />

        <PathsSection
          labels={{
            titleLine: "Three",
            titleAccent: "ways in.",
            tabs: [
              { id: "seek", label: t.d1t, lead: t.d1s },
              { id: "hire", label: t.d2t, lead: t.d2s },
              { id: "new", label: t.d3t, lead: t.d3s },
            ],
          }}
        />

        {/* demand board */}
        <section id="demand" className="pt-3 pb-8 sm:pt-5 sm:pb-12 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              {/* Top Row: Left Content + Center Map + Right Live Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
                {/* Top Left: Title, Subtitle & Region Filters */}
                <div className="lg:col-span-4 flex flex-col items-start text-left">
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-[1.15] mb-3 sm:mb-4">
                    What Australia is{" "}
                    <span className="font-serif italic text-[#065985] font-normal tracking-wide">
                      actually
                    </span>{" "}
                    hiring for.
                  </h2>
                  <p className="text-slate-500 text-sm sm:text-base mb-6 leading-relaxed">
                    Open roles on Gemini Education and Careers right now, ranked by unfilled positions. Updated hourly.
                  </p>
                  <div className="flex items-center gap-3.5 sm:gap-4 flex-wrap">
                    {(["all", "vic", "nsw", "qld"] as Region[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRegion(r)}
                        className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          region === r
                            ? "bg-[#074e79] text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {r === "all" ? "ALL" : r.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top Center: Australia Map & Floating Badge */}
                <div className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[220px]">
                  <svg
                    className="w-full h-auto max-w-[340px] text-sky-200"
                    viewBox="0 0 400 280"
                    fill="none"
                    stroke="currentColor"
                  >
                    {/* Australia map silhouette / outline */}
                    <path
                      d="M110 80 Q150 50 200 70 Q250 40 290 60 Q340 70 355 110 Q370 150 350 190 Q330 230 290 250 Q240 260 200 250 Q160 260 120 240 Q80 210 70 170 Q60 130 80 95 Z"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      fill="rgba(240, 249, 255, 0.5)"
                    />
                    {/* Arcs connecting cities */}
                    <path
                      d="M130 140 Q190 75 270 130"
                      stroke="#0284c7"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <path
                      d="M190 100 Q240 130 270 130"
                      stroke="#0284c7"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <path
                      d="M270 130 Q305 170 315 200"
                      stroke="#0284c7"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />

                    {/* Map Pin Locations */}
                    {/* WA/Perth */}
                    <g transform="translate(130, 140)">
                      <circle cx="0" cy="0" r="4.5" fill="#0284c7" />
                      <circle cx="0" cy="0" r="8" fill="#0284c7" fillOpacity="0.2" />
                    </g>
                    {/* NT/Darwin */}
                    <g transform="translate(190, 100)">
                      <circle cx="0" cy="0" r="4.5" fill="#0284c7" />
                      <circle cx="0" cy="0" r="8" fill="#0284c7" fillOpacity="0.2" />
                    </g>
                    {/* QLD/Brisbane */}
                    <g transform="translate(270, 130)">
                      <circle cx="0" cy="0" r="4.5" fill="#0284c7" />
                      <circle cx="0" cy="0" r="8" fill="#0284c7" fillOpacity="0.2" />
                    </g>
                    {/* NSW/Sydney */}
                    <g transform="translate(315, 200)">
                      <circle cx="0" cy="0" r="4.5" fill="#0284c7" />
                      <circle cx="0" cy="0" r="8" fill="#0284c7" fillOpacity="0.2" />
                    </g>
                    {/* VIC/Melbourne */}
                    <g transform="translate(290, 220)">
                      <circle cx="0" cy="0" r="4.5" fill="#0284c7" />
                      <circle cx="0" cy="0" r="8" fill="#0284c7" fillOpacity="0.2" />
                    </g>
                  </svg>

                  {/* Floating 2.8K Badge */}
                  <div className="mt-2 bg-white rounded-2xl p-2.5 px-4 shadow-sm border border-slate-200/80 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-50 text-[#0284c7] flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-extrabold text-slate-900 leading-tight">2.8K+</span>
                      <span className="text-xs text-slate-500 font-medium">Open roles right now</span>
                    </div>
                  </div>
                </div>

                {/* Top Right: Live Activity Card */}
                <div className="lg:col-span-3 w-full">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 text-left">
                    <h3 className="text-xs font-bold text-slate-900 mb-3 tracking-wide">
                      Live Activity
                    </h3>
                    <div className="space-y-3">
                      {/* Item 1 */}
                      <div className="flex items-start justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-[#0284c7] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            PN
                          </div>
                          <span className="text-slate-700 leading-tight">
                            <strong className="font-semibold text-slate-900">Priya N.</strong> reached Level 5 after a phone screen
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">2 min ago</span>
                      </div>

                      {/* Item 2 */}
                      <div className="flex items-start justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center shrink-0">
                            <Heart className="w-3 h-3 fill-current" />
                          </div>
                          <span className="text-slate-700 leading-tight">
                            <strong className="font-semibold text-slate-900">Mercy Aged Care</strong> shortlisted 4 verified candidates
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">6 min ago</span>
                      </div>

                      {/* Item 3 */}
                      <div className="flex items-start justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-3 h-3" />
                          </div>
                          <span className="text-slate-700 leading-tight">
                            <strong className="font-semibold text-slate-900">Daniel K.</strong> had 3 credentials verified at the source
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">11 min ago</span>
                      </div>

                      {/* Item 4 */}
                      <div className="flex items-start justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-[#074e79] text-white flex items-center justify-center shrink-0">
                            <Building2 className="w-3 h-3" />
                          </div>
                          <span className="text-slate-700 leading-tight">
                            <strong className="font-semibold text-slate-900">Ability First</strong> filled 2 night shifts in Werribee
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">18 min ago</span>
                      </div>

                      {/* Item 5 */}
                      <div className="flex items-start justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            RS
                          </div>
                          <span className="text-slate-700 leading-tight">
                            <strong className="font-semibold text-slate-900">Rania S.</strong> completed a free newcomer consult in Arabic
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">24 min ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Table Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden text-left">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-xs font-semibold">
                        <th className="py-3.5 px-6 font-semibold">Role</th>
                        <th className="py-3.5 px-6 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>Location</span>
                          </div>
                        </th>
                        <th className="py-3.5 px-6 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Search className="w-3.5 h-3.5 text-slate-400" />
                            <span>Pay guide</span>
                          </div>
                        </th>
                        <th className="py-3.5 px-6 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Open Positions</span>
                          </div>
                        </th>
                        <th className="py-3.5 px-6 font-semibold">30-day trend</th>
                        <th className="py-3.5 px-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                            No open roles in this region right now. Try another region filter.
                          </td>
                        </tr>
                      ) : (
                        filteredRows.map((row) => {
                          const RowIcon = row.icon;
                          return (
                            <tr
                              key={row.role}
                              className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                            >
                              {/* Role */}
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 rounded-full ${row.iconBg} text-white flex items-center justify-center shrink-0 shadow-sm`}
                                  >
                                    <RowIcon className="w-4 h-4" />
                                  </div>
                                  <span className="font-bold text-slate-900 text-sm group-hover:text-[#074e79] transition-colors">
                                    {row.role}
                                  </span>
                                </div>
                              </td>

                              {/* Location */}
                              <td className="py-4 px-6 text-slate-500 text-sm">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{row.where}</span>
                                </div>
                              </td>

                              {/* Pay guide */}
                              <td className="py-4 px-6 text-slate-600 text-sm font-medium">
                                {row.pay}
                              </td>

                              {/* Open Positions */}
                              <td className="py-4 px-6">
                                <span className="text-[#074e79] font-bold text-base sm:text-lg">
                                  {row.open}
                                </span>
                              </td>

                              {/* 30-day trend */}
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-20">
                                    <Spark vals={row.s} up={row.t !== ""} />
                                  </div>
                                  <span
                                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                      row.t !== ""
                                        ? "text-emerald-600 bg-emerald-50"
                                        : "text-slate-500 bg-slate-100"
                                    }`}
                                  >
                                    {row.tl}
                                  </span>
                                </div>
                              </td>

                              {/* Chevron */}
                              <td className="py-4 px-4 text-right">
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="py-3 text-center border-t border-slate-100 bg-slate-50/30">
                  <span className="text-xs text-slate-400 font-medium">
                    Showing all regions · figures illustrative
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <SupportSection />

        <LevelsSection />

        <hr className="rule my-0 opacity-40" />

        {/* Dark Testimonial & Stats Section */}
        <section className="bg-[#051833] py-16 lg:py-20 text-white relative overflow-hidden my-4">
          {/* Subtle Dotted Australia Silhouette Background on Left */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-15 text-sky-400 w-[350px] lg:w-[450px]">
            <svg viewBox="0 0 460 300" fill="currentColor">
              <pattern id="dot-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="currentColor" />
              </pattern>
              <path
                d="M 215 50 C 220 40 226 28 230 15 C 234 28 238 42 236 52 C 242 60 252 68 258 74 C 264 55 272 35 278 15 C 284 32 290 58 300 75 C 315 92 335 110 350 128 C 365 145 382 165 386 190 C 388 212 378 225 365 232 C 348 240 336 222 325 212 C 315 228 302 242 288 250 C 275 254 258 245 242 238 C 222 232 198 238 178 234 C 158 230 140 218 126 202 C 110 182 105 158 112 135 C 118 112 136 100 154 94 C 170 90 184 96 196 86 C 208 76 212 62 215 50 Z"
                fill="url(#dot-pattern)"
              />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Reveal>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                {/* Left Side: Large Quote */}
                <div className="lg:col-span-6 flex flex-col items-start text-left">
                  {/* Quote Icon */}
                  <div className="text-[#2b65bd] mb-4">
                    <svg className="w-10 h-10 fill-current" viewBox="0 0 32 32">
                      <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H6c0-2.2 1.8-4 4-4V8zm18 0c-3.3 0-6 2.7-6 6v10h10V14h-8c0-2.2 1.8-4 4-4V8z" />
                    </svg>
                  </div>

                  {/* Main Quote Text */}
                  <blockquote className="text-xl sm:text-2xl lg:text-3xl font-normal text-white leading-snug tracking-tight mb-6">
                    “We stopped chasing certificates. The shortlist arrives already checked, and there is a person I can ring about every name on it.”
                  </blockquote>

                  {/* Subtle Underline */}
                  <div className="w-10 h-[3px] bg-[#2563eb] rounded-full mb-4" />

                  {/* Author / Designation */}
                  <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                    Operations manager, 240-bed residential aged care provider, Melbourne
                  </p>
                </div>

                {/* Right Side: 2x2 Stats Card Container */}
                <div className="lg:col-span-6">
                  <div className="bg-[#071d3d]/90 border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-700/60 border-b border-slate-700/60">
                      {/* Stat 1 */}
                      <div className="p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#13325e] text-[#38bdf8] flex items-center justify-center shrink-0">
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-3xl sm:text-4xl font-extrabold text-white leading-none mb-1.5">
                            412
                          </span>
                          <span className="text-xs text-slate-300 font-medium leading-normal">
                            Open personal care roles, VIC
                          </span>
                        </div>
                      </div>

                      {/* Stat 2 */}
                      <div className="p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#13325e] text-[#38bdf8] flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-3xl sm:text-4xl font-extrabold text-white leading-none mb-1.5">
                            84k
                          </span>
                          <span className="text-xs text-slate-300 font-medium leading-normal">
                            Verified profiles on Gemini Education and Careers
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-700/60">
                      {/* Stat 3 */}
                      <div className="p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#13325e] text-[#38bdf8] flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-3xl sm:text-4xl font-extrabold text-white leading-none mb-1.5">
                            97%
                          </span>
                          <span className="text-xs text-slate-300 font-medium leading-normal">
                            Shortlists accepted first round
                          </span>
                        </div>
                      </div>

                      {/* Stat 4 */}
                      <div className="p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#13325e] text-[#38bdf8] flex items-center justify-center shrink-0">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-3xl sm:text-4xl font-extrabold text-white leading-none mb-1.5">
                            $0
                          </span>
                          <span className="text-xs text-slate-300 font-medium leading-normal">
                            Cost for a candidate to join
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <NewcomersSection />

        <CtaSection />
      </main>

    </div>
  );
}
