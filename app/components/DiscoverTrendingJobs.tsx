"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  MapPin,
  UserRound,
} from "lucide-react";

type TabId = "locations" | "roles" | "industries";

type TrendItem = {
  label: string;
  count: number;
  href: string;
};

const LOCATION_ITEMS: TrendItem[] = [
  { label: "Jobs in Sydney, NSW", count: 914, href: "/jobs?country=au&location=Sydney" },
  { label: "Jobs in Melbourne, VIC", count: 882, href: "/jobs?country=au&location=Melbourne" },
  { label: "Jobs in Brisbane, QLD", count: 641, href: "/jobs?country=au&location=Brisbane" },
  { label: "Jobs in Perth, WA", count: 528, href: "/jobs?country=au&location=Perth" },
  { label: "Jobs in Adelaide, SA", count: 412, href: "/jobs?country=au&location=Adelaide" },
  { label: "Jobs in Canberra, ACT", count: 298, href: "/jobs?country=au&location=Canberra" },
  { label: "Jobs in Gold Coast, QLD", count: 276, href: "/jobs?country=au&location=Gold+Coast" },
  { label: "Jobs in Newcastle, NSW", count: 214, href: "/jobs?country=au&location=Newcastle" },
  { label: "Jobs in Wollongong, NSW", count: 168, href: "/jobs?country=au&location=Wollongong" },
  { label: "Jobs in Hobart, TAS", count: 142, href: "/jobs?country=au&location=Hobart" },
  { label: "Jobs in Geelong, VIC", count: 131, href: "/jobs?country=au&location=Geelong" },
  { label: "Jobs in Cairns, QLD", count: 118, href: "/jobs?country=au&location=Cairns" },
  { label: "Jobs in Darwin, NT", count: 96, href: "/jobs?country=au&location=Darwin" },
  { label: "Jobs in Townsville, QLD", count: 88, href: "/jobs?country=au&location=Townsville" },
  { label: "Jobs in Sunshine Coast, QLD", count: 79, href: "/jobs?country=au&location=Sunshine+Coast" },
];

const ROLE_ITEMS: TrendItem[] = [
  { label: "Registered Nurse jobs", count: 620, href: "/jobs?country=au&q=Registered+Nurse" },
  { label: "Software Engineer jobs", count: 548, href: "/jobs?country=au&q=Software+Engineer" },
  { label: "Project Manager jobs", count: 412, href: "/jobs?country=au&q=Project+Manager" },
  { label: "Accountant jobs", count: 386, href: "/jobs?country=au&q=Accountant" },
  { label: "Sales Consultant jobs", count: 354, href: "/jobs?country=au&q=Sales+Consultant" },
  { label: "Customer Service jobs", count: 331, href: "/jobs?country=au&q=Customer+Service" },
  { label: "Warehouse Operator jobs", count: 298, href: "/jobs?country=au&q=Warehouse" },
  { label: "Electrician jobs", count: 274, href: "/jobs?country=au&q=Electrician" },
  { label: "Teacher jobs", count: 256, href: "/jobs?country=au&q=Teacher" },
  { label: "Marketing Manager jobs", count: 221, href: "/jobs?country=au&q=Marketing+Manager" },
  { label: "Data Analyst jobs", count: 198, href: "/jobs?country=au&q=Data+Analyst" },
  { label: "HR Advisor jobs", count: 176, href: "/jobs?country=au&q=HR+Advisor" },
  { label: "Chef jobs", count: 164, href: "/jobs?country=au&q=Chef" },
  { label: "Truck Driver jobs", count: 152, href: "/jobs?country=au&q=Truck+Driver" },
  { label: "Business Analyst jobs", count: 141, href: "/jobs?country=au&q=Business+Analyst" },
];

