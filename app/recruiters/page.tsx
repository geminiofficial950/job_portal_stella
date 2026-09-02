"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  CheckCircle2,
  ArrowUpRight,
  Loader2,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  X,
} from "lucide-react";
import "./recruiters.css";

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

function australiaCompanyPriority(company: CompanyCard): number {
  const hay = company.location.toLowerCase();
  return hay.includes("australia") ||
    hay.includes("sydney") ||
    hay.includes("melbourne")
    ? 0
    : 1;
}

function CompanyLogo({
  name,
  logoUrl,
  className,
}: {
  name: string;
  logoUrl: string;
  className?: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "C";
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt={`${name} logo`} className={className} />
    );
  }
  return <span className={className}>{initial}</span>;
}

function CompanyDetailPanel({
  company,
  onClose,
  showMobileBar,
}: {
  company: CompanyCard;
  onClose?: () => void;
  showMobileBar?: boolean;
}) {
  const websiteUrl = company.website
    ? company.website.startsWith("http")
      ? company.website
      : `https://${company.website}`
    : "";

  return (
    <>
      {showMobileBar ? (
        <div className="recruiters-detail-mobile-bar">
          <button
            type="button"
            className="recruiters-detail-back"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </button>
        </div>
      ) : null}

      <div className="recruiters-detail-scroll">
        <div className="recruiters-detail-hero">
          <div className="recruiters-detail-logo">
            <CompanyLogo name={company.name} logoUrl={company.logoUrl} />
          </div>
          <h2 className="recruiters-detail-name font-manrope">
            {company.name}
          </h2>
          <p className="recruiters-detail-sub">
            <CheckCircle2 className="recruiters-detail-verified h-4 w-4" />
            Verified employer
          </p>
        </div>

        <div className="recruiters-detail-grid">
          <div className="recruiters-detail-stat">
            <p className="recruiters-detail-stat-label">Industry</p>
            <p className="recruiters-detail-stat-value">
              {company.industry || "—"}
            </p>
          </div>
          <div className="recruiters-detail-stat">
            <p className="recruiters-detail-stat-label">Company size</p>
            <p className="recruiters-detail-stat-value">
              {company.size || "—"}
            </p>
          </div>
          <div className="recruiters-detail-stat">
            <p className="recruiters-detail-stat-label">Location</p>
            <p className="recruiters-detail-stat-value">
              {company.location || "—"}
            </p>
          </div>
          <div className="recruiters-detail-stat">
            <p className="recruiters-detail-stat-label">Open jobs</p>
            <p className="recruiters-detail-stat-value">
              {company.openJobsCount}
            </p>
          </div>
        </div>

        <h3 className="recruiters-detail-section-title">About the company</h3>
        <p className="recruiters-detail-about">
          {company.about ||
            `${company.name} is a verified employer on Stella Jobs.`}
        </p>
      </div>

      <div className="recruiters-detail-footer">
        <Link
          href={`/jobs?company=${encodeURIComponent(company.name)}`}
          className="recruiters-detail-cta"
        >
          View {company.openJobsCount} open job
          {company.openJobsCount === 1 ? "" : "s"}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        {websiteUrl ? (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="recruiters-detail-website"
          >
            Visit website
          </a>
        ) : null}
      </div>
    </>
  );
}

