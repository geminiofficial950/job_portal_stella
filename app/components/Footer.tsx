"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const socialLinks = [
    {
      label: "Twitter / X",
      href: "#",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: "#",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: "#",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      label: "GitHub",
      href: "#",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      ),
    },
  ];

  const footerLinks = {
    jobSeekers: [
      { name: "Browse Jobs", href: "#" },
      { name: "Career Advice", href: "#" },
      { name: "Salary Calculator", href: "#" },
      { name: "Resume Builder", href: "#" },
      { name: "SEEK Pass Credentials", href: "#" },
    ],
    employers: [
      { name: "Post a Job", href: "#" },
      { name: "Search Resumes", href: "#" },
      { name: "Employer Branding", href: "#" },
      { name: "Recruitment Solutions", href: "#" },
      { name: "Pricing Plans", href: "#" },
    ],
    company: [
      { name: "About SEEK", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press & News", href: "#" },
      { name: "Investor Relations", href: "#" },
      { name: "Contact Support", href: "#" },
    ],
  };

  const bannerRef = useReveal() as React.RefObject<HTMLDivElement>;
  const linksRef  = useReveal({ threshold: 0.08 }) as React.RefObject<HTMLDivElement>;

  return (
    <footer className="relative bg-[#b91c1c] text-slate-300 font-inter overflow-hidden">
      {/* Top Accent Gradient Bar matching Frost Theme */}
      <div
        className="w-full h-1"
        style={{
          background:
            "#dc2626",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        {/* Full-Width Premium Newsletter Banner */}
        <div ref={bannerRef} className="reveal bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 lg:p-10 mb-14 shadow-xl backdrop-blur-md">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-manrope tracking-tight">
                Get Weekly Job Alerts
              </h3>
              <p className="text-sm sm:text-base text-slate-300 mt-1.5 font-normal font-inter max-w-xl">
                Join 100,000+ professionals receiving curated career
                opportunities directly in their inbox.
              </p>
            </div>

            {/* Right Form Input */}
            <div className="w-full lg:w-auto shrink-0">
              {subscribed ? (
                <div className="bg-[#dc2626]/20 border border-[#dc2626]/50 text-white text-sm font-semibold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2">
                  <span className="text-lg">✨</span> Thank you for subscribing!
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row items-stretch gap-3 w-full sm:w-auto"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    required
                    className="w-full sm:w-80 lg:w-96 bg-slate-950/90 text-white placeholder:text-slate-400 text-sm px-4 py-3.5 rounded-2xl border border-slate-800 focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-7 py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer hover:opacity-95 active:scale-95 shrink-0 shadow-lg"
                    style={{
                      background: "#dc2626",
                      boxShadow: "0 4px 20px rgba(38,202,211,0.35)",
                    }}
                  >
                    <span>Subscribe</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Main Links & Brand Grid (4 Columns) */}
        <div ref={linksRef} className="reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-slate-800">
          {/* Column 1: Brand Info & Socials */}
          <div className="space-y-5">
            <Link href="/" className="inline-block">
              <img
                src="/logo.webp"
                alt="SEEK Logo"
                className="h-9 w-auto object-contain brightness-125"
              />
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering millions of job seekers and businesses worldwide to
              find the perfect career match.
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-1">
              {socialLinks.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:border-[#3b8d99] hover:bg-[#3b8d99]/20 transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Job Seekers */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-bold tracking-wider uppercase font-manrope">
              Job Seekers
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {footerLinks.jobSeekers.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Employers */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-bold tracking-wider uppercase font-manrope">
              Employers
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {footerLinks.employers.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-bold tracking-wider uppercase font-manrope">
              Company
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex items-center justify-center text-xs text-slate-500">
          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            <a href="#" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Security
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