const INDUSTRY_ITEMS: TrendItem[] = [
  { label: "Healthcare & Medical", count: 1240, href: "/jobs?country=au&q=Healthcare" },
  { label: "Information Technology", count: 980, href: "/jobs?country=au&q=Information+Technology" },
  { label: "Construction", count: 760, href: "/jobs?country=au&q=Construction" },
  { label: "Education & Training", count: 640, href: "/jobs?country=au&q=Education" },
  { label: "Accounting & Finance", count: 590, href: "/jobs?country=au&q=Finance" },
  { label: "Retail & Consumer", count: 520, href: "/jobs?country=au&q=Retail" },
  { label: "Engineering", count: 470, href: "/jobs?country=au&q=Engineering" },
  { label: "Hospitality & Tourism", count: 430, href: "/jobs?country=au&q=Hospitality" },
  { label: "Government & Defence", count: 390, href: "/jobs?country=au&q=Government" },
  { label: "Mining & Resources", count: 350, href: "/jobs?country=au&q=Mining" },
  { label: "Transport & Logistics", count: 320, href: "/jobs?country=au&q=Logistics" },
  { label: "Sales & Marketing", count: 300, href: "/jobs?country=au&q=Sales" },
  { label: "Community Services", count: 280, href: "/jobs?country=au&q=Community" },
  { label: "Legal", count: 210, href: "/jobs?country=au&q=Legal" },
  { label: "Science & Tech", count: 190, href: "/jobs?country=au&q=Science" },
];

const TABS: {
  id: TabId;
  label: string;
  Icon: typeof MapPin;
}[] = [
  { id: "locations", label: "Top Locations", Icon: MapPin },
  { id: "roles", label: "Top Roles", Icon: UserRound },
  { id: "industries", label: "Top Industries", Icon: Building2 },
];

function itemsForTab(tab: TabId): TrendItem[] {
  if (tab === "roles") return ROLE_ITEMS;
  if (tab === "industries") return INDUSTRY_ITEMS;
  return LOCATION_ITEMS;
}

function iconForTab(tab: TabId) {
  if (tab === "roles") return Briefcase;
  if (tab === "industries") return Building2;
  return MapPin;
}

/** Discover trending AU jobs — locations / roles / industries */
export default function DiscoverTrendingJobs() {
  const [tab, setTab] = useState<TabId>("locations");
  const items = itemsForTab(tab);
  const ItemIcon = iconForTab(tab);

  return (
    <section className="discover-trending relative overflow-hidden bg-[#c8f066] py-14 sm:py-16 lg:py-20">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 10% 0%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(ellipse 45% 50% at 95% 80%, rgba(79,108,245,0.12), transparent 50%), linear-gradient(180deg, #d4f57a 0%, #c8f066 55%, #b8e055 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-8 lg:px-10">
        <div className="max-w-3xl text-left">
          <h2 className="text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-black sm:text-4xl lg:text-[2.75rem]">
            Discover trending{" "}
            <span className="italic text-[#4f6cf5]">jobs</span>
          </h2>
          <p className="mt-3 max-w-xl text-[15px] font-medium leading-relaxed text-black/80 sm:text-base">
            Explore top Australian locations, roles and industries — then jump
            straight into matching openings.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-black/10 bg-white/70 p-1.5 backdrop-blur-sm sm:gap-1 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`relative inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors sm:rounded-none sm:px-4 sm:py-3 ${
                  active
                    ? "bg-[#4f6cf5] text-white sm:bg-transparent sm:text-[#4f6cf5]"
                    : "text-black/70 hover:bg-black/5 hover:text-black sm:hover:bg-transparent"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2.4} />
                {label}
                {active ? (
                  <span className="absolute inset-x-2 bottom-0 hidden h-[3px] rounded-full bg-[#4f6cf5] sm:block" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-2 hidden border-b-2 border-black/15 sm:block" />

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="group relative flex items-start gap-3 rounded-2xl border-2 border-black/10 bg-transparent px-4 py-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-[#4f6cf5] hover:shadow-[0_16px_36px_-18px_rgba(15,23,42,0.35)]"
            >
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/10 text-[#0f172a] transition group-hover:bg-[#4f6cf5] group-hover:text-white">
                <ItemIcon className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold leading-snug text-[#0f172a] transition group-hover:text-[#4f6cf5]">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[13px] font-medium text-black/65">
                  {item.count.toLocaleString("en-AU")} jobs available
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
