import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Hanken_Grotesk,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

// Display / headings
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

// Body copy
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

// Technical labels, eyebrows, step numbers, timestamps
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono",
  display: "swap",
});

// TODO(phase 2): point metadataBase at the real production domain.
const SITE_URL = "https://ringrelay.com";
const TITLE = "Ring Relay: AI receptionist for home-services trades";
const DESCRIPTION =
  "Stop losing jobs to missed calls. Ring Relay answers every call 24/7, books the appointment, and texts you the details, even when you're on a jobsite.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Ring Relay",
  },
  description: DESCRIPTION,
  applicationName: "Ring Relay",
  keywords: [
    "AI receptionist",
    "AI voice agent",
    "answering service",
    "HVAC",
    "plumbing",
    "water damage restoration",
    "missed calls",
    "appointment booking",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Ring Relay",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${bricolage.variable} ${hanken.variable} ${jetbrains.variable}`}
      >
        <a
          href="#main"
          className="sr-only z-[200] rounded-full bg-ink px-4 py-2 text-sm font-bold text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
