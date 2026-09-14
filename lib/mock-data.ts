/**
 * Ring Relay content constants.
 *
 * Ring Relay is an automated Google-review request system for home-services
 * pros (HVAC and roofing first). It asks every customer for a review after the
 * job, so the business climbs the Google Maps rankings and gets more calls.
 * All public marketing copy lives here so it can be edited in one place.
 */

export const AGENCY = {
  name: "Ring Relay",
  wordmark: { black: "Ring", accent: "Relay" },
  tagline: "More reviews. More calls. On autopilot.",
  email: "hello@ringrelay.com",
} as const;

/* ------------------------------------------------------------------ */
/*  Marketing site content                                             */
/* ------------------------------------------------------------------ */

export const NAV_LINKS = [
  { index: "01", label: "How It Works", href: "/how-it-works" },
  { index: "02", label: "Pricing", href: "/pricing" },
  { index: "03", label: "Onboarding", href: "/onboarding" },
  { index: "04", label: "Careers", href: "/careers" },
] as const;

export const HERO = {
  eyebrow: "For HVAC and roofing pros",
  headlinePre: "More 5-star reviews. More calls.",
  headlineEm: "Zero effort.",
  sub: "Ring Relay asks every customer for a Google review right after the job, so you climb the Maps rankings and get more calls from the ads you already pay for. You do nothing.",
  builtFor: ["HVAC", "Roofing", "More trades"],
};

/**
 * Data for the hero card: a review request going out and a Google profile
 * climbing. Illustrative, not a real business.
 */
export const REVIEW_HERO = {
  business: "Summit Heating & Air",
  when: "Sat 4:12 PM · job finished",
  request: {
    channel: "Text to customer",
    body: "Hi Mike, thanks for choosing Summit Heating & Air today. Would you mind leaving us a quick Google review? It takes 10 seconds: {link}",
  },
  result: {
    stars: 5,
    quote: "Fast, tidy, explained everything. Highly recommend.",
    author: "Mike R.",
  },
  ranking: {
    before: { rank: "#7", reviews: 22 },
    after: { rank: "#2", reviews: 41 },
  },
};

export type ProblemStat = {
  value: string;
  label: string;
  detail: string;
};

export const PROBLEM_STATS: ProblemStat[] = [
  {
    value: "3",
    label: "businesses win the Google map pack",
    detail:
      "Homeowners call one of the three shops at the top of the map. Review count and freshness decide which three. Few or stale reviews and you are not one of them.",
  },
  {
    value: "0",
    label: "extra work once it is set up",
    detail:
      "Every review request goes out on its own after the job. You never have to remember to ask, chase anyone, or copy a link again.",
  },
  {
    value: "$97",
    label: "flat per month",
    detail:
      "One recovered install or roof pays for years of Ring Relay, and it keeps working while you are on the truck.",
  },
];

export type HowStep = {
  num: string;
  title: string;
  desc: string;
  artifactLabel?: string;
  artifact?: string;
};

// Short home-page version (3 steps)
export const HOME_STEPS: HowStep[] = [
  {
    num: "01",
    title: "Finish the job",
    desc: "Connect the software you already use, or add the customer in one tap. Ring Relay knows the visit is done.",
  },
  {
    num: "02",
    title: "We ask for the review",
    desc: "A friendly text and email go out at the right moment, with a reminder, because most reviews come from the nudge.",
  },
  {
    num: "03",
    title: "You climb the rankings",
    desc: "Fresh 5-star reviews push you up the Google Maps pack, and more homeowners call the number at the top.",
  },
];