export default function RecruitersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [sortBy, setSortBy] = useState<"jobs" | "name">("jobs");
  const [companies, setCompanies] = useState<CompanyCard[]>([]);
  const [industries, setIndustries] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [industryFilterOpen, setIndustryFilterOpen] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

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

  const industryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of companies) {
      const key = c.industry || "Other";
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [companies]);

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
        locationQuery &&
        !company.location.toLowerCase().includes(locationQuery.toLowerCase())
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
  }, [companies, searchQuery, locationQuery, selectedIndustry]);

  const sortedRecruiters = useMemo(() => {
    const list = [...filteredRecruiters];
    list.sort((a, b) => {
      const auDiff = australiaCompanyPriority(a) - australiaCompanyPriority(b);
      if (auDiff !== 0) return auDiff;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      const jobsDiff = b.openJobsCount - a.openJobsCount;
      if (jobsDiff !== 0) return jobsDiff;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [filteredRecruiters, sortBy]);

  const selectedCompany = useMemo(
    () => sortedRecruiters.find((c) => c.id === selectedCompanyId) || null,
    [sortedRecruiters, selectedCompanyId],
  );

  useEffect(() => {
    if (sortedRecruiters.length === 0) {
      setSelectedCompanyId(null);
      return;
    }
    if (
      !selectedCompanyId ||
      !sortedRecruiters.some((c) => c.id === selectedCompanyId)
    ) {
      setSelectedCompanyId(sortedRecruiters[0].id);
    }
  }, [sortedRecruiters, selectedCompanyId]);

  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];
    if (searchQuery) {
      chips.push({
        key: "q",
        label: searchQuery,
        clear: () => setSearchQuery(""),
      });
    }
    if (locationQuery) {
      chips.push({
        key: "loc",
        label: locationQuery,
        clear: () => setLocationQuery(""),
      });
    }
    if (selectedIndustry !== "All") {
      chips.push({
        key: "ind",
        label: selectedIndustry,
        clear: () => setSelectedIndustry("All"),
      });
    }
    return chips;
  }, [searchQuery, locationQuery, selectedIndustry]);

  const resetFilters = () => {
    setSearchQuery("");
    setLocationQuery("");
    setSelectedIndustry("All");
  };

  const openCompanyDetail = (id: string) => {
    setSelectedCompanyId(id);
    if (window.matchMedia("(max-width: 1279px)").matches) {
      setMobileDetailOpen(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const closeMobileDetail = () => {
    setMobileDetailOpen(false);
  };

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="recruiters-page font-inter">
      <div className="recruiters-toolbar">
        <div className="recruiters-toolbar-inner">
          <h1 className="recruiters-toolbar-title font-manrope">Employers</h1>

          <div className="recruiters-toolbar-search-group">
          <div className="recruiters-toolbar-search">
            <div className="recruiters-toolbar-field">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Company or industry"
              />
            </div>
            <div className="recruiters-toolbar-field">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Location"
              />
            </div>
          </div>

          <button type="button" className="recruiters-toolbar-btn">
            Search
          </button>
          </div>

          <button
            type="button"
            className="recruiters-mobile-filter-btn"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      <div
        className={`recruiters-board ${selectedCompany ? "has-detail" : ""}`}
      >
        <aside
          className={`recruiters-sidebar ${isMobileFilterOpen ? "is-open" : ""}`}
        >
          <div className="recruiters-sidebar-head">
            <h3>Filters</h3>
            <button
              type="button"
              className="recruiters-filter-reset"
              onClick={() => {
                resetFilters();
                setIsMobileFilterOpen(false);
              }}
            >
              Reset all
            </button>
          </div>

          <div className="recruiters-filter-section">
            <p className="text-xs font-bold text-slate-500 mb-2">Show by</p>
            <div className="recruiters-sort-pills">
              <button
                type="button"
                className={`recruiters-sort-pill ${sortBy === "jobs" ? "is-active" : ""}`}
                onClick={() => setSortBy("jobs")}
              >
                Most jobs
              </button>
              <button
                type="button"
                className={`recruiters-sort-pill ${sortBy === "name" ? "is-active" : ""}`}
                onClick={() => setSortBy("name")}
              >
                A – Z
              </button>
            </div>
          </div>

          <div className="recruiters-filter-section">
            <button
              type="button"
              className="recruiters-filter-section-title"
              onClick={() => setIndustryFilterOpen(!industryFilterOpen)}
            >
              Industry
              {industryFilterOpen ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>
            {industryFilterOpen ? (
              <div className="recruiters-filter-options">
                {industries.map((ind) => (
                  <label key={ind} className="recruiters-filter-option">
                    <input
                      type="radio"
                      name="industry"
                      checked={selectedIndustry === ind}
                      onChange={() => {
                        setSelectedIndustry(ind);
                        setIsMobileFilterOpen(false);
                      }}
                    />
                    {ind}
                    {ind !== "All" ? (
                      <span className="recruiters-filter-count">
                        ({industryCounts[ind] || 0})
                      </span>
                    ) : null}
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          {isMobileFilterOpen ? (
            <button
              type="button"
              className="recruiters-toolbar-btn mt-4 w-full"
              onClick={() => setIsMobileFilterOpen(false)}
            >
              Apply filters
            </button>
          ) : null}
        </aside>

        <div
          className={`recruiters-list-panel ${mobileDetailOpen ? "is-hidden-mobile" : ""}`}
        >
          {hasActiveFilters ? (
            <div className="recruiters-active-filters">
              {activeFilters.map((chip) => (
                <span key={chip.key} className="recruiters-filter-chip">
                  {chip.label}
                  <button
                    type="button"
                    onClick={chip.clear}
                    aria-label={`Remove ${chip.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                className="recruiters-clear-all"
                onClick={resetFilters}
              >
                Delete all
              </button>
            </div>
          ) : null}

          {loading ? (
            <div className="recruiters-loading flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading employers…
            </div>
          ) : error ? (
            <div className="recruiters-empty">
              <Building2 className="mx-auto mb-3 h-12 w-12 text-slate-300" />
              <p className="font-bold text-slate-900">Couldn&apos;t load companies</p>
              <p className="mt-1 text-sm">{error}</p>
              <button
                type="button"
                className="recruiters-btn-primary"
                onClick={() => void loadCompanies()}
              >
                Try again
              </button>
            </div>
          ) : sortedRecruiters.length > 0 ? (
            <div className="recruiters-list-scroll">
              {sortedRecruiters.map((company) => {
                const isSelected = company.id === selectedCompanyId;

                return (
                  <article
                    key={company.id}
                    role="button"
                    tabIndex={0}
                    className={`recruiters-list-card ${isSelected ? "is-selected" : ""}`}
                    onClick={() => openCompanyDetail(company.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openCompanyDetail(company.id);
                      }
                    }}
                  >
                    <div className="recruiters-list-card-logo">
                      <CompanyLogo
                        name={company.name}
                        logoUrl={company.logoUrl}
                      />
                    </div>

                    <p className="recruiters-list-card-name font-manrope">
                      {company.name}
                    </p>

                    <p className="recruiters-list-card-meta">
                      {company.industry || "Employer"}
                      {company.location ? ` · ${company.location}` : ""}
                    </p>

                    <div className="recruiters-list-card-bottom">
                      <span className="recruiters-list-card-jobs">
                        {company.openJobsCount} open job
                        {company.openJobsCount === 1 ? "" : "s"}
                      </span>
                      <div className="recruiters-list-card-actions">
                        <button
                          type="button"
                          className="recruiters-details-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompanyDetail(company.id);
                          }}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="recruiters-empty">
              <Building2 className="mx-auto mb-3 h-12 w-12 text-slate-300" />
              <p className="font-bold">No employers found</p>
              <button
                type="button"
                className="recruiters-btn-primary"
                onClick={resetFilters}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        <div
          className={`recruiters-detail-panel ${
            mobileDetailOpen ? "is-mobile-open" : ""
          } ${selectedCompany ? "is-visible" : ""}`}
        >
          {selectedCompany ? (
            <CompanyDetailPanel
              company={selectedCompany}
              onClose={closeMobileDetail}
              showMobileBar={mobileDetailOpen}
            />
          ) : (
            <div className="recruiters-detail-placeholder">
              <Building2 className="h-16 w-16" />
              <p className="text-sm font-semibold">
                Select an employer to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
