import { NextResponse } from "next/server";
import { STATIC_PHRASES, TTS_MODEL } from "@/lib/demo/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory cache of pre-generated audio for the fixed phrases (greeting +
// fillers). Generated once on first request, reused after — so they play with
// zero ElevenLabs latency. Dynamic sentences are never cached.
const STATIC_SET = new Set(STATIC_PHRASES.map((p) => p.trim()));
const audioCache = new Map<string, ArrayBuffer>();

async function elevenLabs(text: string, apiKey: string, voiceId: string) {
  return fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=4&output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "content-type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: TTS_MODEL,
        voice_settings: { stability: 0.4, similarity_boost: 0.8 },
      }),
    },
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!apiKey || !voiceId) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID must be set on the server." },
      { status: 500 },
    );
  }

  let text = "";
  try {
    ({ text } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  text = (text ?? "").trim();
  if (!text) return NextResponse.json({ error: "No text to speak." }, { status: 400 });

  const isStatic = STATIC_SET.has(text);

  // Serve fixed phrases from cache when we've already generated them.
  if (isStatic && audioCache.has(text)) {
    return audioBuffer(audioCache.get(text)!);
  }

  try {
    const res = await elevenLabs(text, apiKey, voiceId);
    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => "");
      console.error("[demo] ElevenLabs error:", res.status, detail);
      return NextResponse.json({ error: "Text-to-speech failed." }, { status: 502 });
    }

    if (isStatic) {
      // Buffer + cache the fixed phrase for instant reuse next time.
      const buf = await res.arrayBuffer();
      audioCache.set(text, buf);
      return audioBuffer(buf);
    }

    // Dynamic sentence — stream straight through so playback can start ASAP.
    return new NextResponse(res.body, {
      status: 200,
      headers: { "content-type": "audio/mpeg", "cache-control": "no-store" },
    });
  } catch (err) {
    console.error("[demo] speak error:", err);
    return NextResponse.json({ error: "Text-to-speech failed." }, { status: 502 });
  }
}

function audioBuffer(buf: ArrayBuffer) {
  return new NextResponse(buf, {
    status: 200,
    headers: { "content-type": "audio/mpeg", "cache-control": "no-store" },
  });
}
