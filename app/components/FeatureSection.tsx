'use client';

import React from 'react';
import { useReveal } from '../hooks/useReveal';

export default function FeatureSection() {
  const features = [
    {
      id: 'discovered',
      title: 'Be discovered by recruiters',
      description:
        'Create a standout profile and let top companies reach out directly with premium opportunities.',
      icon: (
        <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          {/* Custom Vibrant Magnifying Glass Icon */}
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transform hover:scale-110 transition-transform duration-300"
          >
            {/* Sparkle 1 */}
            <path
              d="M42 12L43.2 15.8L47 17L43.2 18.2L42 22L40.8 18.2L37 17L40.8 15.8L42 12Z"
              fill="#F59E0B"
            />
            {/* Sparkle 2 */}
            <path
              d="M47 8L47.7 10.3L50 11L47.7 11.7L47 14L46.3 11.7L44 11L46.3 10.3L47 8Z"
              fill="#F59E0B"
            />
            {/* Magnifying Glass Circle */}
            <circle
              cx="24"
              cy="24"
              r="14"
              stroke="#0F172A"
              strokeWidth="4.5"
              fill="none"
            />
            {/* Magnifying Glass Handle */}
            <path
              d="M34 34L44 44"
              stroke="#E11D48"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ),
    },
    {
      id: 'matches',
      title: 'AI-Powered Job Matches',
      description:
        'Get smart, personalized job recommendations tailored to your exact skills and career goals.',
      icon: (
        <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          {/* Custom Vibrant Bullseye Target Icon */}
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transform hover:scale-110 transition-transform duration-300"
          >
            {/* Outer Target Circle */}
            <circle
              cx="28"
              cy="28"
              r="18"
              stroke="#EC4899"
              strokeWidth="4.5"
              fill="none"
            />
            {/* Inner Target Circle */}
            <circle cx="28" cy="28" r="8" fill="#EC4899" />
            {/* Bullseye Center Point */}
            <circle cx="28" cy="28" r="3" fill="#FFFFFF" />
            {/* Arrow Shaft & Feathers */}
            <path
              d="M14 42L22 34"
              stroke="#0F172A"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M12 44L16 40"
              stroke="#F59E0B"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M14 46L18 42"
              stroke="#0F172A"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Target Stand Tripod */}
            <path
              d="M20 44L24 38"
              stroke="#0F172A"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M36 44L32 38"
              stroke="#0F172A"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ),
    },
    {
      id: 'profile',
      title: 'Verified Badges & Credentials',
      hasLink: true,
      description:
        'Fast-track your application with identity & skill verification on SEEK Pass.',
      icon: (
        <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          {/* Custom Vibrant Certificate & Badge Icon */}
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transform hover:scale-110 transition-transform duration-300"
          >
            {/* Certificate Card */}
            <rect
              x="12"
              y="10"
              width="28"
              height="36"
              rx="4"
              fill="#F472B6"
            />
            <rect
              x="16"
              y="16"
              width="20"
              height="3"
              rx="1.5"
              fill="#FFFFFF"
              opacity="0.8"
            />
            <rect
              x="16"
              y="22"
              width="14"
              height="3"
              rx="1.5"
              fill="#FFFFFF"
              opacity="0.8"
            />
            {/* Gold Seal Star */}
            <circle cx="26" cy="34" r="5" fill="#F59E0B" />
            
            {/* Verified Badge Overlay */}
            <circle cx="40" cy="38" r="10" fill="#6366F1" />
            <path
              d="M36 38L39 41L45 35"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ),
    },
  ];

  const gridRef = useReveal({ threshold: 0.1 }) as React.RefObject<HTMLDivElement>;

  return (
    <section className="bg-[#fafbfc] py-16 sm:py-20 border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={gridRef} className="reveal-stagger grid grid-cols-1 md:grid-cols-3 gap-5 text-center">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex flex-col items-center bg-white rounded-3xl p-8 cursor-pointer group"
              style={{
                border: "1px solid #f1f5f9",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(0,0,0,0.09)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)";
              }}
            >
              {feature.icon}
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-manrope mb-3 tracking-tight group-hover:text-[#dc2626] transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 font-inter leading-relaxed">
                {feature.hasLink ? (
                  <>
                    Fast-track your application with identity &amp; skill verification on{' '}
                    <a href="#seek-pass" className="underline font-semibold text-slate-700 hover:text-[#dc2626] transition-colors">
                      SEEK Pass
                    </a>.
                  </>
                ) : (
                  feature.description
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
