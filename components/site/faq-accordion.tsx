"use client";

import { useState } from "react";
import type { Faq } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={faq.q}
            className="overflow-hidden rounded-[14px] border border-line2 bg-card"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-[22px] py-[18px] text-left font-display text-[16.5px] font-bold tracking-[-0.01em] text-ink transition-colors hover:bg-panel"
            >
              {faq.q}
              <span
                className={cn(
                  "grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full border-[1.5px] border-line2 text-[15px] font-semibold text-acc transition-transform duration-200",
                  isOpen ? "rotate-45" : "rotate-0",
                )}
              >
                +
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-200 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-[22px] pb-5 text-[15px] leading-[1.65] text-body">
                  {faq.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
