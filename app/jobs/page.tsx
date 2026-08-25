"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Bookmark,
  SlidersHorizontal,
  Check,
  ArrowLeft,
  Loader2,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/app/components/AuthProvider";

type CompanyInfo = {
  id: string;
  name: string;
  logoUrl: string;
  location: string;
  industry: string;
  about: string;
  website: string;
  size: string;
};

type JobItem = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  category: string;
  employmentType: string;
  workMode: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: string;
  skills: string[];
  benefits: string;
  createdAt: string | null;
  company: CompanyInfo | null;
};

type CompanyOption = { id: string; name: string };

const WORK_MODE_LABELS: Record<string, string> = {
  onsite: "Onsite",
  remote: "Remote",
  hybrid: "Hybrid",
};

const TYPE_LABELS: Record<string, string> = {
  "full-time": "Fulltime",
  "part-time": "Parttime",
  casual: "Casual",
  contract: "Contract",
};

const LEVEL_LABELS: Record<string, string> = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior",
};

const PERIOD_LABELS: Record<string, string> = {
  hour: "hr",
  day: "day",
  week: "week",
  year: "year",
};

function formatSalary(job: JobItem) {
  const currency = job.salaryCurrency || "AUD";
  const period = PERIOD_LABELS[job.salaryPeriod] || job.salaryPeriod;
  const min = Math.round(job.salaryMin);
  const max = Math.round(job.salaryMax);
  if (min === max) return `${currency} $${min}/${period}`;
  return `${currency} $${min}–$${max}/${period}`;
}

function timeAgo(iso: string | null) {
  if (!iso) return "Recently";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}

function CompanyLogo({
  name,
  logoUrl,
  size = "md",
}: {
  name: string;
  logoUrl: string;
  size?: "md" | "lg";
}) {
  const box = size === "lg" ? "h-12 w-12" : "h-11 w-11";
  const text = size === "lg" ? "text-base" : "text-sm";
  const initial = name.trim().charAt(0).toUpperCase() || "J";
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={`${box} shrink-0 rounded-2xl border border-slate-100 bg-white object-cover shadow-xs`}
      />
    );
  }
  return (
    <div
      className={`${box} ${text} flex shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-900 font-black text-white shadow-xs`}
    >
      {initial}
    </div>
  );
}

