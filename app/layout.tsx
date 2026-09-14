import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Hanken_Grotesk,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { ConsentProvider } from "@/components/consent/consent-provider";
import { AnalyticsLoader } from "@/components/consent/analytics-loader";
import { NavigationProgress } from "@/components/navigation-progress";

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
const TITLE = "Ring Relay: Automatic Google reviews for HVAC and roofing";
const DESCRIPTION =
  "Get more 5-star Google reviews automatically after every job. Climb the Maps 3-pack and get more calls from the ads you already run. Built for HVAC and roofing pros. $97 a month.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Ring Relay",
  },
  description: DESCRIPTION,
  applicationName: "Ring Relay",
  keywords: [
    "Google reviews",
    "review requests",
    "get more reviews",
    "HVAC marketing",
    "roofing marketing",
    "Google Maps ranking",
    "local SEO",
    "reputation management",
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
        <NavigationProgress />
        <ConsentProvider>
          {children}
          {/* Loads only after the visitor opts in to analytics. */}
          <AnalyticsLoader />
        </ConsentProvider>
      </body>
    </html>
  );
}
