"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export type PayPeriod = "year" | "month" | "hour";

type OpenPanel = "pay" | "type" | "remote" | null;

type Props = {
  enabled: boolean;
  payPeriod: PayPeriod;
  payMin: string;
  payMax: string;
  selectedTypes: string[];
  selectedModels: string[];
  onPayPeriodChange: (period: PayPeriod) => void;
  onPayMinChange: (value: string) => void;
  onPayMaxChange: (value: string) => void;
  onToggleType: (type: string) => void;
  onToggleModel: (model: string) => void;
  /** True once user touches Pay tabs or range inputs */
  payFilterActive?: boolean;
};

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "full-time", label: "Full time" },
  { value: "part-time", label: "Part time" },
  { value: "contract", label: "Contract/Temp" },
  { value: "casual", label: "Casual/Vacation" },
];

const REMOTE_OPTIONS: { value: string; label: string }[] = [
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

const PAY_TABS: { value: PayPeriod; label: string }[] = [
  { value: "year", label: "Annually" },
  { value: "month", label: "Monthly" },
  { value: "hour", label: "Hourly" },
];

export default function JobsSeekFilters({
  enabled,
  payPeriod,
  payMin,
  payMax,
  selectedTypes,
  selectedModels,
  onPayPeriodChange,
  onPayMinChange,
  onPayMaxChange,
  onToggleType,
  onToggleModel,
  payFilterActive = false,
}: Props) {
  const [open, setOpen] = useState<OpenPanel>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const payId = useId();

  useEffect(() => {
    if (!enabled) setOpen(null);
  }, [enabled]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function toggle(panel: OpenPanel) {
    if (!enabled || !panel) return;
    setOpen((prev) => (prev === panel ? null : panel));
  }

  const payActive =
    payFilterActive || Boolean(payMin.trim() || payMax.trim());
  const typeActive = selectedTypes.length > 0;
  const remoteActive = selectedModels.length > 0;

  return (
    <div
      ref={rootRef}
      className={`jobs-seek-filters${enabled ? "" : " is-disabled"}`}
      aria-disabled={!enabled}
    >
      <div className="jobs-seek-filters-bar">
        <div className="jobs-seek-chip-wrap">
          <button
            type="button"
            className={`jobs-seek-chip${open === "pay" ? " is-open" : ""}${
              payActive ? " is-active" : ""
            }`}
            disabled={!enabled}
            aria-expanded={open === "pay"}
            onClick={() => toggle("pay")}
          >
            Pay
            {open === "pay" ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          {open === "pay" ? (
            <div className="jobs-seek-panel jobs-seek-panel--pay" role="dialog">
              <div className="jobs-seek-pay-tabs" role="tablist">
                {PAY_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={payPeriod === tab.value}
                    className={`jobs-seek-pay-tab${
                      payPeriod === tab.value ? " is-selected" : ""
                    }`}
                    onClick={() => onPayPeriodChange(tab.value)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="jobs-seek-pay-inputs">
                <label className="jobs-seek-pay-field" htmlFor={`${payId}-min`}>
                  <span>From · AUD</span>
                  <input
                    id={`${payId}-min`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    placeholder={
                      payPeriod === "hour"
                        ? "e.g. 35"
                        : payPeriod === "month"
                          ? "e.g. 5000"
                          : "e.g. 70000"
                    }
                    value={payMin}
                    onChange={(e) => onPayMinChange(e.target.value)}
                  />
                </label>
                <label className="jobs-seek-pay-field" htmlFor={`${payId}-max`}>
                  <span>To · AUD</span>
                  <input
                    id={`${payId}-max`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    placeholder={
                      payPeriod === "hour"
                        ? "e.g. 80"
                        : payPeriod === "month"
                          ? "e.g. 10000"
                          : "e.g. 120000"
                    }
                    value={payMax}
                    onChange={(e) => onPayMaxChange(e.target.value)}
                  />
                </label>
              </div>
            </div>
          ) : null}
        </div>

        <div className="jobs-seek-chip-wrap">
          <button
            type="button"
            className={`jobs-seek-chip${open === "type" ? " is-open" : ""}${
              typeActive ? " is-active" : ""
            }`}
            disabled={!enabled}
            aria-expanded={open === "type"}
            onClick={() => toggle("type")}
          >
            Type
            {open === "type" ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          {open === "type" ? (
            <div className="jobs-seek-panel" role="dialog">
              <ul className="jobs-seek-check-list">
                {TYPE_OPTIONS.map((opt) => (
                  <li key={opt.value}>
                    <label className="jobs-seek-check">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(opt.value)}
                        onChange={() => onToggleType(opt.value)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="jobs-seek-chip-wrap">
          <button
            type="button"
            className={`jobs-seek-chip${open === "remote" ? " is-open" : ""}${
              remoteActive ? " is-active" : ""
            }`}
            disabled={!enabled}
            aria-expanded={open === "remote"}
            onClick={() => toggle("remote")}
          >
            Remote
            {open === "remote" ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          {open === "remote" ? (
            <div className="jobs-seek-panel" role="dialog">
              <ul className="jobs-seek-check-list">
                {REMOTE_OPTIONS.map((opt) => (
                  <li key={opt.value}>
                    <label className="jobs-seek-check">
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(opt.value)}
                        onChange={() => onToggleModel(opt.value)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Convert a salary amount into the filter period for overlap checks. */
export function salaryInPeriod(
  amount: number,
  fromPeriod: string,
  toPeriod: PayPeriod,
): number {
  const annual = (() => {
    switch (fromPeriod) {
      case "hour":
        return amount * 38 * 52;
      case "day":
        return amount * 5 * 52;
      case "week":
        return amount * 52;
      case "month":
        return amount * 12;
      case "year":
      default:
        return amount;
    }
  })();

  switch (toPeriod) {
    case "hour":
      return annual / (38 * 52);
    case "month":
      return annual / 12;
    case "year":
    default:
      return annual;
  }
}

/** Parse From/To — small annual/monthly figures are treated as thousands (70 → 70,000). */
function parsePayBound(raw: string, period: PayPeriod): number | null {
  const trimmed = raw.trim().replace(/,/g, "");
  if (!trimmed) return null;
  let n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;

  if (period === "year" && n > 0 && n < 1000) n *= 1000;
  if (period === "month" && n > 0 && n < 200) n *= 1000;

  return n;
}

export function jobMatchesPayRange(
  job: {
    salaryMin: number;
    salaryMax: number;
    salaryPeriod: string;
  },
  payPeriod: PayPeriod,
  payMin: string,
  payMax: string,
  /** When false, Pay filter is inactive (don't filter). */
  payFilterActive = true,
): boolean {
  if (!payFilterActive) return true;

  let from = parsePayBound(payMin, payPeriod);
  let to = parsePayBound(payMax, payPeriod);

  // Swap if user typed range backwards
  if (from != null && to != null && from > to) {
    const tmp = from;
    from = to;
    to = tmp;
  }

  const hasPay = job.salaryMin > 0 || job.salaryMax > 0;
  const jobPeriod = (job.salaryPeriod || "year").toLowerCase();

  // Period tab alone (no From/To): show jobs paid in that period.
  if (from == null && to == null) {
    if (!hasPay) return false;
    return jobPeriod === payPeriod;
  }

  if (!hasPay) return false;

  const rawMin = job.salaryMin > 0 ? job.salaryMin : job.salaryMax;
  const rawMax = job.salaryMax > 0 ? job.salaryMax : job.salaryMin;
  const min = salaryInPeriod(rawMin, jobPeriod, payPeriod);
  const max = salaryInPeriod(rawMax, jobPeriod, payPeriod);

  if (from != null && max < from) return false;
  if (to != null && min > to) return false;
  return true;
}