// Full walkthrough (How It Works page)
export const REVIEW_FLOW: HowStep[] = [
  {
    num: "01",
    title: "It knows when a job is done",
    desc: "Connect Jobber, Housecall Pro, ServiceTitan, or your tool, and Ring Relay triggers off completed jobs. No software? Add a customer in one tap or forward a text.",
    artifactLabel: "The trigger",
    artifact: "Job marked complete: Mike R. · Water heater install · 412 Cedar Ln",
  },
  {
    num: "02",
    title: "It asks the right way, at the right time",
    desc: "A short, human text and email go out shortly after the visit, then one reminder. Friendly, on your brand, and easy to reply to.",
    artifactLabel: "Text to customer",
    artifact: "“Thanks for choosing Summit Heating & Air today, Mike. Mind leaving us a quick Google review? Takes 10 seconds.”",
  },
  {
    num: "03",
    title: "Your customer leaves the review in seconds",
    desc: "One tap takes them straight to your Google review page. No apps, no logins, no friction.",
    artifactLabel: "The review",
    artifact: "★★★★★ “Fast, tidy, explained everything. Highly recommend.” - Mike R.",
  },
  {
    num: "04",
    title: "You climb the map and the calls follow",
    desc: "More fresh 5-star reviews lift you in the Google Maps pack and Local Services, so more of the homeowners searching right now call you.",
    artifactLabel: "The ranking",
    artifact: "Summit Heating & Air moved from #7 to #2 in the local map pack.",
  },
];

export type Feature = {
  icon: string; // lucide icon name (see components/icon.tsx)
  title: string;
  desc: string;
};

export const FEATURES: Feature[] = [
  { icon: "Zap", title: "Automatic after every job", desc: "Set it once. Review requests go out on their own, so you never have to remember to ask." },
  { icon: "MessageSquareText", title: "Text and email", desc: "Requests land when people actually check their phone, not buried somewhere they get ignored." },
  { icon: "Star", title: "One tap for your customer", desc: "Straight to your Google review page. They leave a review in seconds, no apps or logins." },
  { icon: "Wrench", title: "Works with your tools", desc: "Jobber, Housecall Pro, ServiceTitan, AccuLynx, JobNimbus, Roofr, QuickBooks. No software works too." },
  { icon: "Clock", title: "Follow-up built in", desc: "A gentle reminder catches the reviews the first message misses, without nagging anyone." },
  { icon: "TrendingUp", title: "See it working", desc: "A simple dashboard shows requests sent and reviews landed, so you know it is earning its keep." },
];

export type Industry = {
  icon: string;
  name: string;
  hook: string;
};

export const INDUSTRIES: Industry[] = [
  { icon: "Wind", name: "HVAC", hook: "No-heat and no-cool season is when homeowners search hardest. Show up at the top of the map with fresh reviews and win the calls." },
  { icon: "Home", name: "Roofing", hook: "After a storm, everyone is comparing roofers online. The one with recent 5-star reviews gets the inspection, and the job." },
  { icon: "Wrench", name: "Every trade", hook: "Plumbing, electrical, garage doors, pest control, landscaping. If your customers can leave a Google review, Ring Relay gets them to." },
];

/* --- Pricing: one simple plan --- */

export const PLAN = {
  name: "Ring Relay",
  price: "$97",
  cadence: "/month",
  blurb: "One plan. Everything included. Cancel anytime.",
  valueLine: "One recovered job pays for years.",
  cta: "Book a demo",
  features: [
    "Automatic review requests by text and email",
    "Smart timing and a built-in follow-up",
    "One-tap Google review link for your customers",
    "Works with your software, or none at all",
    "Live dashboard: requests sent and reviews landed",
    "Setup done with you, at no extra cost",
  ],
  // Founding-customer offer while we launch (no proof yet).
  foundingOffer:
    "Founding customers get their first two months at half price in exchange for a short testimonial once the reviews start landing. Limited spots while we launch.",
} as const;

export type Faq = { q: string; a: string };

export const HOME_FAQS: Faq[] = [
  { q: "Does Google allow this?", a: "Yes. You are asking your own customers for honest reviews, which Google encourages. We never fake, buy, or filter reviews." },
  { q: "Do I have to do anything?", a: "No. It runs automatically after each job. You approve the wording once and it takes over from there." },
  { q: "Will it work with my software?", a: "Yes, with the common trade tools like Jobber, Housecall Pro, and ServiceTitan, and just as well with no software at all." },
  { q: "How soon will I see reviews?", a: "Requests start going out within days of going live. Your ranking improves over the following weeks as reviews add up. We do not promise a specific number." },
  { q: "How much is it?", a: "Ninety-seven dollars a month, month to month. One recovered job pays for years." },
];