function JobSearchInner() {
  const searchParams = useSearchParams();
  const companyFromUrl = searchParams.get("company")?.trim() || "";
  const { user, loading: authLoading } = useAuth();

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedCompanyId, setSelectedCompanyId] = useState("All");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const placeholderWords = useMemo(
    () =>
      jobs.length > 0
        ? jobs.slice(0, 6).map((j) => `${j.title}...`)
        : [
            "UI/UX Designer...",
            "Software Engineer...",
            "Product Manager...",
            "Data Analyst...",
          ],
    [jobs],
  );
  const [wordIdx, setWordIdx] = useState(0);
  const [currentPlaceholderText, setCurrentPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/jobs/browse");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load jobs");
      }
      setJobs(data.jobs ?? []);
      setCompanyOptions(data.companies ?? []);
      setCategories(["All", ...((data.categories as string[]) ?? [])]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  // Preselect company filter from /jobs?company=Name
  useEffect(() => {
    if (!companyFromUrl || companyOptions.length === 0) return;
    const match = companyOptions.find(
      (c) => c.name.toLowerCase() === companyFromUrl.toLowerCase(),
    );
    if (match) setSelectedCompanyId(match.id);
  }, [companyFromUrl, companyOptions]);

  useEffect(() => {
    const targetWord = placeholderWords[wordIdx % placeholderWords.length];
    const speed = isDeleting ? 40 : 85;

    if (!isDeleting && currentPlaceholderText === targetWord) {
      const timeout = setTimeout(() => setIsDeleting(true), 1800);
      return () => clearTimeout(timeout);
    }
    if (isDeleting && currentPlaceholderText === "") {
      setIsDeleting(false);
      setWordIdx((prev) => (prev + 1) % placeholderWords.length);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentPlaceholderText((prev) =>
        isDeleting
          ? targetWord.substring(0, prev.length - 1)
          : targetWord.substring(0, prev.length + 1),
      );
    }, speed);

    return () => clearTimeout(timer);
  }, [
    currentPlaceholderText,
    isDeleting,
    wordIdx,
    placeholderWords,
  ]);

  const jobTypes = ["full-time", "part-time", "contract", "casual"];
  const workModels = ["onsite", "remote", "hybrid"];
  const experienceLevels = [
    { value: "All", label: "All" },
    { value: "entry", label: "Entry Level" },
    { value: "mid", label: "Mid Level" },
    { value: "senior", label: "Senior" },
  ];

  const toggleBookmark = (id: string) => {
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleModelFilter = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model],
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedModels([]);
    setSelectedCategory("All");
    setSelectedLevel("All");
    setSelectedCompanyId("All");
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const companyName = job.company?.name || "";
      if (
        searchQuery &&
        !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !companyName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !job.location.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (
        selectedCategory !== "All" &&
        job.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }
      if (selectedLevel !== "All" && job.experienceLevel !== selectedLevel) {
        return false;
      }
      if (
        selectedTypes.length > 0 &&
        !selectedTypes.includes(job.employmentType)
      ) {
        return false;
      }
      if (
        selectedModels.length > 0 &&
        !selectedModels.includes(job.workMode)
      ) {
        return false;
      }
      if (
        selectedCompanyId !== "All" &&
        job.company?.id !== selectedCompanyId
      ) {
        return false;
      }
      return true;
    });
  }, [
    jobs,
    searchQuery,
    selectedCategory,
    selectedLevel,
    selectedTypes,
    selectedModels,
    selectedCompanyId,
  ]);

  useEffect(() => {
    setSelectedJobId((prev) => (prev !== null ? null : prev));
  }, [
    searchQuery,
    selectedCategory,
    selectedLevel,
    selectedTypes,
    selectedModels,
    selectedCompanyId,
  ]);

  const activeJobDetail = useMemo(
    () => filteredJobs.find((job) => job.id === selectedJobId) || null,
    [filteredJobs, selectedJobId],
  );

  return (
    <div
      className="flex min-h-screen flex-col bg-[#F8FAFC] font-inter text-slate-800"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <section
        className="relative overflow-hidden border-b border-slate-200 px-4 py-10 sm:px-6 lg:px-8"
        style={{ background: "#f0f4f8" }}
      >
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-6">
            <h1 className="font-manrope text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Find Your Next Dream Role
            </h1>
            <p className="mt-1 font-inter text-sm text-slate-500">
              Browse open roles posted by verified employers on Stella Jobs.
            </p>
          </div>

          <div
            className="mx-auto flex max-w-2xl items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left"
            style={{
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
            }}
          >
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchQuery ? "" : `Search "${currentPlaceholderText}"`
              }
              className="flex-1 bg-transparent font-inter text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs font-medium text-slate-400 transition-colors hover:text-slate-700"
              >
                Clear
              </button>
            ) : null}
            <div className="h-5 w-px bg-slate-200" />
            <button
              type="button"
              className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{
                background: "#1e3a5f",
                boxShadow: "0 4px 12px rgba(30,58,95,0.22)",
              }}
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs lg:hidden">
            <span className="text-sm font-bold text-slate-900">
              Showing {filteredJobs.length} Jobs Found
            </span>
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#3b8d99]/30 bg-[#3b8d99]/10 px-4 py-2 text-xs font-semibold text-[#3b8d99]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          <aside
            className={`h-fit w-full shrink-0 rounded-3xl border border-slate-100 bg-white p-5 lg:sticky lg:top-24 lg:w-64 ${
              isMobileFilterOpen ? "block" : "hidden lg:block"
            }`}
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
          >
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-[#3b8d99]" />
                <h3 className="font-manrope text-base font-bold text-slate-900">
                  Filters
                </h3>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="cursor-pointer text-xs font-semibold text-[#1e3a5f] hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Company filter */}
            <div className="mb-6">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Company
              </h4>
              <div className="max-h-48 space-y-1.5 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setSelectedCompanyId("All")}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
                    selectedCompanyId === "All"
                      ? "border border-[#3b8d99]/30 bg-[#3b8d99]/10 font-bold text-[#3b8d99]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>All</span>
                  {selectedCompanyId === "All" ? (
                    <Check className="h-3.5 w-3.5 text-[#3b8d99]" />
                  ) : null}
                </button>
                {companyOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCompanyId(c.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
                      selectedCompanyId === c.id
                        ? "border border-[#3b8d99]/30 bg-[#3b8d99]/10 font-bold text-[#3b8d99]"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {selectedCompanyId === c.id ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#3b8d99]" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 border-t border-slate-200 pt-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Job Category
              </h4>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? "border border-[#3b8d99]/30 bg-[#3b8d99]/10 font-bold text-[#3b8d99]"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat ? (
                      <Check className="h-3.5 w-3.5 text-[#3b8d99]" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 border-t border-slate-200 pt-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Work Model
              </h4>
              <div className="space-y-2">
                {workModels.map((model) => {
                  const isChecked = selectedModels.includes(model);
                  return (
                    <label
                      key={model}
                      className="flex cursor-pointer select-none items-center gap-2.5 text-xs font-medium text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleModelFilter(model)}
                        className="h-4 w-4 rounded border-slate-300 text-[#3b8d99] focus:ring-[#3b8d99]"
                      />
                      <span>{WORK_MODE_LABELS[model] || model}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mb-6 border-t border-slate-200 pt-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Employment Type
              </h4>
              <div className="space-y-2">
                {jobTypes.map((type) => {
                  const isChecked = selectedTypes.includes(type);
                  return (
                    <label
                      key={type}
                      className="flex cursor-pointer select-none items-center gap-2.5 text-xs font-medium text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTypeFilter(type)}
                        className="h-4 w-4 rounded border-slate-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
                      />
                      <span>{TYPE_LABELS[type] || type}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-5">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Experience Level
              </h4>
              <div className="space-y-1.5">
                {experienceLevels.map((lvl) => (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setSelectedLevel(lvl.value)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
                      selectedLevel === lvl.value
                        ? "border border-[#1e3a5f]/30 bg-[#1e3a5f]/10 font-bold text-[#1e3a5f]"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{lvl.label}</span>
                    {selectedLevel === lvl.value ? (
                      <Check className="h-3.5 w-3.5 text-[#1e3a5f]" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center gap-2 rounded-[28px] border border-slate-200 bg-white py-20 text-sm text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading jobs…
              </div>
            ) : error ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center">
                <Briefcase className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <h3 className="mb-1 text-lg font-bold text-slate-900">
                  Couldn’t load jobs
                </h3>
                <p className="mb-4 text-xs text-slate-500">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadJobs()}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-white"
                  style={{ background: "#1e3a5f" }}
                >
                  Try again
                </button>
              </div>
            ) : activeJobDetail ? (
              <div className="animate-in fade-in rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-xs duration-300 sm:p-8">
                <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-6">
                  <button
                    type="button"
                    onClick={() => setSelectedJobId(null)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1e3a5f]/10 px-4 py-2 text-xs font-bold text-[#1e3a5f] transition-colors hover:bg-[#1e3a5f] hover:text-white sm:text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to all jobs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(activeJobDetail.id)}
                    className={`cursor-pointer rounded-xl border p-2.5 transition-colors ${
                      savedJobs.includes(activeJobDetail.id)
                        ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Bookmark className="h-4 w-4 fill-current" />
                  </button>
                </div>

                <div className="mb-8 rounded-[24px] border border-slate-200/60 bg-[#F5F6F8] p-6">
                  <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <CompanyLogo
                        name={activeJobDetail.company?.name || "Company"}
                        logoUrl={activeJobDetail.company?.logoUrl || ""}
                        size="lg"
                      />
                      <div>
                        <span className="font-manrope text-lg font-extrabold text-[#0F172A]">
                          {activeJobDetail.company?.name || "Company"}
                        </span>
                        <h2 className="mt-1 font-manrope text-xl font-black text-slate-900 sm:text-2xl">
                          {activeJobDetail.title}
                        </h2>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Salary Range
                      </span>
                      <span className="font-manrope text-2xl font-extrabold text-[#0F172A]">
                        {formatSalary(activeJobDetail)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-4">
                    <span className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {activeJobDetail.location}
                    </span>
                    <span className="rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700">
                      {WORK_MODE_LABELS[activeJobDetail.workMode] ||
                        activeJobDetail.workMode}
                    </span>
                    <span className="rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700">
                      {TYPE_LABELS[activeJobDetail.employmentType] ||
                        activeJobDetail.employmentType}
                    </span>
                    <span className="rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700">
                      {LEVEL_LABELS[activeJobDetail.experienceLevel] ||
                        activeJobDetail.experienceLevel}
                    </span>
                    <span className="ml-auto text-xs font-normal text-slate-400">
                      Posted {timeAgo(activeJobDetail.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="mb-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                  {!authLoading && !user ? (
                    <Link
                      href={`/login?role=user&next=${encodeURIComponent(`/jobs?job=${activeJobDetail.id}`)}`}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-extrabold text-white shadow-md transition-all duration-200 hover:opacity-95 active:scale-95 sm:text-base"
                      style={{ background: "#1e3a5f" }}
                    >
                      Sign In
                    </Link>
                  ) : (
                    <Link
                      href={
                        user?.role === "user"
                          ? "/dashboard/seeker/jobs"
                          : "/login?role=user"
                      }
                      className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-extrabold text-white shadow-md transition-all duration-200 hover:opacity-95 active:scale-95 sm:text-base"
                      style={{ background: "#1e3a5f" }}
                    >
                      Apply Now
                    </Link>
                  )}
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="mb-3 font-manrope text-base font-bold text-slate-900">
                      About The Role
                    </h3>
                    <div
                      className="prose prose-sm max-w-none text-slate-600"
                      dangerouslySetInnerHTML={{
                        __html: activeJobDetail.description,
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 font-manrope text-base font-bold text-slate-900">
                      Key Responsibilities
                    </h3>
                    <div
                      className="prose prose-sm max-w-none text-slate-600"
                      dangerouslySetInnerHTML={{
                        __html: activeJobDetail.responsibilities,
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 font-manrope text-base font-bold text-slate-900">
                      Qualifications & Requirements
                    </h3>
                    <div
                      className="prose prose-sm max-w-none text-slate-600"
                      dangerouslySetInnerHTML={{
                        __html: activeJobDetail.requirements,
                      }}
                    />
                  </div>
                  {activeJobDetail.skills.length > 0 ? (
                    <div>
                      <h3 className="mb-3 font-manrope text-base font-bold text-slate-900">
                        Required Skills & Stack
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {activeJobDetail.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {activeJobDetail.company?.about ? (
                    <div>
                      <h3 className="mb-3 font-manrope text-base font-bold text-slate-900">
                        About {activeJobDetail.company.name}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-600">
                        {activeJobDetail.company.about}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 hidden items-center justify-between lg:flex">
                  <p className="text-sm text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-900">
                      {filteredJobs.length}
                    </span>{" "}
                    positions available
                  </p>
                </div>

                {filteredJobs.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {filteredJobs.map((job) => {
                      const isBookmarked = savedJobs.includes(job.id);
                      const companyName = job.company?.name || "Company";
                      return (
                        <div
                          key={job.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedJobId(job.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedJobId(job.id);
                            }
                          }}
                          className="flex cursor-pointer flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-4"
                          style={{
                            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                            transition:
                              "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease",
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.transform = "translateY(-4px)";
                            el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)";
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.transform = "translateY(0)";
                            el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                          }}
                        >
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <div className="mb-3 flex items-start justify-between">
                              <CompanyLogo
                                name={companyName}
                                logoUrl={job.company?.logoUrl || ""}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmark(job.id);
                                }}
                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-all"
                                style={{
                                  background: isBookmarked ? "#1e3a5f" : "#fff",
                                  color: isBookmarked ? "#fff" : "#94a3b8",
                                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                }}
                                aria-label="Bookmark Job"
                              >
                                <Bookmark className="h-4 w-4 fill-current" />
                              </button>
                            </div>
                            <p className="mb-0.5 font-inter text-xs font-semibold text-slate-400">
                              {companyName}
                            </p>
                            <h3 className="mb-3 font-manrope text-base font-bold text-slate-900">
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                WORK_MODE_LABELS[job.workMode] || job.workMode,
                                TYPE_LABELS[job.employmentType] ||
                                  job.employmentType,
                              ].map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-1 font-inter text-[11px] font-semibold text-slate-600"
                                >
                                  {tag}
                                </span>
                              ))}
                              <span className="rounded-xl border border-slate-200 bg-white px-3 py-1 font-inter text-[11px] font-semibold text-slate-500">
                                {LEVEL_LABELS[job.experienceLevel] ||
                                  job.experienceLevel}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between px-1">
                            <div>
                              <p className="font-manrope text-sm font-extrabold text-slate-900">
                                {formatSalary(job)}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1 font-inter text-[11px] text-slate-400">
                                <MapPin className="h-3 w-3" />
                                {job.location}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedJobId(job.id);
                              }}
                              className="cursor-pointer rounded-xl border-2 border-emerald-500 px-4 py-1.5 text-xs font-bold text-emerald-600 transition-all duration-200 hover:bg-emerald-500 hover:text-white"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                    <Briefcase className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                    <h3 className="mb-1 text-lg font-bold text-slate-900">
                      No Jobs Found
                    </h3>
                    <p className="mb-4 text-xs text-slate-500">
                      Try adjusting filters or search, or check back later for
                      new postings.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-white"
                      style={{ background: "#1e3a5f" }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function JobSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center gap-2 bg-[#F8FAFC] text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading jobs…
        </div>
      }
    >
      <JobSearchInner />
    </Suspense>
  );
}
