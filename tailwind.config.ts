import type { Config } from "tailwindcss";

/**
 * Ring Relay design tokens are declared as CSS variables in app/globals.css
 * (light theme on :root, dark variants on [data-theme="..."]). Here we map
 * them to semantic Tailwind color / font names so components read cleanly,
 * e.g. text-ink, bg-acc, border-line, font-display.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        grid: "var(--grid)",
        glow: "var(--glow)",
        nav: "var(--nav)",
        line: "var(--line)",
        line2: "var(--line2)",
        ink: "var(--ink)",
        body: "var(--body)",
        mute: "var(--mute)",
        chip: "var(--chip)",
        "chip-ink": "var(--chip-ink)",
        card: "var(--card)",
        card2: "var(--card2)",
        panel: "var(--panel)",
        bubble: "var(--bubble)",
        "bubble-ink": "var(--bubble-ink)",
        "ai-bg1": "var(--ai-bg1)",
        "ai-bg2": "var(--ai-bg2)",
        "ai-line": "var(--ai-line)",
        "ai-ink": "var(--ai-ink)",
        acc: "var(--acc)",
        "acc-a": "var(--acc-a)",
        "acc-b": "var(--acc-b)",
        "acc-ink": "var(--acc-ink)",
        "acc-dim": "var(--acc-dim)",
        ok: "var(--ok)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        soft: "0 12px 34px var(--shadow)",
        card: "0 24px 60px var(--shadow)",
        lift: "0 32px 80px var(--shadow)",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "none" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.8s ease-out infinite",
        fadeUp: "fadeUp 0.55s ease both",
        wave: "wave 1.1s ease-in-out infinite",
        blink: "blink 1.4s ease infinite",
      },
    },
  },
  plugins: [],
};

export default config;
