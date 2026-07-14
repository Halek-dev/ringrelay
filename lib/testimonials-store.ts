"use client";

import { useEffect, useState } from "react";
import type { Testimonial } from "@/lib/mock-data";

/**
 * Client-side testimonials store backed by localStorage. Lets the admin add
 * testimonials that show up on the public landing page without a backend.
 *
 * TODO(phase 2): replace with a Supabase `testimonials` table + published flag.
 */
const KEY = "rr_testimonials";
const EVENT = "rr_testimonials_changed";

export function getStoredTestimonials(): Testimonial[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Testimonial[]) : [];
  } catch {
    return [];
  }
}

function persist(list: Testimonial[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
  // Notify same-tab listeners ("storage" only fires in *other* tabs).
  window.dispatchEvent(new Event(EVENT));
}

export function addStoredTestimonial(t: Testimonial) {
  persist([t, ...getStoredTestimonials()]);
}

export function removeStoredTestimonial(id: string) {
  persist(getStoredTestimonials().filter((t) => t.id !== id));
}

/** Reactive hook returning the admin-added testimonials. */
export function useStoredTestimonials(): Testimonial[] {
  const [list, setList] = useState<Testimonial[]>([]);

  useEffect(() => {
    const sync = () => setList(getStoredTestimonials());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return list;
}
