"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Eyebrow } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { PrimaryCta } from "@/components/site/buttons";

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/**
 * Turns the abstract "missed calls" problem into a personalized dollar figure.
 * All local math — no data leaves the browser.
 */
export function RoiCalculator() {
  const [missedPerWeek, setMissed] = useState(8);
  const [jobValue, setJobValue] = useState(390);
  const [closeRate, setCloseRate] = useState(40);

  const recoveredJobsPerMonth = (missedPerWeek * 4.3 * closeRate) / 100;
  const monthlyLost = recoveredJobsPerMonth * jobValue;
  const yearlyLost = monthlyLost * 12;

  return (
    <section className="relative mx-auto max-w-[1080px] px-6 py-16 md:px-10">
      <Reveal className="mb-10 text-center">
        <Eyebrow>Do the math</Eyebrow>
        <h2 className="mx-auto mt-4 max-w-[620px] text-balance font-display text-[34px] font-extrabold tracking-[-0.03em] text-ink">
          What are missed calls actually costing you?
        </h2>
      </Reveal>

      <Reveal className="grid grid-cols-1 overflow-hidden rounded-[24px] border border-line2 bg-card shadow-card lg:grid-cols-[1.1fr_0.9fr]">
        {/* Inputs */}
        <div className="flex flex-col gap-8 p-8 md:p-10">
          <Slider
            label="Calls you miss per week"
            value={missedPerWeek}
            min={1}
            max={40}
            onChange={setMissed}
            format={(v) => `${v}`}
          />
          <Slider
            label="Average value of a job"
            value={jobValue}
            min={100}
            max={2000}
            step={10}
            onChange={setJobValue}
            format={(v) => money(v)}
          />
          <Slider
            label="Share you'd close if you answered"
            value={closeRate}
            min={10}
            max={90}
            step={5}
            onChange={setCloseRate}
            format={(v) => `${v}%`}
          />
        </div>

        {/* Result */}
        <div className="relative flex flex-col justify-center gap-2 overflow-hidden bg-ink p-8 md:p-10">
          <div className="hazard-stripe-onink absolute inset-x-0 top-0 h-1" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Left on the table
          </span>
          <div className="font-display text-[46px] font-extrabold leading-none tracking-[-0.03em] text-white">
            {money(monthlyLost)}
            <span className="text-[20px] font-bold text-white/50"> / mo</span>
          </div>
          <div className="mt-1 inline-flex items-center gap-2 text-[14.5px] font-semibold text-[color:var(--acc-a)]">
            <TrendingUp size={16} />
            {money(yearlyLost)} a year in lost jobs
          </div>
          <p className="mt-4 text-[14px] leading-[1.6] text-white/70">
            That&apos;s roughly{" "}
            <strong className="text-white">
              {recoveredJobsPerMonth.toFixed(1)} jobs a month
            </strong>{" "}
            Ring Relay could book while you&apos;re on site — for a flat monthly
            fee that&apos;s a fraction of it.
          </p>
          <div className="mt-6">
            <PrimaryCta href="/contact">Recover these calls</PrimaryCta>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[14.5px] font-semibold text-body">{label}</span>
        <span className="font-display text-[20px] font-extrabold tracking-[-0.02em] text-ink">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="h-[6px] w-full cursor-pointer appearance-none rounded-full outline-none [&::-moz-range-thumb]:h-[20px] [&::-moz-range-thumb]:w-[20px] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-acc [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-acc [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(234,88,12,0.5)]"
        style={{
          background: `linear-gradient(90deg, var(--acc) ${pct}%, var(--panel) ${pct}%)`,
        }}
      />
    </div>
  );
}
