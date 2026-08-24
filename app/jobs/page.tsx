'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Search,
  MapPin,
  Filter,
  Bookmark,
  ArrowUpRight,
  SlidersHorizontal,
  X,
  Check,
  ChevronDown,
  Briefcase,
  DollarSign,
  Clock,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Building,
  Globe,
  Award,
  Zap,
  Sparkles,
  AlertCircle,
  XCircle,
} from 'lucide-react';

// Brand SVG Logos
const BrandLogos = {
  Glints: (
    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xs border border-slate-100/80 shrink-0">
      <span className="text-[#0052CC] text-xl font-black">✦</span>
    </div>
  ),
  Apple: (
    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center shadow-xs shrink-0">
      <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 170 170">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.13-9.68-1.95-14.58-6.23-3.25-2.77-7.14-7.42-11.67-13.97-6.52-9.42-11.66-19.7-15.42-30.85-3.76-11.15-5.64-21.84-5.64-32.07 0-14.16 3.52-25.75 10.56-34.78 7.04-9.03 15.93-13.62 26.67-13.78 4.82 0 10.12 1.25 15.9 3.75 5.78 2.5 9.77 3.75 11.97 3.75 1.8 0 5.86-1.31 12.18-3.93 6.32-2.62 11.45-3.83 15.4-3.63 11.46.7 20.8 4.79 28.02 12.27-10.3 6.25-15.3 14.99-15 26.22.31 8.89 3.74 16.29 10.29 22.2 6.55 5.91 14.3 9.3 23.25 10.17-2.3 6.78-5.4 13.97-9.3 21.57zM119.22 31.87c0-6.72 2.42-13.11 7.26-18.17 4.84-5.06 10.87-8.08 18.09-9.06.13.9.19 1.77.19 2.62 0 6.64-2.52 13.06-7.56 18.26-5.04 5.2-11.13 8.21-18.27 9.03-.06-.88-.1-1.77-.1-2.68z" />
      </svg>
    </div>
  ),
  BMW: (
    <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center font-extrabold text-xs tracking-tighter text-black bg-white shadow-xs shrink-0">
      BMW
    </div>
  ),
  IBM: (
    <div className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center font-black text-[#006699] text-xs tracking-wider shadow-xs shrink-0">
      IBM
    </div>
  ),
  Google: (
    <div className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center shadow-xs shrink-0">
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
  Paypal: (
    <div className="w-12 h-12 rounded-full border border-slate-200 bg-[#003087]/5 flex items-center justify-center shadow-xs shrink-0">
      <svg className="w-6 h-6 fill-current text-[#003087]" viewBox="0 0 24 24">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .761-.645h6.634c2.475 0 4.382.527 5.474 1.527 1.026.94 1.408 2.296 1.103 3.924-.038.204-.085.408-.142.612-.862 3.109-3.033 4.971-6.175 4.971H9.86a.64.64 0 0 0-.633.537l-.95 6.033a.64.64 0 0 1-.633.537h-.568z" />
      </svg>
    </div>
  ),
  Stripe: (
    <div className="w-12 h-12 rounded-full bg-[#635BFF] flex items-center justify-center font-black text-white text-base shadow-xs shrink-0">
      S
    </div>
  ),
  Spotify: (
    <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center shadow-xs shrink-0">
      <span className="text-black font-extrabold text-lg">♫</span>
    </div>
  ),
};

const allJobsData = [
  {
    id: '1',
    company: 'Glints',
    logo: BrandLogos.Glints,
    title: 'UI/UX Designer',
    workModel: 'Onsite',
    type: 'Fulltime',
    salary: '$3000/month',
    location: 'Jakarta, ID',
    category: 'Design',
    level: 'Mid Level',
    posted: '2 days ago',
    description:
      'We are looking for an experienced UI/UX Designer to craft intuitive, beautiful digital experiences for millions of job seekers across Southeast Asia. You will collaborate closely with product managers, engineers, and brand designers.',
    responsibilities: [
      'Design clean, responsive user interfaces for web and mobile platforms.',
      'Conduct user research, usability testing, and translate findings into design iterations.',
      'Create wireframes, interactive prototypes, and maintain component design systems.',
      'Partner with front-end engineers to ensure design precision in production.',
    ],
    requirements: [
      '3+ years of experience in Product Design or UI/UX Design.',
      'Proficiency in Figma, Design Systems, and prototyping tools.',
      'Strong portfolio demonstrating human-centered design principles.',
      'Excellent communication and cross-functional team collaboration.',
    ],
    skills: ['Figma', 'UI/UX Design', 'User Research', 'Design Systems', 'Prototyping'],
    benefits: ['Competitive Salary', 'Flexible Health Insurance', 'Annual Learning Stipend', 'Hybrid Work Options'],
    aboutCompany:
      'Glints is the leading career discovery and hiring ecosystem in Southeast Asia, empowering over 5 million professionals to fulfill their human potential.',
  },
  {
    id: '2',
    company: 'Apple',
    logo: BrandLogos.Apple,
    title: 'Product Designer',
    workModel: 'Remote',
    type: 'Partime',
    salary: '$25/hr',
    location: 'Batam, ID',
    category: 'Design',
    level: 'Senior',
    posted: '1 day ago',
    description:
      'Join Apple’s design team to reshape digital product interfaces. We expect passion for elegance, pixel perfection, and crafting seamless interactions that delight customers worldwide.',
    responsibilities: [
      'Architect intuitive user journeys and high-fidelity visual interfaces.',
      'Define visual guidelines and motion animations for digital experiences.',
      'Collaborate directly with cross-functional executive engineering leads.',
    ],
    requirements: [
      '5+ years of senior-level product design experience.',
      'Mastery of typography, grid layouts, micro-animations, and visual hierarchy.',
      'Degree in HCI, Interaction Design, or equivalent practical experience.',
    ],
    skills: ['Figma', 'Product Design', 'Human Interface Guidelines', 'Motion Graphics'],
    benefits: ['Employee Discount on Apple Hardware', 'Stock Purchase Plan', 'Comprehensive Healthcare'],
    aboutCompany:
      'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories while offering an array of related services.',
  },
  {
    id: '3',
    company: 'BMW',
    logo: BrandLogos.BMW,
    title: 'Web Designer',
    workModel: 'Onsite',
    type: 'Fulltime',
    salary: '$1500/month',
    location: 'Medan, ID',
    category: 'Design',
    level: 'Entry Level',
    posted: '3 days ago',
    description:
      'BMW is seeking a creative Web Designer to design high-converting landing pages and digital brand touchpoints for automotive vehicle showcases.',
    responsibilities: [
      'Design modern web pages aligning with BMW global brand standards.',
      'Optimize web graphics and layouts for high-speed responsiveness.',
    ],
    requirements: [
      '1+ year of web design experience.',
      'HTML/CSS understanding and proficiency in Figma or Adobe XD.',
    ],
    skills: ['Web Design', 'Figma', 'HTML/CSS', 'Visual Branding'],
    benefits: ['Vehicle Discount Program', 'Health & Dental Coverage', 'Career Growth Pathway'],
    aboutCompany: 'The BMW Group is the world’s leading premium manufacturer of automobiles and motorcycles.',
  },
  {
    id: '4',
    company: 'IBM',
    logo: BrandLogos.IBM,
    title: 'Data Analyst',
    workModel: 'Hybrid',
    type: 'Partime',
    salary: '$40/hr',
    location: 'Bali, ID',
    category: 'Data Science',
    level: 'Mid Level',
    posted: 'Just now',
    description:
      'Analyze complex data sets to discover actionable business insights and drive AI-driven intelligence for global enterprise clients.',
    responsibilities: [
      'Build interactive dashboards using SQL, Python, and Tableau.',
      'Partner with data engineering to streamline data pipelines.',
    ],
    requirements: [
      'Strong SQL, Python data analysis skills, and statistical knowledge.',
    ],
    skills: ['SQL', 'Python', 'Tableau', 'Data Analysis', 'Statistics'],
    benefits: ['Flexible Working Hours', 'Global Project Opportunities', 'Tuition Assistance'],
    aboutCompany: 'IBM is a global technology and consulting company creating AI and hybrid cloud solutions.',
  },
  {
    id: '5',
    company: 'Google',
    logo: BrandLogos.Google,
    title: 'Graphic Designer',
    workModel: 'Remote',
    type: 'Fulltime',
    salary: '$1400/month',
    location: 'Surabaya, ID',
    category: 'Design',
    level: 'Entry Level',
    posted: '4 days ago',
    description:
      'Create stunning marketing illustrations, social media assets, and digital campaign graphics for Google Play and Android ecosystems.',
    responsibilities: [
      'Produce creative visual assets for digital channels.',
      'Ensure brand visual consistency across multi-country initiatives.',
    ],
    requirements: ['Portfolio featuring illustration, vector graphic design, and brand identity.'],
    skills: ['Adobe Illustrator', 'Photoshop', 'Graphic Design', 'Branding'],
    benefits: ['Free Learning Subscriptions', 'Equipment Allowance', 'Wellness Stipend'],
    aboutCompany: 'Google is a multinational technology company specializing in online services and AI.',
  },
  {
    id: '6',
    company: 'Paypal',
    logo: BrandLogos.Paypal,
    title: 'Software Engineer',
    workModel: 'Hybrid',
    type: 'Fulltime',
    salary: '$80/hr',
    location: 'Yogyakarta, ID',
    category: 'Software Engineering',
    level: 'Senior',
    posted: '1 day ago',
    description:
      'Architect robust backend microservices and payment gateways handling millions of secure global daily transactions.',
    responsibilities: [
      'Develop scalable APIs in Node.js / Java / Go.',
      'Ensure high security, zero-downtime deployments, and fault tolerance.',
    ],
    requirements: ['4+ years of backend software engineering experience and distributed systems.'],
    skills: ['Node.js', 'TypeScript', 'Microservices', 'PostgreSQL', 'AWS'],
    benefits: ['Quarterly Performance Bonuses', 'Work from Home Allowance', 'Medical & Life Insurance'],
    aboutCompany: 'PayPal operates a worldwide online payments system that supports online money transfers.',
  },
  {
    id: '7',
    company: 'Stripe',
    logo: BrandLogos.Stripe,
    title: 'Frontend Developer',
    workModel: 'Remote',
    type: 'Fulltime',
    salary: '$4500/month',
    location: 'Remote, US',
    category: 'Software Engineering',
    level: 'Senior',
    posted: '5 hours ago',
    description:
      'Build world-class web applications and payment dashboards using Next.js, React, and Tailwind CSS with extreme attention to latency and UI delight.',
    responsibilities: [
      'Implement accessible, fast, and responsive user interfaces.',
      'Collaborate with product designers to create seamless payment checkout flows.',
    ],
    requirements: ['Senior React/Next.js developer with 4+ years frontend building experience.'],
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Web Performance'],
    benefits: ['Remote First Culture', 'Unlimited Paid Time Off', 'Home Office Stipend'],
    aboutCompany: 'Stripe builds economic infrastructure for the internet powering businesses of all sizes.',
  },
  {
    id: '8',
    company: 'Spotify',
    logo: BrandLogos.Spotify,
    title: 'Product Marketing Manager',
    workModel: 'Hybrid',
    type: 'Fulltime',
    salary: '$3800/month',
    location: 'Stockholm, SE',
    category: 'Marketing',
    level: 'Mid Level',
    posted: '1 day ago',
    description:
      'Lead go-to-market strategies for Spotify Premium features, artist discovery campaigns, and listener growth globally.',
    responsibilities: ['Define positioning, messaging, and multi-channel campaign rollouts.'],
    requirements: ['3+ years in B2C tech product marketing.'],
    skills: ['Product Marketing', 'Growth Strategy', 'Analytics', 'Campaign Execution'],
    benefits: ['Parental Leave', 'Music Subscriptions', 'Relocation Support'],
    aboutCompany: 'Spotify is the world’s most popular audio streaming subscription service.',
  },
];

export default function JobSearchPage() {
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [savedJobs, setSavedJobs] = useState<string[]>(['2']);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Newest');

  // SELECTED JOB DETAILS STATE (null = show grid, id = show detail panel)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Typewriter Animation for Search Placeholder
  const placeholderWords = [
    'UI/UX Designer...',
    'Software Engineer...',
    'Product Manager...',
    'Data Analyst...',
    'Graphic Designer...',
    'React Developer...',
  ];
  const [wordIdx, setWordIdx] = useState(0);
  const [currentPlaceholderText, setCurrentPlaceholderText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const targetWord = placeholderWords[wordIdx];
    const speed = isDeleting ? 40 : 85;

    if (!isDeleting && currentPlaceholderText === targetWord) {
      const timeout = setTimeout(() => setIsDeleting(true), 1800);
      return () => clearTimeout(timeout);
    } else if (isDeleting && currentPlaceholderText === '') {
      setIsDeleting(false);
      setWordIdx((prev) => (prev + 1) % placeholderWords.length);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentPlaceholderText((prev) =>
        isDeleting
          ? targetWord.substring(0, prev.length - 1)
          : targetWord.substring(0, prev.length + 1)
      );
    }, speed);

    return () => clearTimeout(timer);
  }, [currentPlaceholderText, isDeleting, wordIdx]);

  const categories = ['All', 'Design', 'Software Engineering', 'Marketing', 'Data Science'];
  const jobTypes = ['Fulltime', 'Partime', 'Contract'];
  const workModels = ['Onsite', 'Remote', 'Hybrid'];
  const experienceLevels = ['All', 'Entry Level', 'Mid Level', 'Senior'];

  const toggleBookmark = (id: string) => {
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleModelFilter = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedModels([]);
    setSelectedCategory('All');
    setSelectedLevel('All');
  };

  // Filter Logic
  const filteredJobs = useMemo(() => {
    return allJobsData.filter((job) => {
      if (
        searchQuery &&
        !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !job.company.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (selectedCategory !== 'All' && job.category !== selectedCategory) {
        return false;
      }
      if (selectedLevel !== 'All' && job.level !== selectedLevel) {
        return false;
      }
      if (selectedTypes.length > 0 && !selectedTypes.includes(job.type)) {
        return false;
      }
      if (selectedModels.length > 0 && !selectedModels.includes(job.workModel)) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedLevel, selectedTypes, selectedModels]);

  const activeJobDetail = useMemo(() => {
    return allJobsData.find((job) => job.id === selectedJobId) || null;
  }, [selectedJobId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-inter text-slate-800 flex flex-col" style={{ fontFamily: 'var(--font-inter)' }}>
      <Navbar />

      {/* Top Banner / Hero Search Header */}
      <section
        className="relative py-10 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-200"
        style={{ background: '#fffafa' }}
      >
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-manrope text-slate-900">
              Find Your Next Dream Role
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-inter">
              Filter through thousands of hand-picked jobs from leading companies worldwide.
            </p>
          </div>

          {/* Quick Search Bar */}
          <div className="flex items-center bg-white rounded-2xl px-4 py-3 gap-3 max-w-2xl"
            style={{ border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchQuery ? '' : `Search "${currentPlaceholderText}"`}
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-inter"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')}
                className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors">
                Clear
              </button>
            )}
            <div className="h-5 w-px bg-slate-200" />
            <button type="button"
              className="px-5 py-2 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: '#b91c1c', boxShadow: '0 4px 12px rgba(185,28,28,0.22)' }}>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Main Jobs Layout: LEFT SIDEBAR (FILTERS) + RIGHT SIDE (GRID OR JOB DETAIL PANEL) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="font-bold text-slate-900 text-sm">
              Showing {filteredJobs.length} Jobs Found
            </span>
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b8d99]/10 text-[#3b8d99] font-semibold text-xs border border-[#3b8d99]/30"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* LEFT SIDEBAR: FILTERS (STICKY ON SCROLL) */}
          <aside
            className={`w-full lg:w-64 shrink-0 bg-white rounded-3xl p-5 border border-slate-100 h-fit lg:sticky lg:top-24 ${
              isMobileFilterOpen ? 'block' : 'hidden lg:block'
            }`}
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="flex items-center justify-between pb-5 border-b border-slate-200 mb-6">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#3b8d99]" />
                <h3 className="font-bold text-slate-900 text-base font-manrope">Filters</h3>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-[#b91c1c] hover:underline cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Job Category
              </h4>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-[#3b8d99]/10 text-[#3b8d99] font-bold border border-[#3b8d99]/30'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-[#3b8d99]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Model Filter */}
            <div className="mb-6 pt-5 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Work Model
              </h4>
              <div className="space-y-2">
                {workModels.map((model) => {
                  const isChecked = selectedModels.includes(model);
                  return (
                    <label
                      key={model}
                      className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleModelFilter(model)}
                        className="w-4 h-4 rounded border-slate-300 text-[#3b8d99] focus:ring-[#3b8d99]"
                      />
                      <span>{model}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Job Type Filter */}
            <div className="mb-6 pt-5 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Employment Type
              </h4>
              <div className="space-y-2">
                {jobTypes.map((type) => {
                  const isChecked = selectedTypes.includes(type);
                  return (
                    <label
                      key={type}
                      className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTypeFilter(type)}
                        className="w-4 h-4 rounded border-slate-300 text-[#b91c1c] focus:ring-[#b91c1c]"
                      />
                      <span>{type}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Experience Level Filter */}
            <div className="pt-5 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Experience Level
              </h4>
              <div className="space-y-1.5">
                {experienceLevels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedLevel === lvl
                        ? 'bg-[#b91c1c]/10 text-[#b91c1c] font-bold border border-[#b91c1c]/30'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{lvl}</span>
                    {selectedLevel === lvl && <Check className="w-3.5 h-3.5 text-[#b91c1c]" />}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE AREA: GRID OF CARDS (IF NO JOB SELECTED) OR FULL JOB DETAIL PANEL */}
          <section className="flex-1">
            
            {activeJobDetail ? (
              /* ==================== FULL JOB DETAIL VIEW PANEL ==================== */
              <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 sm:p-8 shadow-xs animate-in fade-in duration-300">
                
                {/* Back to All Jobs Header Control */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                  <button
                    onClick={() => setSelectedJobId(null)}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#b91c1c] transition-colors cursor-pointer bg-[#b91c1c]/10 hover:bg-[#b91c1c] hover:text-white px-4 py-2 rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to all jobs</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleBookmark(activeJobDetail.id)}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        savedJobs.includes(activeJobDetail.id)
                          ? 'bg-[#dc2626] text-white border-[#dc2626]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

                {/* Top Gray Card Inner Container (Matches Card Styling) */}
                <div className="bg-[#F5F6F8] rounded-[24px] p-6 mb-8 border border-slate-200/60">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      {activeJobDetail.logo}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#0F172A] text-lg font-manrope">
                            {activeJobDetail.company}
                          </span>
                          <svg className="w-4.5 h-4.5 text-[#1D9BF0] fill-current" viewBox="0 0 24 24">
                            <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.475 9.55.6 10.92.6 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.448 1.273 2.818 2.148 4.398 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.7 4.5l-4-4 1.41-1.41 2.59 2.58 7.59-7.59 1.41 1.41-9 9z" />
                          </svg>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-manrope">
                          {activeJobDetail.title}
                        </h2>
                      </div>
                    </div>

                    {/* Salary Tag */}
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                        Salary Range
                      </span>
                      <span className="text-2xl font-extrabold text-[#0F172A] font-manrope">
                        {activeJobDetail.salary}
                      </span>
                    </div>
                  </div>

                  {/* Badges & Meta Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200/80">
                    <span className="bg-white border border-slate-200/90 text-slate-700 text-xs px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {activeJobDetail.location}
                    </span>
                    <span className="bg-white border border-slate-200/90 text-slate-700 text-xs px-3.5 py-1.5 rounded-xl font-semibold">
                      {activeJobDetail.workModel}
                    </span>
                    <span className="bg-white border border-slate-200/90 text-slate-700 text-xs px-3.5 py-1.5 rounded-xl font-semibold">
                      {activeJobDetail.type}
                    </span>
                    <span className="bg-white border border-slate-200/90 text-slate-700 text-xs px-3.5 py-1.5 rounded-xl font-semibold">
                      {activeJobDetail.level}
                    </span>
                    <span className="text-xs text-slate-400 font-normal ml-auto">
                      Posted {activeJobDetail.posted}
                    </span>
                  </div>
                </div>

                {/* Primary CTA Apply Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
                  <button
                    type="button"
                    className="flex-1 py-3.5 px-8 rounded-2xl text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer hover:opacity-95 shadow-md active:scale-95"
                    style={{
                      background: '#b91c1c',
                    }}
                  >
                    <span>Apply For This Position</span>
                    <ArrowUpRight className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleBookmark(activeJobDetail.id)}
                    className="px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {savedJobs.includes(activeJobDetail.id) ? 'Saved' : 'Save Position'}
                  </button>
                </div>

                {/* AI Profile Compatibility Analysis Scorecard */}
                {(() => {
                  const match = (() => {
                    if (activeJobDetail.id === '1') {
                      return {
                        score: 98,
                        label: 'Strong Match',
                        scoreColor: 'text-[#b91c1c]',
                        badgeBorder: 'border-[#fecaca]',
                        badgeBg: 'bg-[#fef2f2] text-[#b91c1c]',
                        barColor: 'bg-[#dc2626]',
                        boxColor: 'bg-[#fef2f2] border-[#fecaca]',
                        iconBg: 'bg-[#dc2626]/15 border-[#dc2626]/40 text-[#dc2626]',
                        positives: [
                          `Skills Match: UI/UX & Figma (100% Fit)`,
                          `Work Setup: ${activeJobDetail.workModel} matches preference`,
                          `Experience Level: ${activeJobDetail.level} aligned with profile`,
                          `Salary Range: ${activeJobDetail.salary} in target range`,
                        ],
                        gaps: [],
                      };
                    } else if (activeJobDetail.id === '2') {
                      return {
                        score: 84,
                        label: 'Good Match',
                        scoreColor: 'text-[#b91c1c]',
                        badgeBorder: 'border-[#cdd3e0]',
                        badgeBg: 'bg-[#fef2f2] text-[#b91c1c]',
                        barColor: 'bg-[#b91c1c]',
                        boxColor: 'bg-[#fffafa] border-[#cdd3e0]',
                        iconBg: 'bg-[#dc2626]/10 border-[#dc2626]/30 text-[#dc2626]',
                        positives: [
                          `Skills Match: Product Design & Wireframing`,
                          `Work Setup: ${activeJobDetail.workModel} preferred`,
                          `Salary Range: ${activeJobDetail.salary} in target range`,
                        ],
                        gaps: [
                          { text: 'Skill Gap: Motion Graphics & Micro-animations missing', type: 'amber' },
                        ],
                      };
                    } else if (activeJobDetail.id === '3') {
                      return {
                        score: 62,
                        label: 'Moderate Fit',
                        scoreColor: 'text-[#3a4a7a]',
                        badgeBorder: 'border-[#cdd3e0]',
                        badgeBg: 'bg-[#fef2f2] text-[#3a4a7a]',
                        barColor: 'bg-[#6b7a9e]',
                        boxColor: 'bg-[#fffafa] border-[#cdd3e0]',
                        iconBg: 'bg-[#e6eaf2] border-[#cdd3e0] text-[#3a4a7a]',
                        positives: [
                          `Skills Match: Web Design & Figma`,
                          `Salary Range: ${activeJobDetail.salary} in target range`,
                        ],
                        gaps: [
                          { text: 'Skill Gap: HTML/CSS Frontend Coding missing', type: 'amber' },
                          { text: 'Requirement Gap: Requires Onsite Relocation to Medan', type: 'rose' },
                        ],
                      };
                    } else {
                      return {
                        score: 55,
                        label: 'Low Match',
                        scoreColor: 'text-[#6b7a9e]',
                        badgeBorder: 'border-[#cdd3e0]',
                        badgeBg: 'bg-[#fef2f2] text-[#6b7a9e]',
                        barColor: 'bg-[#9aa6c4]',
                        boxColor: 'bg-[#fffafa] border-[#cdd3e0]',
                        iconBg: 'bg-[#e6eaf2] border-[#cdd3e0] text-[#6b7a9e]',
                        positives: [
                          `Work Setup: ${activeJobDetail.workModel} matches preference`,
                          `Salary Range: ${activeJobDetail.salary} in target range`,
                        ],
                        gaps: [
                          { text: 'Skill Gap: Advanced Python & Tableau certification missing', type: 'amber' },
                          { text: 'Experience Gap: Requires 4+ yrs Data Science experience (Profile has 2 yrs)', type: 'rose' },
                        ],
                      };
                    }
                  })();

                  return (
                    <div className={`${match.boxColor} border rounded-[24px] p-5 sm:p-6 mb-8 relative overflow-hidden shadow-xs`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl ${match.iconBg} flex items-center justify-center shrink-0`}>
                            <Zap className="w-6 h-6 fill-current" />
                          </div>
                          <div>
                            <h3 className="text-lg font-extrabold text-slate-900 font-manrope">
                              Profile Match: <span className={match.scoreColor}>{match.score}%</span>
                            </h3>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className={`flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border ${match.badgeBorder} shadow-2xs shrink-0`}>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Candidate Fit</span>
                            <span className={`text-xs font-extrabold ${match.scoreColor}`}>{match.label}</span>
                          </div>
                          <span className={`text-2xl font-black ${match.scoreColor} font-manrope`}>
                            {match.score}%
                          </span>
                        </div>
                      </div>

                      {/* Dynamic Progress Bar */}
                      <div className="w-full bg-slate-200/80 h-2.5 rounded-full mb-4 overflow-hidden p-0.5">
                        <div
                          className={`${match.barColor} h-full rounded-full transition-all duration-700`}
                          style={{ width: `${match.score}%` }}
                        />
                      </div>

                      {/* Match Breakdown Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {match.positives.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white/90 p-2.5 rounded-xl border border-slate-200/70">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}

                        {match.gaps.map((gap, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 text-xs font-semibold p-2.5 rounded-xl border ${
                              gap.type === 'amber'
                                ? 'text-amber-900 bg-amber-50/90 border-amber-200/80'
                                : 'text-rose-900 bg-rose-50/90 border-rose-200/80 sm:col-span-2'
                            }`}
                          >
                            {gap.type === 'amber' ? (
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                            <span>{gap.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Job Description & Role Breakdown */}
                <div className="space-y-8 text-slate-700 text-sm leading-relaxed">
                  
                  {/* Role Overview */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 mb-3 font-manrope flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#3b8d99]" />
                      About The Role
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {activeJobDetail.description}
                    </p>
                  </div>

                  {/* Key Responsibilities */}
                  {activeJobDetail.responsibilities && (
                    <div className="pt-6 border-t border-slate-100">
                      <h3 className="text-base font-extrabold text-slate-900 mb-3 font-manrope flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#dc2626]" />
                        Key Responsibilities
                      </h3>
                      <ul className="space-y-2.5">
                        {activeJobDetail.responsibilities.map((resp, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3b8d99] mt-2 shrink-0" />
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Qualifications & Requirements */}
                  {activeJobDetail.requirements && (
                    <div className="pt-6 border-t border-slate-100">
                      <h3 className="text-base font-extrabold text-slate-900 mb-3 font-manrope flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#b91c1c]" />
                        Qualifications &amp; Requirements
                      </h3>
                      <ul className="space-y-2.5">
                        {activeJobDetail.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c] mt-2 shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Skills & Tech Stack Chips */}
                  {activeJobDetail.skills && (
                    <div className="pt-6 border-t border-slate-100">
                      <h3 className="text-base font-extrabold text-slate-900 mb-3 font-manrope">
                        Required Skills &amp; Stack
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {activeJobDetail.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Benefits & Perks */}
                  {activeJobDetail.benefits && (
                    <div className="pt-6 border-t border-slate-100">
                      <h3 className="text-base font-extrabold text-slate-900 mb-3 font-manrope">
                        Benefits &amp; Perks
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeJobDetail.benefits.map((benefit) => (
                          <div
                            key={benefit}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs font-semibold text-slate-700"
                          >
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* About Company Box */}
                  {activeJobDetail.aboutCompany && (
                    <div className="pt-6 border-t border-slate-100 bg-[#F5F6F8] rounded-2xl p-6">
                      <h3 className="text-base font-extrabold text-slate-900 mb-2 font-manrope flex items-center gap-2">
                        <Building className="w-4 h-4 text-[#0F172A]" />
                        About {activeJobDetail.company}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {activeJobDetail.aboutCompany}
                      </p>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              /* ==================== DEFAULT GRID VIEW OF JOBS ==================== */
              <div>
                {/* Top Bar above job cards */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-6">
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg font-manrope">
                      Featured Job Offers
                    </h2>
                    <p className="text-xs text-slate-500">
                      Showing <span className="font-semibold text-slate-900">{filteredJobs.length}</span> positions available
                    </p>
                  </div>

                  {/* Sort By Dropdown */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-medium">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-slate-50 text-slate-700 font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#3b8d99] cursor-pointer"
                    >
                      <option value="Newest">Newest First</option>
                      <option value="Salary">Highest Salary</option>
                      <option value="Company">Company A-Z</option>
                    </select>
                  </div>
                </div>

                {/* Active Filter Chips */}
                {(selectedCategory !== 'All' || selectedLevel !== 'All' || selectedTypes.length > 0 || selectedModels.length > 0) && (
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="text-xs text-slate-400 font-medium">Active:</span>
                    {selectedCategory !== 'All' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3b8d99]/10 text-[#3b8d99] text-xs font-semibold border border-[#3b8d99]/20">
                        {selectedCategory}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('All')} />
                      </span>
                    )}
                    {selectedLevel !== 'All' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b91c1c]/10 text-[#b91c1c] text-xs font-semibold border border-[#b91c1c]/20">
                        {selectedLevel}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedLevel('All')} />
                      </span>
                    )}
                    {selectedTypes.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
                        {t}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => toggleTypeFilter(t)} />
                      </span>
                    ))}
                    {selectedModels.map((m) => (
                      <span key={m} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                        {m}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => toggleModelFilter(m)} />
                      </span>
                    ))}
                  </div>
                )}

                {/* Job Cards Grid */}
                {filteredJobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredJobs.map((job) => {
                      const isBookmarked = savedJobs.includes(job.id);
                      return (
                        <div key={job.id}
                          className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col gap-3 cursor-pointer"
                          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease' }}
                          onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
                          onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
                        >
                          {/* Inner soft bg */}
                          <div className="bg-slate-50 rounded-2xl p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-xs shrink-0">
                                {job.logo}
                              </div>
                              <button type="button" onClick={() => toggleBookmark(job.id)}
                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                                style={{ background: isBookmarked ? '#dc2626' : '#fff', color: isBookmarked ? '#fff' : '#94a3b8', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                                aria-label="Bookmark Job">
                                <Bookmark className="w-4 h-4 fill-current" />
                              </button>
                            </div>
                            <p className="text-xs font-semibold text-slate-400 font-inter mb-0.5">{job.company}</p>
                            <h3 className="text-base font-bold text-slate-900 font-manrope mb-3">{job.title}</h3>
                            <div className="flex flex-wrap gap-1.5">
                              {[job.workModel, job.type].map((tag) => (
                                <span key={tag} className="px-3 py-1 rounded-xl text-[11px] font-semibold bg-white border border-slate-200 text-slate-600 font-inter">{tag}</span>
                              ))}
                              <span className="px-3 py-1 rounded-xl text-[11px] font-semibold bg-white border border-slate-200 text-slate-500 font-inter">{job.level}</span>
                            </div>
                          </div>

                          {/* Bottom row */}
                          <div className="flex items-center justify-between px-1">
                            <div>
                              <p className="font-extrabold text-slate-900 text-sm font-manrope">{job.salary}</p>
                              <p className="text-[11px] text-slate-400 font-inter flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />{job.location}
                              </p>
                            </div>
                            <button type="button" onClick={() => setSelectedJobId(job.id)}
                              className="px-4 py-1.5 rounded-xl text-xs font-bold border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-200 cursor-pointer">
                              Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-xs">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No Jobs Found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                      We couldn't find any job matching your current filters. Try resetting your search or filter options.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm"
                      style={{
                        background: '#b91c1c',
                      }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            )}

          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
