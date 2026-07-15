"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Trash2, Plus, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import { Panel } from "@/components/admin/ui";
import { TESTIMONIALS, type Testimonial } from "@/lib/mock-data";
import {
  useStoredTestimonials,
  addStoredTestimonial,
  removeStoredTestimonial,
} from "@/lib/testimonials-store";
import { cn } from "@/lib/utils";

const INDUSTRIES = ["HVAC", "Plumbing", "Restoration"];

export function TestimonialsView() {
  const { toast } = useToast();
  const stored = useStoredTestimonials();

  const [form, setForm] = useState({
    quote: "",
    name: "",
    business: "",
    location: "",
    industry: INDUSTRIES[0],
    rating: 5,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.quote.trim() || !form.name.trim()) {
      toast({
        variant: "info",
        title: "Add a quote and a name",
        description: "Both are needed before it can go on the landing page.",
      });
      return;
    }
    addStoredTestimonial({
      id: `custom-${Date.now()}`,
      quote: form.quote.trim(),
      name: form.name.trim(),
      business: form.business.trim() || "-",
      location: form.location.trim() || "-",
      industry: form.industry,
      rating: form.rating,
    });
    toast({
      title: "Testimonial published",
      description: "It's now live on the landing page.",
    });
    setForm({
      quote: "",
      name: "",
      business: "",
      location: "",
      industry: INDUSTRIES[0],
      rating: 5,
    });
  }

  function remove(t: Testimonial) {
    removeStoredTestimonial(t.id);
    toast({ variant: "info", title: "Testimonial removed" });
  }

  const inputCls =
    "rounded-[10px] border-[1.5px] border-line2 bg-card2 px-[13px] py-[11px] text-[14px] text-ink placeholder:text-mute";

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink">
            Testimonials
          </h1>
          <p className="mt-1 text-[14.5px] text-body">
            Add customer quotes here. They publish straight to the landing page.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-line2 px-4 py-[9px] text-[13.5px] font-bold text-ink hover:border-acc hover:text-acc"
        >
          <ExternalLink size={15} /> View on site
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Add form */}
        <Panel className="h-fit p-6">
          <h2 className="mb-4 font-display text-[16px] font-bold text-ink">
            Add a testimonial
          </h2>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-[6px]">
              <span className="text-[12.5px] font-bold text-ink">Quote</span>
              <textarea
                rows={4}
                className={cn(inputCls, "resize-y leading-[1.5]")}
                placeholder="First week on Ring Relay it booked eleven jobs I'd never have seen..."
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-[6px]">
                <span className="text-[12.5px] font-bold text-ink">Name</span>
                <input
                  className={inputCls}
                  placeholder="Dave Kowalski"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-[6px]">
                <span className="text-[12.5px] font-bold text-ink">Business</span>
                <input
                  className={inputCls}
                  placeholder="Kowalski Heating & Air"
                  value={form.business}
                  onChange={(e) => setForm({ ...form, business: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-[6px]">
                <span className="text-[12.5px] font-bold text-ink">Location</span>
                <input
                  className={inputCls}
                  placeholder="Denver, CO"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-[6px]">
                <span className="text-[12.5px] font-bold text-ink">Industry</span>
                <select
                  className={inputCls}
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                >
                  {INDUSTRIES.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="text-[12.5px] font-bold text-ink">Rating</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    onClick={() => setForm({ ...form, rating: n })}
                    className="p-1"
                  >
                    <Star
                      size={22}
                      className={
                        n <= form.rating
                          ? "fill-acc text-acc"
                          : "fill-none text-line2"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-acc px-5 py-3 text-[14.5px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-acc-b"
            >
              <Plus size={16} strokeWidth={2.6} /> Publish to landing page
            </button>
          </form>
        </Panel>

        {/* Current list */}
        <div className="flex flex-col gap-4">
          {stored.map((t) => (
            <TestimonialRow key={t.id} t={t} onRemove={() => remove(t)} />
          ))}
          {TESTIMONIALS.map((t) => (
            <TestimonialRow key={t.id} t={t} isDefault />
          ))}
        </div>
      </div>
    </div>
  );
}

function TestimonialRow({
  t,
  isDefault,
  onRemove,
}: {
  t: Testimonial;
  isDefault?: boolean;
  onRemove?: () => void;
}) {
  return (
    <div className="rounded-[14px] border border-line2 bg-card p-5 shadow-soft">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex gap-[3px]">
          {Array.from({ length: 5 }).map((_, s) => (
            <Star
              key={s}
              size={14}
              className={s < t.rating ? "fill-acc text-acc" : "fill-none text-line2"}
            />
          ))}
        </div>
        {isDefault ? (
          <span className="rounded-full border border-line2 bg-panel px-[10px] py-[2px] text-[11px] font-semibold text-mute">
            Seed
          </span>
        ) : (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove testimonial"
            className="inline-flex items-center gap-1 rounded-full border border-line2 px-[10px] py-[3px] text-[11.5px] font-semibold text-mute transition-colors hover:border-acc hover:text-acc"
          >
            <Trash2 size={13} /> Remove
          </button>
        )}
      </div>
      <p className="text-[14px] leading-[1.55] text-bubble-ink">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="mt-3 text-[13px] font-semibold text-ink">
        {t.name}{" "}
        <span className="font-normal text-mute">
          · {t.business} · {t.location}
        </span>
      </div>
    </div>
  );
}