export const PRICING_FAQS: Faq[] = [
  { q: "Is there a contract?", a: "No. Month to month, cancel anytime." },
  { q: "Is there a setup fee?", a: "No. We help you get live at no extra cost." },
  { q: "Does the price change with volume?", a: "No. It is flat no matter how many review requests go out." },
  { q: "What if I use no software?", a: "Still ninety-seven dollars. You add customers in one tap or forward a text." },
];

export type OnboardingStep = {
  num: string;
  title: string;
  day: string;
  desc: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { num: "01", title: "Quick call", day: "Day 1", desc: "Fifteen minutes on your trade, your Google Business Profile, and the software you use, if any." },
  { num: "02", title: "We connect it", day: "Days 1 to 2", desc: "We link your software or set up the simple add-a-customer flow, and point requests at your Google review page." },
  { num: "03", title: "You approve the wording", day: "Day 2", desc: "We send you a sample text and email. You tweak the tone until it sounds like you, not a robot." },
  { num: "04", title: "Go live", day: "Day 3", desc: "Requests start going out after every job. You watch the reviews come in from your dashboard." },
];

export type ChecklistItem = { title: string; note: string };

export const ONBOARDING_CHECKLIST: ChecklistItem[] = [
  { title: "Google Business Profile access", note: "So requests point to the right review page and we can track new reviews." },
  { title: "Your customer source", note: "A login to the software you use, or we set up a one-tap add-a-customer flow." },
  { title: "Your trade and service area", note: "What you do and where, so the wording fits your business." },
  { title: "Your brand voice", note: "How you want the messages to sound. Plain, friendly, with your name on them." },
  { title: "Fifteen minutes", note: "One short call to get set up and approve the wording." },
];

export const INDUSTRY_OPTIONS = [
  "HVAC",
  "Roofing",
  "Plumbing",
  "Electrical",
  "Other home services",
] as const;

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  business: string;
  location: string;
  industry: string;
  rating: number; // 1-5
};

// No testimonials yet. Ring Relay is at launch, so we do not show invented
// proof. The section stays hidden until real reviews come in.
export const TESTIMONIALS: Testimonial[] = [];

// Ring Relay vs the alternatives an owner is weighing.
export type CompareValue = boolean | string;
export const COMPARISON: {
  columns: string[];
  rows: { label: string; values: CompareValue[] }[];
} = {
  columns: ["Ring Relay", "Asking by hand", "Big platforms"],
  rows: [
    { label: "Runs automatically after every job", values: [true, false, "Sometimes"] },
    { label: "Timed and followed up for you", values: [true, "If you remember", true] },
    { label: "Works with no software", values: [true, true, false] },
    { label: "Set up done for you", values: [true, false, "Extra fee"] },
    { label: "Built for small trades", values: [true, true, "Built for enterprise"] },
    { label: "Price", values: ["$97 / month", "Free but forgotten", "Hundreds / month"] },
  ],
};

/* ------------------------------------------------------------------ */
/*  Admin navigation (data comes from Supabase, see lib/data/*)         */
/* ------------------------------------------------------------------ */

export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  ownerOnly?: boolean;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Daily Plan", href: "/admin/daily-plan", icon: "CalendarRange" },
  { label: "Leads", href: "/admin/leads", icon: "Users" },
  { label: "Clients", href: "/admin/clients", icon: "Building2" },
  { label: "Outreach", href: "/admin/outreach", icon: "MessageSquareQuote" },
  { label: "Playbook", href: "/admin/playbook", icon: "BookOpen" },
  { label: "Testimonials", href: "/admin/testimonials", icon: "Star" },
  { label: "Careers", href: "/admin/careers", icon: "Briefcase", ownerOnly: true },
  { label: "Emails", href: "/admin/emails", icon: "MailPlus", ownerOnly: true },
  { label: "Team CMS", href: "/admin/team-members", icon: "UserPlus", ownerOnly: true },
  { label: "Team", href: "/admin/team", icon: "UserCog", ownerOnly: true },
];
