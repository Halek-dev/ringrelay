import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  BOOK_APPOINTMENT_TOOL,
  CHAT_MAX_TOKENS,
  CHAT_MODEL,
  buildSystemPrompt,
  validatePhone,
  type BookingInput,
} from "@/lib/demo/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClientMessage = { role: "user" | "assistant"; content: string };

// The Anthropic API requires the first message to be from the user, so drop
// any leading assistant turns (e.g. the client's display-only greeting).
function toApiMessages(messages: ClientMessage[]): Anthropic.MessageParam[] {
  const firstUser = messages.findIndex((m) => m.role === "user");
  if (firstUser === -1) return [];
  return messages.slice(firstUser).map((m) => ({ role: m.role, content: m.content }));
}

async function saveBooking(booking: BookingInput) {
  try {
    const supabase = createAdminClient();
    await supabase.from("demo_bookings").insert({
      caller_name: booking.caller_name,
      phone: booking.phone,
      service: booking.service,
      preferred_time: booking.preferred_time,
    });
  } catch (err) {
    console.error("[demo] could not save booking:", err);
  }
}

/**
 * Streams the receptionist's reply as newline-delimited JSON events so the
 * browser can start speaking sentence-by-sentence (overlapping Claude's
 * generation with ElevenLabs) instead of waiting for the whole reply:
 *   {"t":"sentence","text":"..."}   a completed sentence, ready to speak
 *   {"t":"booking","booking":{...}}  an appointment was saved
 *   {"t":"done"}                     the turn is finished
 *   {"t":"error","message":"..."}    something went wrong
 */
export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ error: "ANTHROPIC_API_KEY is not configured on the server." }, 500);
  }

  let body: { messages?: ClientMessage[] };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  const messages = toApiMessages(body.messages ?? []);
  if (messages.length === 0) return json({ error: "No user message." }, 400);

  const client = new Anthropic();
  const system = buildSystemPrompt();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

      // Stream one Claude turn, emitting speakable chunks the moment they land
      // so the browser can start playing audio while Claude is still writing.
      async function streamTurn(): Promise<Anthropic.Message> {
        const s = client.messages.stream({
          model: CHAT_MODEL,
          max_tokens: CHAT_MAX_TOKENS,
          system,
          tools: [BOOK_APPOINTMENT_TOOL],
          messages,
        });

        const t0 = Date.now();
        let buffer = "";
        let firstSent = false;

        const flush = () => {
          for (;;) {
            // First chunk: break at the first clause boundary (comma/colon/
            // semicolon or sentence end) so the very first audio starts ASAP.
            // After that: break on sentence ends only, to keep it natural.
            const boundary = firstSent
              ? /^([\s\S]*?[.!?])(\s|$)/
              : /^([\s\S]*?[.!?,;:—–-])(\s|$)/;
            const m = buffer.match(boundary);
            if (m) {
              const seg = m[1].trim();
              buffer = buffer.slice(m[0].length);
              if (seg) {
                send({ t: "sentence", text: seg });
                if (!firstSent) {
                  firstSent = true;
                  console.log(`[demo] first chunk emitted in ${Date.now() - t0}ms`);
                }
              }
              continue;
            }
            // Fallback: no punctuation yet but the first chunk is getting long —
            // break at a word boundary so we don't stall waiting for a period.
            if (!firstSent && buffer.length >= 40) {
              const cut = buffer.lastIndexOf(" ", 40);
              if (cut > 12) {
                const seg = buffer.slice(0, cut).trim();
                buffer = buffer.slice(cut + 1);
                if (seg) {
                  send({ t: "sentence", text: seg });
                  firstSent = true;
                  console.log(`[demo] first chunk emitted in ${Date.now() - t0}ms`);
                }
                continue;
              }
            }
            break;
          }
        };

        s.on("text", (delta) => {
          buffer += delta;
          flush();
        });

        const final = await s.finalMessage();
        const rest = buffer.trim();
        if (rest) send({ t: "sentence", text: rest });
        return final;
      }

      try {
        let final = await streamTurn();

        if (final.stop_reason === "tool_use") {
          const toolUse = final.content.find((b) => b.type === "tool_use");
          if (toolUse && toolUse.type === "tool_use") {
            const input = toolUse.input as BookingInput;
            const check = validatePhone(input.phone);

            messages.push({ role: "assistant", content: final.content });

            if (!check.ok) {
              // Don't save — nudge Claude to re-confirm the number with the caller.
              messages.push({
                role: "user",
                content: [
                  {
                    type: "tool_result",
                    tool_use_id: toolUse.id,
                    is_error: true,
                    content: `The phone number "${input.phone}" doesn't look valid — ${check.reason}. Do not book yet. Politely ask the caller to repeat their callback number, then book once it sounds right.`,
                  },
                ],
              });
            } else {
              await saveBooking(input);
              send({ t: "booking", booking: input });
              messages.push({
                role: "user",
                content: [
                  {
                    type: "tool_result",
                    tool_use_id: toolUse.id,
                    content:
                      "Appointment booked successfully. Confirm the details to the caller in one short sentence.",
                  },
                ],
              });
            }

            final = await streamTurn(); // stream the follow-up (re-ask or confirmation)
          }
        }

        send({ t: "done" });
        controller.close();
      } catch (err) {
        console.error("[demo] chat error:", err);
        send({ t: "error", message: "The receptionist hit a snag. Try again." });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
