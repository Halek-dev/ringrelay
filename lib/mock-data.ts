/**
 * Ring Relay — mock data (frontend-only phase).
 *
 * Everything the UI renders lives here as typed constants so the whole site
 * can be reviewed before any backend exists. In phase 2 these are replaced by
 * Supabase queries (contact submissions, leads, clients, daily-plan state).
 * Swap the AGENCY constant to rebrand.
 */

export const AGENCY = {
  name: "Ring Relay",
  wordmark: { black: "Ring", accent: "Relay" },
  tagline: "We relay the call. You keep the lead.",
  // The demo is a browser experience, not a phone line. Point everything here.
  demoPath: "/demo",
  email: "hello@ringrelay.com",
} as const;

/* ------------------------------------------------------------------ */
/*  Marketing site content                                             */
/* ------------------------------------------------------------------ */

export const NAV_LINKS = [
  { index: "01", label: "How It Works", href: "/how-it-works" },
  { index: "02", label: "Pricing", href: "/pricing" },
  { index: "03", label: "Onboarding", href: "/onboarding" },
] as const;

export const HERO = {
  eyebrow: "Answering live · 24/7 · EN + ES",
  headlinePre: "Every missed call is a job",
  headlineEm: "your competitor booked.",
  sub: "Every missed call is lost revenue. Ring Relay answers around the clock, qualifies the caller, books the job, and texts you the details while you're still on the jobsite.",
  builtFor: ["HVAC", "Plumbing", "Restoration"],
};

// Live-call card shown in the hero
export const LIVE_CALL = {
  fromNumber: "(415) 555-0182",
  when: "Sat 7:42 PM · after hours",
  duration: "01:24",
  transcript: [
    { role: "caller", text: "My water heater's leaking all over the garage. Can someone come out?" },
    { role: "ai", text: "I can help with that. We have tomorrow at 8:00 AM open. Does that work for you?" },
    { role: "caller", text: "Yeah, 8 works. Sooner the better." },
  ] as { role: "caller" | "ai"; text: string }[],
  summary: {
    textedAt: "7:44 PM",
    status: "BOOKED",
    job: "Water heater leak",
    when: "Tomorrow · 8:00 AM",
    customer: "Mike R.",
    address: "412 Cedar Ln",
  },
};

export type ProblemStat = {
  value: string;
  label: string;
  detail: string;
};

export const PROBLEM_STATS: ProblemStat[] = [
  {
    value: "27%",
    label: "of calls to trades go unanswered",
    detail: "Crews are on jobsites, not by the phone. Every ring that rolls to voicemail is a lead handed to the next name on the list.",
  },
  {
    value: "$390",
    label: "average value of a booked service call",
    detail: "For HVAC, plumbing, and restoration the first job is only the start. Miss it and you miss the repeat business behind it.",
  },
  {
    value: "62%",
    label: "of missed calls happen after hours",
    detail: "Emergencies don't wait for 9 to 5. A burst pipe at 11 PM goes to whoever picks up first.",
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
    title: "Call comes in",
    desc: "A customer calls your existing number, any time of day, night, or weekend. Ring Relay picks up before the third ring, every time.",
  },
  {
    num: "02",
    title: "AI answers, qualifies & books",
    desc: "A natural voice greets them in your company name, asks the right questions, filters spam, and books straight into your calendar.",
  },
  {
    num: "03",
    title: "You get a text + calendar entry",
    desc: "The job lands on your schedule and a summary text hits your phone: who, what, when, and where. Read it between jobs.",
  },
];

