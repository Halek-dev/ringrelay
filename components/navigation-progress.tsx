"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * A thin top progress bar that gives immediate feedback on every navigation.
 * Next's App Router shows nothing while the next route loads, so a click on a
 * data-heavy page (or any page on a cold dev compile) looks like it did
 * nothing. This starts the bar the moment an internal link is clicked and
 * finishes it when the new route resolves.
 */
function Bar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRun = useRef(true);

  function stopTimers() {
    if (trickle.current) clearInterval(trickle.current);
    if (safety.current) clearTimeout(safety.current);
    trickle.current = null;
    safety.current = null;
  }

  function start() {
    if (active) return;
    if (hideT.current) clearTimeout(hideT.current);
    setActive(true);
    setProgress(8);
    stopTimers();
    // Ease toward 90% and wait there for the route to resolve.
    trickle.current = setInterval(() => {
      setProgress((p) => (p < 90 ? p + (90 - p) * 0.12 : p));
    }, 200);
    // Never let the bar stick if a route change is somehow not observed.
    safety.current = setTimeout(finish, 10000);
  }

  function finish() {
    stopTimers();
    setProgress(100);
    if (hideT.current) clearTimeout(hideT.current);
    hideT.current = setTimeout(() => {
      setActive(false);
      setProgress(0);
    }, 350);
  }

  // The route (path or query) changing means the new page has resolved.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Start on a plain left-click of an internal link.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || anchor.getAttribute("target") === "_blank" || anchor.hasAttribute("download"))
        return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Same page (or hash on the same page): no navigation to indicate.
      if (url.pathname === window.location.pathname && url.search === window.location.search)
        return;
      start();
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      stopTimers();
      if (hideT.current) clearTimeout(hideT.current);
    },
    [],
  );

  if (!active && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        zIndex: 300,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "var(--acc, #ea580c)",
          boxShadow: "0 0 8px var(--acc, #ea580c), 0 0 3px var(--acc, #ea580c)",
          borderRadius: "0 2px 2px 0",
          opacity: progress >= 100 ? 0 : 1,
          transition: active
            ? "width .25s ease"
            : "width .35s ease, opacity .35s ease",
        }}
      />
    </div>
  );
}

export function NavigationProgress() {
  // useSearchParams must sit under a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
