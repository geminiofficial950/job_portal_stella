"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  Star,
  CheckCircle2,
  ArrowUpRight,
  Heart,
  Loader2,
} from "lucide-react";

type CompanyCard = {
  id: string;
  name: string;
  website: string;
  industry: string;
  location: string;
  size: string;
  about: string;
  logoUrl: string;
  openJobsCount: number;
};

function CompanyLogo({ name, logoUrl }: { name: string; logoUrl: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "C";
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className="h-12 w-12 shrink-0 rounded-2xl border border-slate-200 bg-white object-cover shadow-xs"
      />
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-900 text-base font-black text-white shadow-xs">
      {initial}
    </div>
  );
}

export default function RecruitersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [followedCompanies, setFollowedCompanies] = useState<string[]>([]);
  const [companies, setCompanies] = useState<CompanyCard[]>([]);
  const [industries, setIndustries] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const placeholderCompanies = useMemo(
    () =>
      companies.length > 0
        ? companies.slice(0, 5).map((c) => `${c.name}...`)
        : ["Company name...", "Industry...", "Location..."],
    [companies],
  );
  const [wordIdx, setWordIdx] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load companies");
      }
      setCompanies(data.companies ?? []);
      setIndustries(["All", ...((data.industries as string[]) ?? [])]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load companies");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    const target = placeholderCompanies[wordIdx % placeholderCompanies.length];
    const speed = isDeleting ? 40 : 85;

    if (!isDeleting && currentPlaceholder === target) {
      const timeout = setTimeout(() => setIsDeleting(true), 1800);
      return () => clearTimeout(timeout);
    }
    if (isDeleting && currentPlaceholder === "") {
      setIsDeleting(false);
      setWordIdx((prev) => (prev + 1) % placeholderCompanies.length);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentPlaceholder((prev) =>
        isDeleting
          ? target.substring(0, prev.length - 1)
          : target.substring(0, prev.length + 1),
      );
    }, speed);

    return () => clearTimeout(timer);
  }, [
    currentPlaceholder,
    isDeleting,
    wordIdx,
    placeholderCompanies,
  ]);

  const toggleFollow = (id: string) => {
    setFollowedCompanies((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const filteredRecruiters = useMemo(() => {
    return companies.filter((company) => {
      if (
        searchQuery &&
        !company.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !company.industry.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !company.location.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (
        selectedIndustry !== "All" &&
        company.industry.toLowerCase() !== selectedIndustry.toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  }, [companies, searchQuery, selectedIndustry]);

  const totalOpenJobs = useMemo(
    () => companies.reduce((sum, c) => sum + c.openJobsCount, 0),
    [companies],
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] font-inter text-slate-800">
      <section
        className="relative overflow-hidden border-b border-slate-200 px-4 py-10 sm:px-6 lg:px-8"
        style={{ background: "#f0f4f8" }}
      >
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-6">
            <h1 className="font-manrope text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Top Employers &amp; Recruiters
            </h1>
            <p className="mt-1 font-inter text-sm text-slate-500">
              Discover verified employers hiring top talent. Explore culture,
              size, and open roles.
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
                searchQuery ? "" : `Search e.g. "${currentPlaceholder}"`
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
              className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
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

      <section className="border-b border-slate-100 bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 text-center md:grid-cols-4">
          {[
            {
              val: loading ? "—" : String(companies.length),
              label: "Verified Employers",
              color: "text-slate-900",
            },
            {
              val: loading ? "—" : String(totalOpenJobs),
              label: "Active Positions",
              color: "text-slate-900",
            },
            {
              val: loading
                ? "—"
                : String(Math.max(industries.length - 1, 0)),
              label: "Industries",
              color: "text-emerald-600",
            },
            {
              val: "Live",
              label: "From recruiter profiles",
              color: "text-amber-500",
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={i < 3 ? "border-r border-slate-100 pr-4" : ""}
            >
              <div
                className={`font-manrope text-xl font-black sm:text-2xl ${stat.color}`}
              >
                {stat.val}
              </div>
              <div className="mt-0.5 text-xs font-medium text-slate-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {industries.map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => setSelectedIndustry(ind)}
                className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200"
                style={{
                  background: selectedIndustry === ind ? "#0f172a" : "#f1f5f9",
                  color: selectedIndustry === ind ? "#fff" : "#64748b",
                  boxShadow:
                    selectedIndustry === ind
                      ? "0 4px 12px rgba(15,23,42,0.18)"
                      : "none",
                  transform:
                    selectedIndustry === ind ? "scale(1.03)" : "scale(1)",
                }}
              >
                {ind}
              </button>
            ))}
          </div>
          <span className="text-xs font-medium text-slate-500">
            Showing{" "}
            <strong className="text-slate-900">
              {filteredRecruiters.length}
            </strong>{" "}
            recruiters
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading companies…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <Building2 className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <h3 className="mb-1 text-lg font-bold text-slate-900">
              Couldn’t load companies
            </h3>
            <p className="mb-4 text-xs text-slate-500">{error}</p>
            <button
              type="button"
              onClick={() => void loadCompanies()}
              className="rounded-xl px-4 py-2 text-xs font-bold text-white"
              style={{ background: "#1e3a5f" }}
            >
              Try again
            </button>
          </div>
        ) : filteredRecruiters.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredRecruiters.map((company) => {
              const isFollowed = followedCompanies.includes(company.id);
              const tags = [company.size, company.industry, company.location]
                .map((t) => t.trim())
                .filter(Boolean);

              return (
                <div
                  key={company.id}
                  className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5"
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
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <CompanyLogo
                          name={company.name}
                          logoUrl={company.logoUrl}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-manrope text-base font-extrabold text-slate-900">
                              {company.name}
                            </h3>
                            <CheckCircle2 className="h-4 w-4 fill-current text-emerald-500" />
                          </div>
                          <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                            {company.industry || "Employer"}
                            {company.location ? (
                              <>
                                {" "}
                                ·{" "}
                                <span className="font-normal text-slate-400">
                                  {company.location}
                                </span>
                              </>
                            ) : null}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFollow(company.id)}
                        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200"
                        style={{
                          background: isFollowed ? "#f0fdf4" : "#f8fafc",
                          color: isFollowed ? "#16a34a" : "#64748b",
                          border: isFollowed
                            ? "1px solid #bbf7d0"
                            : "1px solid #e2e8f0",
                        }}
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${isFollowed ? "fill-current" : ""}`}
                        />
                        {isFollowed ? "Following" : "Follow"}
                      </button>
                    </div>

                    <p className="mb-4 text-xs leading-relaxed text-slate-500">
                      {company.about ||
                        `${company.name} is hiring on Stella Jobs.`}
                    </p>

                    {tags.length > 0 ? (
                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-4 text-xs">
                      {company.website ? (
                        <a
                          href={
                            company.website.startsWith("http")
                              ? company.website
                              : `https://${company.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-slate-500 hover:text-slate-800 hover:underline"
                        >
                          Website
                        </a>
                      ) : (
                        <div className="flex items-center gap-1 font-bold text-slate-800">
                          <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                          Verified
                        </div>
                      )}
                      {company.size ? (
                        <div className="font-medium text-slate-400">
                          {company.size}
                        </div>
                      ) : null}
                    </div>
                    <Link
                      href={`/jobs?company=${encodeURIComponent(company.name)}`}
                      className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90"
                      style={{
                        background: "#1e3a5f",
                        boxShadow: "0 4px 10px rgba(30,58,95,0.2)",
                      }}
                    >
                      {company.openJobsCount} Open Jobs
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <Building2 className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <h3 className="mb-1 text-lg font-bold text-slate-900">
              No Recruiters Found
            </h3>
            <p className="mb-4 text-xs text-slate-500">
              Try adjusting your search query or selecting a different industry.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedIndustry("All");
              }}
              className="rounded-xl px-4 py-2 text-xs font-bold text-white"
              style={{ background: "#1e3a5f" }}
            >
              Reset Search
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