// Full call lifecycle (How It Works page)
export const CALL_LIFECYCLE: HowStep[] = [
  {
    num: "01",
    title: "Your phone rings",
    desc: "A customer calls your existing number at 7 PM on a Saturday. You are under a house. The AI picks up before the third ring, every time.",
  },
  {
    num: "02",
    title: "It answers in your company name",
    desc: "A natural voice, not a robot menu. Callers talk to it like they would to your office manager.",
    artifactLabel: "The greeting",
    artifact: "“Thanks for calling Summit Plumbing, this is the after-hours line. What can we help you with tonight?”",
  },
  {
    num: "03",
    title: "It asks the right questions",
    desc: "What is the problem, where are you, how urgent is it. Robocalls and spam get filtered out before they ever reach you.",
    artifactLabel: "Qualifying",
    artifact: "“Is the water shut off, or is it still leaking? Okay, and what is the address?”",
  },
  {
    num: "04",
    title: "It books the job into your calendar",
    desc: "It sees your real availability and offers actual open slots. True emergencies get flagged for immediate callback instead.",
    artifactLabel: "Booking",
    artifact: "Tomorrow 8:00 AM slot confirmed on your Jobber calendar.",
  },
  {
    num: "05",
    title: "The caller gets a confirmation text",
    desc: "Time, your company name, and what to expect. They know they are on the schedule, so they stop calling your competitors.",
    artifactLabel: "Text to caller",
    artifact: "“You are booked with Summit Plumbing for tomorrow at 8:00 AM. Reply here if anything changes.”",
  },
  {
    num: "06",
    title: "You get the full summary",
    desc: "One text with everything: job type, name, address, urgency, and a link to the call recording. Read it in ten seconds between jobs.",
    artifactLabel: "Text to you",
    artifact: "New job booked: Water heater leak · Mike R. · Tomorrow 8:00 AM · 412 Cedar Ln · Recording attached.",
  },
];

export type Feature = {
  icon: string; // lucide icon name
  title: string;
  desc: string;
};

export const FEATURES: Feature[] = [
  { icon: "Clock", title: "24/7 answering", desc: "Every call picked up before the third ring, day and night, weekends and holidays, even while you're mid-job." },
  { icon: "CalendarCheck", title: "Appointment booking", desc: "Reads your real availability and books actual open slots straight into your calendar." },
  { icon: "MessageSquareText", title: "Call summaries texted to you", desc: "Job type, name, address, urgency, and a recording link, all in one text you can read in ten seconds." },
  { icon: "ShieldCheck", title: "Spam & robocall filtering", desc: "Junk calls get filtered out before they ever reach you, so you only deal with real customers." },
  { icon: "Languages", title: "Bilingual EN / ES", desc: "Answers callers in English or Spanish automatically, so you never lose a job over a language barrier." },
  { icon: "RefreshCw", title: "CRM sync", desc: "Pushes booked jobs into Jobber, ServiceTitan, or Housecall Pro so your office stays in one place." },
];

export type Industry = {
  icon: string;
  name: string;
  hook: string;
};

export const INDUSTRIES: Industry[] = [
  { icon: "Wind", name: "HVAC", hook: "No-heat and no-cool calls come in bunches. Book them before the next contractor picks up." },
  { icon: "Wrench", name: "Plumbing", hook: "Burst pipes don't wait for business hours. Answer the 2 AM emergency and win the job." },
  { icon: "Droplets", name: "Water Damage Restoration", hook: "The first company to answer wins the claim. Be first, every time, without adding staff." },
];

