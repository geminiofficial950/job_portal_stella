'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Users,
  Briefcase,
  Building2,
  Star,
  CheckCircle2,
  ArrowUpRight,
  Heart,
  Globe,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

// Brand SVG Logos
const BrandLogos = {
  Apple: (
    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xs shrink-0">
      <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 170 170">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.13-9.68-1.95-14.58-6.23-3.25-2.77-7.14-7.42-11.67-13.97-6.52-9.42-11.66-19.7-15.42-30.85-3.76-11.15-5.64-21.84-5.64-32.07 0-14.16 3.52-25.75 10.56-34.78 7.04-9.03 15.93-13.62 26.67-13.78 4.82 0 10.12 1.25 15.9 3.75 5.78 2.5 9.77 3.75 11.97 3.75 1.8 0 5.86-1.31 12.18-3.93 6.32-2.62 11.45-3.83 15.4-3.63 11.46.7 20.8 4.79 28.02 12.27-10.3 6.25-15.3 14.99-15 26.22.31 8.89 3.74 16.29 10.29 22.2 6.55 5.91 14.3 9.3 23.25 10.17-2.3 6.78-5.4 13.97-9.3 21.57zM119.22 31.87c0-6.72 2.42-13.11 7.26-18.17 4.84-5.06 10.87-8.08 18.09-9.06.13.9.19 1.77.19 2.62 0 6.64-2.52 13.06-7.56 18.26-5.04 5.2-11.13 8.21-18.27 9.03-.06-.88-.1-1.77-.1-2.68z" />
      </svg>
    </div>
  ),
  Google: (
    <div className="w-12 h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center shadow-xs shrink-0">
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
    </div>
  ),
  Stripe: (
    <div className="w-12 h-12 rounded-2xl bg-[#635BFF] flex items-center justify-center font-black text-white text-base shadow-xs shrink-0">
      S
    </div>
  ),
  Spotify: (
    <div className="w-12 h-12 rounded-2xl bg-[#1DB954] flex items-center justify-center shadow-xs shrink-0">
      <span className="text-black font-extrabold text-lg">♫</span>
    </div>
  ),
  IBM: (
    <div className="w-12 h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center font-black text-[#006699] text-sm tracking-wider shadow-xs shrink-0">
      IBM
    </div>
  ),
  BMW: (
    <div className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center font-extrabold text-xs tracking-tighter text-black bg-white shadow-xs shrink-0">
      BMW
    </div>
  ),
  Paypal: (
    <div className="w-12 h-12 rounded-2xl border border-slate-200 bg-[#003087]/5 flex items-center justify-center shadow-xs shrink-0">
      <svg className="w-6 h-6 fill-current text-[#003087]" viewBox="0 0 24 24">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .761-.645h6.634c2.475 0 4.382.527 5.474 1.527 1.026.94 1.408 2.296 1.103 3.924-.038.204-.085.408-.142.612-.862 3.109-3.033 4.971-6.175 4.971H9.86a.64.64 0 0 0-.633.537l-.95 6.033a.64.64 0 0 1-.633.537h-.568z" />
      </svg>
    </div>
  ),
  Glints: (
    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center font-black text-sm text-[#0F172A] shrink-0">
      <span className="text-[#0052CC] text-lg">✦</span>
    </div>
  ),
};

const recruitersData = [
  {
    id: '1',
    name: 'Apple Inc.',
    logo: BrandLogos.Apple,
    industry: 'Technology',
    location: 'Cupertino, CA',
    openJobsCount: 14,
    rating: 4.9,
    employees: '100,000+',
    description: 'World leader in consumer electronics, hardware, software, and digital innovation.',
    perks: ['Remote Options', 'Stock Grants', 'Health & Wellness'],
    verified: true,
  },
  {
    id: '2',
    name: 'Google',
    logo: BrandLogos.Google,
    industry: 'Technology',
    location: 'Mountain View, CA',
    openJobsCount: 28,
    rating: 4.8,
    employees: '150,000+',
    description: 'Organizing the world\'s information to make it universally accessible and useful.',
    perks: ['Free Gourmet Meals', '401k Matching', 'Learning Stipend'],
    verified: true,
  },
  {
    id: '3',
    name: 'Stripe',
    logo: BrandLogos.Stripe,
    industry: 'Fintech',
    location: 'San Francisco, CA',
    openJobsCount: 9,
    rating: 4.9,
    employees: '8,000+',
    description: 'Financial infrastructure for the internet, powering payments for millions of businesses.',
    perks: ['Remote First', 'Unlimited PTO', 'Wellness Allowance'],
    verified: true,
  },
  {
    id: '4',
    name: 'Spotify',
    logo: BrandLogos.Spotify,
    industry: 'Media & Streaming',
    location: 'Stockholm, SE',
    openJobsCount: 12,
    rating: 4.7,
    employees: '9,500+',
    description: 'Unlocking the potential of human creativity through digital music & podcast streaming.',
    perks: ['Flexible Work', 'Parental Leave', 'Music Subscriptions'],
    verified: true,
  },
  {
    id: '5',
    name: 'IBM',
    logo: BrandLogos.IBM,
    industry: 'Technology',
    location: 'Armonk, NY',
    openJobsCount: 18,
    rating: 4.6,
    employees: '280,000+',
    description: 'Leading global cloud platform and cognitive enterprise solutions provider.',
    perks: ['Tuition Assistance', 'Global Mobility', 'Flexible Hours'],
    verified: true,
  },
  {
    id: '6',
    name: 'BMW Group',
    logo: BrandLogos.BMW,
    industry: 'Automotive Tech',
    location: 'Munich, DE',
    openJobsCount: 7,
    rating: 4.8,
    employees: '120,000+',
    description: 'Defining the future of premium mobility, electric vehicles, and smart transportation.',
    perks: ['Car Discounts', 'Relocation Support', 'Gym Access'],
    verified: true,
  },
  {
    id: '7',
    name: 'PayPal',
    logo: BrandLogos.Paypal,
    industry: 'Fintech',
    location: 'San Jose, CA',
    openJobsCount: 11,
    rating: 4.6,
    employees: '30,000+',
    description: 'Democratizing financial services to empower people and businesses globally.',
    perks: ['Performance Bonus', 'Health Insurance', 'Work Anywhere'],
    verified: true,
  },
  {
    id: '8',
    name: 'Glints',
    logo: BrandLogos.Glints,
    industry: 'HR Tech',
    location: 'Singapore',
    openJobsCount: 15,
    rating: 4.8,
    employees: '2,000+',
    description: 'Building Southeast Asia\'s leading career discovery and talent recruitment ecosystem.',
    perks: ['Fast Growth', 'Mentorship Program', 'Annual Retreats'],
    verified: true,
  },
];

export default function RecruitersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [followedCompanies, setFollowedCompanies] = useState<string[]>(['1', '3']);

  // Typewriter Animation for Search Placeholder
  const placeholderCompanies = [
    'Apple Inc...',
    'Google...',
    'Stripe...',
    'Spotify...',
    'BMW Group...',
  ];
  const [wordIdx, setWordIdx] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const target = placeholderCompanies[wordIdx];
    const speed = isDeleting ? 40 : 85;

    if (!isDeleting && currentPlaceholder === target) {
      const timeout = setTimeout(() => setIsDeleting(true), 1800);
      return () => clearTimeout(timeout);
    } else if (isDeleting && currentPlaceholder === '') {
      setIsDeleting(false);
      setWordIdx((prev) => (prev + 1) % placeholderCompanies.length);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentPlaceholder((prev) =>
        isDeleting ? target.substring(0, prev.length - 1) : target.substring(0, prev.length + 1)
      );
    }, speed);

    return () => clearTimeout(timer);
  }, [currentPlaceholder, isDeleting, wordIdx]);

  const industries = ['All', 'Technology', 'Fintech', 'Media & Streaming', 'Automotive Tech', 'HR Tech'];

  const toggleFollow = (id: string) => {
    setFollowedCompanies((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredRecruiters = useMemo(() => {
    return recruitersData.filter((company) => {
      if (
        searchQuery &&
        !company.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !company.industry.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (selectedIndustry !== 'All' && company.industry !== selectedIndustry) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedIndustry]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-inter text-slate-800 flex flex-col">
      {/* Top Banner / Hero Header */}
      <section
        className="relative py-10 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-200"
        style={{ background: '#fffafa' }}
      >
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-manrope text-slate-900">
              Top Employers &amp; Recruiters
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-inter">
              Discover industry leaders hiring top global talent. Explore perks, culture, and open roles.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center bg-white rounded-2xl px-4 py-3 gap-3 max-w-2xl"
            style={{ border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchQuery ? '' : `Search e.g. "${currentPlaceholder}"`}
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-inter"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')}
                className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors">Clear</button>
            )}
            <div className="h-5 w-px bg-slate-200" />
            <button type="button"
              className="px-5 py-2 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: '#b91c1c', boxShadow: '0 4px 12px rgba(185,28,28,0.22)' }}>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-slate-100 py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: '500+', label: 'Verified Employers', color: 'text-slate-900' },
            { val: '15,000+', label: 'Active Positions', color: 'text-slate-900' },
            { val: '98%', label: 'Positive Reviews', color: 'text-emerald-600' },
            { val: '4.8 ★', label: 'Avg Culture Score', color: 'text-amber-500' },
          ].map((stat, i) => (
            <div key={i} className={i < 3 ? 'border-r border-slate-100 pr-4' : ''}>
              <div className={`text-xl sm:text-2xl font-black font-manrope ${stat.color}`}>{stat.val}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        
        {/* Industry Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            {industries.map((ind) => (
              <button key={ind} onClick={() => setSelectedIndustry(ind)}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
                style={{
                  background: selectedIndustry === ind ? '#0f172a' : '#f1f5f9',
                  color: selectedIndustry === ind ? '#fff' : '#64748b',
                  boxShadow: selectedIndustry === ind ? '0 4px 12px rgba(15,23,42,0.18)' : 'none',
                  transform: selectedIndustry === ind ? 'scale(1.03)' : 'scale(1)',
                }}>
                {ind}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredRecruiters.length}</strong> recruiters
          </span>
        </div>

        {/* Recruiters Cards Grid */}
        {filteredRecruiters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecruiters.map((company) => {
              const isFollowed = followedCompanies.includes(company.id);
              return (
                <div key={company.id}
                  className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease' }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        {company.logo}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-slate-900 text-base font-manrope">{company.name}</h3>
                            {company.verified && <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-current" />}
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                            {company.industry} · <span className="text-slate-400 font-normal">{company.location}</span>
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => toggleFollow(company.id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0"
                        style={{
                          background: isFollowed ? '#f0fdf4' : '#f8fafc',
                          color: isFollowed ? '#16a34a' : '#64748b',
                          border: isFollowed ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        }}>
                        <Heart className={`w-3.5 h-3.5 ${isFollowed ? 'fill-current' : ''}`} />
                        {isFollowed ? 'Following' : 'Follow'}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{company.description}</p>

                    {/* Perks */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {company.perks.map((perk) => (
                        <span key={perk} className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium">{perk}</span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                        {company.rating}
                      </div>
                      <div className="text-slate-400 font-medium">{company.employees}</div>
                    </div>
                    <Link href="/jobs"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                      style={{ background: '#b91c1c', boxShadow: '0 4px 10px rgba(185,28,28,0.2)' }}>
                      {company.openJobsCount} Open Jobs
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Recruiters Found</h3>
            <p className="text-xs text-slate-500 mb-4">
              Try adjusting your search query or selecting a different industry.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedIndustry('All');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white"
              style={{
                background: '#b91c1c',
              }}
            >
              Reset Search
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
