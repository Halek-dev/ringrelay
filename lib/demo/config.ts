/**
 * Configuration for the browser voice-receptionist demo (/demo).
 * Everything the demo persona says or knows is here so it's easy to edit.
 * The AI answers as a sample multi-trade company so any prospect (HVAC,
 * plumbing, restoration) recognizes their own business in it.
 */

// Business and agent name live here so both are editable per client without
// touching code. The greeting and system prompt are built from them below.
const BUSINESS = "Summit Home Services";
const AGENT_NAME = "Ava";

export const RECEPTIONIST = {
  business: BUSINESS,
  agentName: AGENT_NAME,
  trades: ["plumbing", "heating & cooling (HVAC)", "water damage / restoration"],
  serviceArea: "the greater metro area",
  hours: "Monday to Friday, 8am to 6pm, with 24/7 emergency service",
  canBook:
    "repairs, installations, maintenance and tune-ups, and emergency calls (leaks, no heat, no AC, flooding)",
  tryPrompt: "My water heater is leaking, can someone come out?",
  // A fixed opening line, pre-generated once and played instantly on start. It
  // names the agent, names the business, explains why it is answering, and sets
  // expectations. "The team is out on jobs" works at any hour, which positions
  // the agent as always-on rather than a night shift. No dashes: this goes to
  // ElevenLabs and dashes affect the spoken phrasing.
  greeting: `Thanks for calling ${BUSINESS}, this is ${AGENT_NAME}. The team is out on jobs right now, but I can answer questions and get you booked in. What's going on?`,
} as const;

/**
 * Very short, natural acknowledgments. These are NOT played on every turn — a
 * filler only plays if Claude is still thinking after a short threshold (most
 * turns start the real reply first and use no filler at all). They're one or
 * two words so they sound like natural conversation, not stalling, and the same
 * one is never played twice in a row.
 */
export const FILLERS = ["Mm-hm.", "Got it.", "Okay.", "Sure."] as const;

/** All fixed phrases to pre-generate + cache (never depend on caller input). */
export const STATIC_PHRASES: readonly string[] = [
  RECEPTIONIST.greeting,
  ...FILLERS,
];

// Fast, low-latency models for real-time voice. Haiku keeps Claude snappy;
// eleven_flash_v2_5 is ElevenLabs' lowest-latency TTS model. Swap here if you
// want more headroom on quality over speed.
export const CHAT_MODEL = "claude-haiku-4-5";
export const CHAT_MAX_TOKENS = 160;
export const TTS_MODEL = "eleven_flash_v2_5";

/** Builds the Claude system prompt from the config above. */
export function buildSystemPrompt(): string {
  const r = RECEPTIONIST;
  return `You are ${r.agentName}, the virtual receptionist for ${r.business}, a company offering ${r.trades.join(
    ", ",
  )} in ${r.serviceArea}. You answer calls when the team is out on jobs, during the day and after hours alike. Your name is ${r.agentName}. You are warm, brief, and natural. This is a spoken conversation, so keep every reply to one or two short sentences and use contractions. Never use lists or markdown. Never use em dashes, en dashes, or any dash punctuation. Write in plain spoken sentences using only commas and full stops, because your words are read aloud by a voice engine and dashes make it sound wrong. Shorter is better. Say only what is needed to move the call forward.

Your goal: understand what the caller needs and book an appointment. You can book ${r.canBook}. Business hours are ${r.hours}. For emergencies (burst pipe, flooding, no heat, no AC) express urgency and prioritize the soonest slot.

To book you need four things: the caller's name, a callback number, the service or problem, and a preferred time. Collect these naturally. Ask for what's missing, one thing at a time, and never dump all four questions at once. Once you have all four, call the book_appointment tool. After it succeeds, confirm the details back to the caller in one short sentence.

Phone numbers: when the caller gives a number, briefly read it back to confirm and make sure it sounds like a complete phone number, about ten digits for a US number. If it sounds too short, too long, or garbled, politely ask them to repeat it before booking. Never book with a number you're unsure about.

You do NOT quote prices. If asked about cost, say a technician will confirm pricing on-site. Never invent prices or make promises you can't keep. If you can't answer something, take a message and let them know the team will follow up.

You have already greeted the caller with: "${r.greeting}". Do not greet again. Continue the conversation naturally from their reply.`;
}

/** The booking tool Claude calls once it has all four details. */
export const BOOK_APPOINTMENT_TOOL = {
  name: "book_appointment",
  description:
    "Book an appointment. Only call this once you have collected all four details from the caller: their name, a callback phone number, the service or problem, and a preferred time. Do not call it with placeholder or guessed values.",
  strict: true,
  input_schema: {
    type: "object" as const,
    properties: {
      caller_name: { type: "string", description: "The caller's full name" },
      phone: { type: "string", description: "A callback phone number" },
      service: {
        type: "string",
        description: "The service or problem, e.g. 'water heater leak' or 'no heat'",
      },
      preferred_time: {
        type: "string",
        description: "The caller's preferred time, e.g. 'tomorrow at 8 AM'",
      },
    },
    required: ["caller_name", "phone", "service", "preferred_time"],
    additionalProperties: false,
  },
};

export type BookingInput = {
  caller_name: string;
  phone: string;
  service: string;
  preferred_time: string;
};

/* ------------------------------------------------------------------ */
/*  Light phone validation — a backstop before saving a booking.       */
/*  Lenient by design: catch obviously broken numbers, not edge cases. */
/* ------------------------------------------------------------------ */

/**
 * Safety net: strip em/en dashes from the receptionist's text before it is
 * spoken or shown. Dashes affect ElevenLabs phrasing and violate the house
 * style, so replace them with a comma (keeps the natural pause). Real hyphens
 * inside words are left alone.
 */
export function stripDashes(text: string): string {
  return text
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,!?])/g, "$1")
    .trim();
}

export function sanitizePhone(raw: string): string {
  return (raw ?? "").replace(/\D/g, "");
}

export function validatePhone(
  raw: string,
): { ok: true; digits: string } | { ok: false; reason: string } {
  const digits = sanitizePhone(raw);
  if (digits.length < 10) return { ok: false, reason: "it has too few digits" };
  if (digits.length > 15) return { ok: false, reason: "it has too many digits" };
  return { ok: true, digits };
}
