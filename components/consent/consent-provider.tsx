"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import {
  ACCEPTED_ALL,
  CATEGORY_INFO,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  REJECTED_ALL,
  type ConsentState,
  type OptionalCategory,
} from "@/lib/consent/config";
import { cn } from "@/lib/utils";

/**
 * Consent is stored in localStorage with a timestamp and version rather than
 * server side. Tradeoff, stated plainly: localStorage keeps the record on the
 * visitor's device (no server table of visitor identities is needed, which is
 * itself data minimizing), but the record is per browser and we cannot prove
 * a specific person consented. For a site with no accounts for visitors and
 * no non essential cookies today, that is proportionate. If analytics are
 * ever added, revisit storing a server side consent receipt.
 */

type ConsentCtx = {
  /** null while loading, or when no valid consent record exists yet. */
  consent: ConsentState | null;
  /** True once localStorage has been read (avoids banner flash). */
  ready: boolean;
  hasConsent: (category: OptionalCategory) => boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  saveChoices: (categories: ConsentState["categories"]) => void;
  openPreferences: () => void;
};

const Ctx = createContext<ConsentCtx | null>(null);

export function useConsent(): ConsentCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConsent must be used within <ConsentProvider>");
  return ctx;
}

/**
 * Gate for any future non essential script: renders children only after the
 * visitor has opted in to the given category. Analytics must load through
 * this (or check useConsent) so nothing fires before consent.
 */
export function ConsentGate({
  category,
  children,
}: {
  category: OptionalCategory;
  children: ReactNode;
}) {
  const { hasConsent } = useConsent();
  return hasConsent(category) ? <>{children}</> : null;
}

function readStored(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    // A version bump invalidates old consent and re-prompts.
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  useEffect(() => {
    setConsent(readStored());
    setReady(true);
  }, []);

  const persist = useCallback((categories: ConsentState["categories"]) => {
    const state: ConsentState = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      categories,
    };
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private mode: the choice still applies for this page view */
    }
    setConsent(state);
    setPrefsOpen(false);
  }, []);

  const value: ConsentCtx = {
    consent,
    ready,
    hasConsent: (c) => consent?.categories[c] === true,
    acceptAll: () => persist(ACCEPTED_ALL),
    rejectAll: () => persist(REJECTED_ALL),
    saveChoices: persist,
    openPreferences: () => setPrefsOpen(true),
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <ConsentUI
        ready={ready}
        consent={consent}
        prefsOpen={prefsOpen}
        onClosePrefs={() => setPrefsOpen(false)}
        ctx={value}
      />
    </Ctx.Provider>
  );
}

function ConsentUI({
  ready,
  consent,
  prefsOpen,
  onClosePrefs,
  ctx,
}: {
  ready: boolean;
  consent: ConsentState | null;
  prefsOpen: boolean;
  onClosePrefs: () => void;
  ctx: ConsentCtx;
}) {
  const pathname = usePathname();
  // The admin console is an internal authenticated tool, not a public page.
  const isAdmin = pathname?.startsWith("/admin");
  const showBanner = ready && !consent && !prefsOpen && !isAdmin;

  if (!showBanner && !prefsOpen) return null;

  return (
    <>
      {showBanner && <Banner ctx={ctx} />}
      {prefsOpen && <PreferenceCentre ctx={ctx} onClose={onClosePrefs} />}
    </>
  );
}

const btnBase =
  "inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-[11px] text-[14px] font-bold transition-colors";

function Banner({ ctx }: { ctx: ConsentCtx }) {
  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-line2 bg-card p-4 shadow-[0_-12px_40px_rgba(15,27,45,0.12)] sm:p-5"
    >
      <div className="mx-auto flex max-w-[1080px] flex-col gap-4 lg:flex-row lg:items-center">
        <p className="flex-1 text-[13.5px] leading-[1.55] text-body">
          We use strictly necessary cookies to run this site. With your
          permission we would also use optional cookies by category. Nothing
          optional is set unless you allow it, and you can change your mind any
          time. Details in the{" "}
          <Link href="/cookies" className="font-bold text-acc-dim underline">
            cookie policy
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-bold text-acc-dim underline">
            privacy policy
          </Link>
          .
        </p>
        {/* Accept and Reject are identical in style and placement, by design. */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={ctx.rejectAll}
            className={cn(btnBase, "bg-ink text-bg hover:bg-acc hover:text-white")}
          >
            Reject all
          </button>
          <button
            type="button"
            onClick={ctx.acceptAll}
            className={cn(btnBase, "bg-ink text-bg hover:bg-acc hover:text-white")}
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={ctx.openPreferences}
            className={cn(
              btnBase,
              "border-[1.5px] border-line2 text-ink hover:border-acc hover:text-acc",
            )}
          >
            Customize
          </button>
        </div>
      </div>
    </div>
  );
}

function PreferenceCentre({
  ctx,
  onClose,
}: {
  ctx: ConsentCtx;
  onClose: () => void;
}) {
  // Everything optional starts OFF unless previously consented. Never pre
  // ticked.
  const [choices, setChoices] = useState<ConsentState["categories"]>({
    analytics: ctx.consent?.categories.analytics ?? false,
    marketing: ctx.consent?.categories.marketing ?? false,
  });

  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-ink/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-label="Cookie preferences"
        className="max-h-[85vh] w-full max-w-[520px] overflow-y-auto rounded-[18px] border border-line2 bg-card p-6 shadow-card"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[19px] font-extrabold tracking-[-0.02em] text-ink">
            Cookie preferences
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full border border-line2 text-mute hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {CATEGORY_INFO.map((cat) => (
            <div
              key={cat.key}
              className="rounded-[12px] border border-line2 bg-card2 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[14.5px] font-bold text-ink">{cat.name}</span>
                {cat.alwaysOn ? (
                  <span className="rounded-full border border-line2 bg-panel px-3 py-[3px] text-[11.5px] font-bold text-mute">
                    Always on
                  </span>
                ) : (
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={choices[cat.key as OptionalCategory]}
                      onChange={(e) =>
                        setChoices((c) => ({
                          ...c,
                          [cat.key]: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-line2 text-acc focus:ring-acc"
                    />
                    <span className="text-[12.5px] font-semibold text-body">
                      Allow
                    </span>
                  </label>
                )}
              </div>
              <p className="mt-2 text-[13px] leading-[1.55] text-body">
                {cat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Same three choices, same prominence, here too. */}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={ctx.rejectAll}
            className={cn(btnBase, "bg-ink text-bg hover:bg-acc hover:text-white")}
          >
            Reject all
          </button>
          <button
            type="button"
            onClick={ctx.acceptAll}
            className={cn(btnBase, "bg-ink text-bg hover:bg-acc hover:text-white")}
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => ctx.saveChoices(choices)}
            className={cn(btnBase, "bg-acc text-white hover:bg-acc-b")}
          >
            Save choices
          </button>
        </div>
      </div>
    </div>
  );
}

/** Footer link that reopens the preference centre. Withdrawal stays one click. */
export function CookiePreferencesLink({ className }: { className?: string }) {
  const { openPreferences } = useConsent();
  return (
    <button
      type="button"
      onClick={openPreferences}
      className={cn("text-left hover:text-ink", className)}
    >
      Cookie preferences
    </button>
  );
}