export type PricingTier = {
  id: string;
  name: string;
  blurb: string;
  monthly: string;
  setup: string;
  popular: boolean;
  cta: string;
  valueLine: string;
  features: string[];
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    blurb: "One truck, one line. Stop missing after-hours calls.",
    monthly: "$299",
    setup: "$499",
    popular: false,
    cta: "Start with Starter",
    valueLine: "One recovered $8,000 job pays for 26 months.",
    features: [
      "24/7 call answering",
      "Appointment booking",
      "Call summaries texted to you",
      "Spam and robocall filtering",
      "Emergency call escalation",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "For established shops that live and die by the schedule.",
    monthly: "$499",
    setup: "$499",
    popular: true,
    cta: "Book a Demo",
    valueLine: "One recovered $8,000 job pays for 16 months.",
    features: [
      "Everything in Starter",
      "Bilingual English + Spanish",
      "CRM sync: Jobber, ServiceTitan, Housecall Pro",
      "Priority support",
    ],
  },
  {
    id: "multi",
    name: "Multi-location",
    blurb: "Multiple crews, numbers, or markets under one roof.",
    monthly: "$899",
    setup: "$499",
    popular: false,
    cta: "Talk to Us",
    valueLine: "One recovered $8,000 job pays for 9 months.",
    features: [
      "Everything in Pro",
      "Multiple numbers and locations",
      "Custom call flows per location",
      "Dedicated account manager",
    ],
  },
];

export type CompareRow = {
  label: string;
  starter: string;
  pro: string;
  multi: string;
};

export const COMPARE_ROWS: CompareRow[] = [
  { label: "24/7 answering & booking", starter: "✓", pro: "✓", multi: "✓" },
  { label: "Call summaries by text", starter: "✓", pro: "✓", multi: "✓" },
  { label: "Spam filtering", starter: "✓", pro: "✓", multi: "✓" },
  { label: "Emergency escalation", starter: "✓", pro: "✓", multi: "✓" },
  { label: "Bilingual EN / ES", starter: "No", pro: "✓", multi: "✓" },
  { label: "CRM sync", starter: "No", pro: "✓", multi: "✓" },
  { label: "Priority support", starter: "No", pro: "✓", multi: "✓" },
  { label: "Numbers / locations", starter: "1", pro: "1", multi: "Up to 10" },
  { label: "Dedicated account manager", starter: "No", pro: "No", multi: "✓" },
];

export type Faq = { q: string; a: string };

export const HOME_FAQS: Faq[] = [
  { q: "Does it sound robotic?", a: "No. It uses a natural voice and talks the way your office manager would. Most callers never realize they're speaking with an AI, and you pick the voice during setup." },
  { q: "What happens to spam calls?", a: "Robocalls and spam are filtered out before they ever reach you. Only real customers make it through." },
  { q: "Can it book into my existing calendar?", a: "Yes. It connects to Google Calendar, Jobber, ServiceTitan, or Housecall Pro, reads your real availability, and books only actual open slots." },
  { q: "How long is setup?", a: "Typically about five business days from kickoff to answering live. We do the heavy lifting; you spend roughly 90 minutes total across the week." },
  { q: "What if it can't answer something?", a: "It never guesses. If a question is outside what it knows, it takes a detailed message, flags true emergencies for immediate callback, and texts you right away so you can follow up." },
];

export const PRICING_FAQS: Faq[] = [
  { q: "What happens if I get a lot of calls?", a: "The price is flat regardless of call volume. There are no per-minute charges and no overage bills." },
  { q: "What if it cannot answer something?", a: "It takes a message and texts you the details immediately. It never guesses at pricing or makes promises on your behalf." },
  { q: "How long until it is live?", a: "About five business days from the discovery call. You approve how it sounds before it ever answers a real customer." },
];

export const BILLING_FAQS: Faq[] = [
  { q: "Is there a contract?", a: "There is a 90 day minimum, then you can cancel anytime. That window covers building your agent and gives it time to prove itself on your calls." },
  { q: "What does the setup fee cover?", a: "Building your agent around your services and pricing, connecting your calendar and CRM, porting or forwarding your number, and live testing with you before launch." },
  { q: "Can I switch tiers later?", a: "Yes, up or down, effective the next billing cycle. No new setup fee unless you are adding locations." },
];

