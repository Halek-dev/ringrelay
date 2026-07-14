"use client";

import { Star } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { Eyebrow } from "@/components/site/section";
import { TESTIMONIALS, type Testimonial } from "@/lib/mock-data";
import { useStoredTestimonials } from "@/lib/testimonials-store";

export function Testimonials() {
  // Seed data renders on the server; admin-added ones merge in after mount.
  const stored = useStoredTestimonials();
  const all: Testimonial[] = [...stored, ...TESTIMONIALS];

  return (
    <section className="relative mx-auto max-w-[1280px] px-6 py-16 md:px-10">
      <Reveal className="mb-12 text-center">
        <Eyebrow>From the trades</Eyebrow>
        <h2 className="mx-auto mt-4 max-w-[620px] text-balance font-display text-[34px] font-extrabold tracking-[-0.03em] text-ink">
          Owners who stopped missing calls.
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {all.slice(0, 6).map((t, i) => (
          <Reveal
            key={t.id}
            delay={(i % 3) * 80}
            className="flex flex-col rounded-[20px] border border-line2 bg-gradient-to-b from-card to-card2 p-7 shadow-soft"
          >
            <div className="mb-4 flex gap-[3px]">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star
                  key={s}
                  size={16}
                  className={
                    s < t.rating ? "fill-acc text-acc" : "fill-none text-line2"
                  }
                  strokeWidth={2}
                />
              ))}
            </div>
            <p className="flex-1 text-pretty text-[15.5px] leading-[1.6] text-bubble-ink">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-6 border-t border-line pt-4">
              <div className="font-display text-[15px] font-bold text-ink">
                {t.name}
              </div>
              <div className="mt-[2px] text-[13.5px] text-body">
                {t.business} · {t.location}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