export type OnboardingStep = {
  num: string;
  title: string;
  day: string;
  desc: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { num: "01", title: "Discovery call", day: "Day 1", desc: "Thirty minutes on your services, pricing, service area, and how you want emergencies handled. We record it and build from the transcript." },
  { num: "02", title: "Agent build", day: "Days 1 to 3", desc: "We write your greeting, qualifying questions, and booking rules, then train the agent on your business. You review a test recording and mark anything to change." },
  { num: "03", title: "Number setup", day: "Day 3", desc: "Keep your existing number. We set up forwarding so the AI catches what you cannot, or provision a new tracked line if you prefer." },
  { num: "04", title: "Testing", day: "Days 4 to 5", desc: "We call it together with your real scenarios: the 2 AM burst pipe, the tire-kicker, the Spanish-speaking caller. It goes live only when you sign off." },
  { num: "05", title: "Go live + monitoring", day: "Day 5", desc: "Flip the switch. First two weeks we review every call log with you, then tune the agent weekly after that." },
];

export type ChecklistItem = { title: string; note: string };

export const ONBOARDING_CHECKLIST: ChecklistItem[] = [
  { title: "Business hours", note: "When you're open, and how after-hours should be handled." },
  { title: "Services & price ranges", note: "What you do, what you don't, rough ballparks for common jobs." },
  { title: "Service area", note: "Zip codes or a radius, plus any travel-fee rules." },
  { title: "Pricing sheet", note: "Whatever you have: a rate card, a spreadsheet, or ballpark numbers." },
  { title: "Calendar access", note: "Google, Jobber, ServiceTitan, or Housecall Pro login for booking." },
  { title: "30 minutes for testing", note: "One call with us before launch to hear it live." },
];

export const INDUSTRY_OPTIONS = [
  "HVAC",
  "Plumbing",
  "Water damage restoration",
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

// Seed testimonials shown on the landing page. The admin can add more, which
// are stored client-side (see lib/testimonials-store.ts) and merged in.
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "seed-1",
    quote:
      "We were losing three or four after-hours calls a night to voicemail. First week on Ring Relay it booked eleven jobs I would've never seen. It paid for itself in two days.",
    name: "Dave Kowalski",
    business: "Kowalski Heating & Air",
    location: "Denver, CO",
    industry: "HVAC",
    rating: 5,
  },
  {
    id: "seed-2",
    quote:
      "My guys can't answer the phone with their hands in a drain. Now every call gets picked up, qualified, and on the calendar before I'm back in the truck. Customers think it's my office manager.",
    name: "Omar Haddad",
    business: "Cascade Plumbing",
    location: "Denver, CO",
    industry: "Plumbing",
    rating: 5,
  },
  {
    id: "seed-3",
    quote:
      "In restoration the first company to answer wins the claim. Ring Relay answers on the first ring at 2 AM. Our booked-job rate on emergency calls went up by a third.",
    name: "Luis Ferrara",
    business: "Metro Restoration Group",
    location: "Aurora, CO",
    industry: "Restoration",
    rating: 5,
  },
];

// Ring Relay vs the alternatives owners are mentally comparing against.
export type CompareValue = boolean | string;
export const COMPARISON: {
  columns: string[];
  rows: { label: string; values: CompareValue[] }[];
} = {
  columns: ["Ring Relay", "Voicemail", "Answering service"],
  rows: [
    { label: "Answers 24/7", values: [true, "Records only", "Business hours"] },
    { label: "Books the appointment", values: [true, false, "Takes a message"] },
    { label: "Filters spam & robocalls", values: [true, false, false] },
    { label: "Knows your services & pricing", values: [true, false, "Generic script"] },
    { label: "Texts you a full summary", values: [true, false, "Sometimes"] },
    { label: "Bilingual EN / ES", values: [true, false, "Extra fee"] },
    { label: "Cost", values: ["Flat monthly", "Free (loses jobs)", "$1 to $2 / minute"] },
  ],
};

/* ------------------------------------------------------------------ */
/*  Admin navigation (data comes from Supabase — see lib/data/*)        */
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
  { label: "Team", href: "/admin/team", icon: "UserCog", ownerOnly: true },
];
