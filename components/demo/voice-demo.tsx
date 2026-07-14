"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Mic,
  Volume2,
  Phone,
  PhoneOff,
  Keyboard,
  Send,
  Check,
  CalendarCheck,
  AlertTriangle,
} from "lucide-react";
import { RECEPTIONIST, FILLERS, type BookingInput } from "@/lib/demo/config";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Web Speech API — minimal typing (not in the standard DOM lib)      */
/* ------------------------------------------------------------------ */
type SpeechRecognitionResultLike = { 0: { transcript: string }; isFinal: boolean };
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: { length: number } & Record<number, SpeechRecognitionResultLike>;
};
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type Status = "idle" | "listening" | "speaking";
type Turn = { role: "user" | "assistant"; text: string };
type QueueItem = { url: string; isFiller: boolean };

export function VoiceDemo() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [interim, setInterim] = useState("");
  const [booking, setBooking] = useState<BookingInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [micDenied, setMicDenied] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [typed, setTyped] = useState("");

  // --- refs (used inside async callbacks to avoid stale closures) ---
  const activeRef = useRef(false);
  const voiceRef = useRef(true);
  const turnsRef = useRef<Turn[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const gotFinalRef = useRef(false);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Pre-generated fixed audio (greeting + fillers), keyed by phrase → blob URL.
  const staticAudioRef = useRef<Map<string, string>>(new Map());

  // Audio queue for a turn: filler(s) then the streamed reply sentences.
  const queueRef = useRef<QueueItem[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const streamActiveRef = useRef(false); // chat stream still delivering sentences
  const spokeRealRef = useRef(false); // a non-filler clip has played this turn
  const assistantIdxRef = useRef(-1); // index of the assistant turn being built
  const handleUtteranceRef = useRef<(text: string) => void>(() => {});
  const startListeningRef = useRef<() => void>(() => {});

  // Filler is only used when Claude is genuinely slow (see threshold below).
  const sentenceReceivedRef = useRef(false); // Claude has started replying
  const lastFillerRef = useRef<string | null>(null); // never repeat back-to-back
  const fillerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fillerUsedRef = useRef(false);
  const turnStartRef = useRef(0); // for latency logging
  const firstAudioLoggedRef = useRef(false);

  // If Claude hasn't started within this many ms, play one short filler.
  const FILLER_THRESHOLD_MS = 700;

  useEffect(() => {
    setSupported(getSpeechRecognition() !== null);
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, interim]);

  /* ---------------- audio helpers ---------------- */

  const speakToUrl = useCallback(async (text: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/demo/speak", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return null;
      return URL.createObjectURL(await res.blob());
    } catch {
      return null;
    }
  }, []);

  const getStaticUrl = useCallback(
    async (phrase: string): Promise<string | null> => {
      const cached = staticAudioRef.current.get(phrase);
      if (cached) return cached;
      const url = await speakToUrl(phrase);
      if (url) staticAudioRef.current.set(phrase, url);
      return url;
    },
    [speakToUrl],
  );

  // Pre-generate the greeting + fillers so they play with zero delay.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const phrase of [RECEPTIONIST.greeting, ...FILLERS]) {
        if (cancelled) return;
        await getStaticUrl(phrase);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getStaticUrl]);

  // Pick a filler, never the same one twice in a row.
  const pickFillerUrl = useCallback((): string | null => {
    const pool = FILLERS.filter((f) => f !== lastFillerRef.current);
    const choices = pool.length ? pool : FILLERS;
    const phrase = choices[Math.floor(Math.random() * choices.length)];
    lastFillerRef.current = phrase;
    return staticAudioRef.current.get(phrase) ?? null;
  }, []);

  // Play a single URL to completion (used for the opening greeting).
  const playUrl = useCallback((url: string) => {
    return new Promise<void>((resolve) => {
      const audio = new Audio(url);
      currentAudioRef.current = audio;
      const done = () => {
        if (currentAudioRef.current === audio) currentAudioRef.current = null;
        resolve();
      };
      audio.onended = done;
      audio.onerror = done;
      audio.play().catch(done);
    });
  }, []);

  const onTurnAudioIdle = useCallback(() => {
    assistantIdxRef.current = -1;
    if (activeRef.current && voiceRef.current) {
      startListeningRef.current();
    } else if (activeRef.current) {
      setStatus("idle"); // text mode — wait for the next typed message
    }
  }, []);

  // Sequential audio player for the turn's queue.
  const playNext = useCallback(() => {
    if (currentAudioRef.current) return; // already playing
    const item = queueRef.current.shift();

    if (!item) {
      // Empty queue: if the reply is still streaming, just wait — the next
      // enqueue re-triggers playback (no auto-fillers here). Otherwise, done.
      if (!streamActiveRef.current) onTurnAudioIdle();
      return;
    }

    if (!item.isFiller) {
      spokeRealRef.current = true;
      if (!firstAudioLoggedRef.current) {
        firstAudioLoggedRef.current = true;
        // eslint-disable-next-line no-console
        console.log(
          `[demo] first real audio playing in ${Math.round(
            performance.now() - turnStartRef.current,
          )}ms ${fillerUsedRef.current ? "(after a filler)" : "(no filler)"}`,
        );
      }
    }

    const audio = new Audio(item.url);
    currentAudioRef.current = audio;
    const advance = () => {
      currentAudioRef.current = null;
      if (!item.isFiller) URL.revokeObjectURL(item.url); // fillers are reused
      playNext();
    };
    audio.onended = advance;
    audio.onerror = advance;
    audio.play().catch(advance);
  }, [onTurnAudioIdle]);

  const enqueue = useCallback(
    (item: QueueItem) => {
      queueRef.current.push(item);
      playNext();
    },
    [playNext],
  );

  /* ---------------- conversation ---------------- */

  const appendAssistantText = useCallback((sentence: string) => {
    if (assistantIdxRef.current === -1) {
      const next = [...turnsRef.current, { role: "assistant" as const, text: sentence }];
      turnsRef.current = next;
      assistantIdxRef.current = next.length - 1;
      setTurns(next);
    } else {
      const next = [...turnsRef.current];
      const idx = assistantIdxRef.current;
      next[idx] = { role: "assistant", text: `${next[idx].text} ${sentence}`.trim() };
      turnsRef.current = next;
      setTurns(next);
    }
  }, []);

  const handleUtterance = useCallback(
    async (text: string) => {
      // 1) record the caller's turn
      const next = [...turnsRef.current, { role: "user" as const, text }];
      turnsRef.current = next;
      setTurns(next);
      setError(null);
      setStatus("speaking");

      // 2) reset per-turn state
      queueRef.current = [];
      spokeRealRef.current = false;
      sentenceReceivedRef.current = false;
      fillerUsedRef.current = false;
      firstAudioLoggedRef.current = false;
      assistantIdxRef.current = -1;
      streamActiveRef.current = true;
      turnStartRef.current = performance.now();

      // Only play a filler if Claude STILL hasn't started after the threshold.
      // Most turns start the real reply first and never fire this.
      fillerTimerRef.current = setTimeout(() => {
        if (!activeRef.current || sentenceReceivedRef.current || spokeRealRef.current) return;
        const url = pickFillerUrl();
        if (url) {
          fillerUsedRef.current = true;
          enqueue({ url, isFiller: true });
        }
      }, FILLER_THRESHOLD_MS);

      // 3) call Claude in the background; speak sentences as they stream in
      let ttsChain: Promise<void> = Promise.resolve();
      try {
        const res = await fetch("/api/demo/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: next.map((t) => ({ role: t.role, content: t.text })),
          }),
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "chat failed");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line) continue;
            const evt = JSON.parse(line) as
              | { t: "sentence"; text: string }
              | { t: "booking"; booking: BookingInput }
              | { t: "done" }
              | { t: "error"; message: string };

            if (evt.t === "sentence") {
              if (!sentenceReceivedRef.current) {
                sentenceReceivedRef.current = true;
                if (fillerTimerRef.current) clearTimeout(fillerTimerRef.current);
                // eslint-disable-next-line no-console
                console.log(
                  `[demo] first sentence from Claude in ${Math.round(
                    performance.now() - turnStartRef.current,
                  )}ms`,
                );
              }
              appendAssistantText(evt.text);
              const p = speakToUrl(evt.text); // start TTS immediately (overlap)
              ttsChain = ttsChain.then(async () => {
                const url = await p;
                if (url) enqueue({ url, isFiller: false });
              });
            } else if (evt.t === "booking") {
              setBooking(evt.booking);
            } else if (evt.t === "error") {
              setError(evt.message);
            }
          }
        }
        await ttsChain; // ensure every sentence is queued before we finish
      } catch (e) {
        setError(e instanceof Error ? e.message : "The receptionist hit a snag.");
      } finally {
        if (fillerTimerRef.current) clearTimeout(fillerTimerRef.current);
        streamActiveRef.current = false;
        playNext(); // drains remaining audio, then resumes listening / idle
      }
    },
    [appendAssistantText, enqueue, pickFillerUrl, playNext, speakToUrl],
  );

  useEffect(() => {
    handleUtteranceRef.current = handleUtterance;
  }, [handleUtterance]);

  /* ---------------- speech recognition ---------------- */

  const startListening = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR || !activeRef.current || !voiceRef.current) return;

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    gotFinalRef.current = false;
    setInterim("");
    setStatus("listening");

    recognition.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      if (interimText) setInterim(interimText);
      if (finalText.trim()) {
        gotFinalRef.current = true;
        recognition.stop();
        setInterim("");
        void handleUtteranceRef.current(finalText.trim());
      }
    };

    recognition.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setMicDenied(true);
        activeRef.current = false;
        setStatus("idle");
      }
      // "no-speech" / "aborted" are benign — onend restarts.
    };

    recognition.onend = () => {
      if (!gotFinalRef.current && activeRef.current && voiceRef.current) {
        try {
          recognition.start();
        } catch {
          /* already running */
        }
      }
    };

    try {
      recognition.start();
    } catch {
      /* already running */
    }
  }, []);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  /* ---------------- session control ---------------- */

  const startSession = useCallback(
    async (mode: "voice" | "text") => {
      setError(null);
      setBooking(null);
      turnsRef.current = [];
      setTurns([]);
      activeRef.current = true;
      voiceRef.current = mode === "voice";
      setTextMode(mode === "text");
      setStarted(true);
      setStatus("speaking");

      // Open with the pre-generated greeting (instant), then start listening.
      turnsRef.current = [{ role: "assistant", text: RECEPTIONIST.greeting }];
      setTurns(turnsRef.current);
      const url = await getStaticUrl(RECEPTIONIST.greeting);
      if (url) await playUrl(url);

      if (mode === "voice" && activeRef.current) startListening();
      else if (activeRef.current) setStatus("idle");
    },
    [getStaticUrl, playUrl, startListening],
  );

  const endSession = useCallback(() => {
    activeRef.current = false;
    streamActiveRef.current = false;
    if (fillerTimerRef.current) clearTimeout(fillerTimerRef.current);
    recognitionRef.current?.abort();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    queueRef.current = [];
    setStatus("idle");
    setStarted(false);
    setInterim("");
  }, []);

  function submitTyped(e: React.FormEvent) {
    e.preventDefault();
    const text = typed.trim();
    if (!text || status === "speaking") return;
    setTyped("");
    void handleUtterance(text);
  }

  useEffect(() => {
    const statics = staticAudioRef.current;
    return () => {
      activeRef.current = false;
      recognitionRef.current?.abort();
      currentAudioRef.current?.pause();
      statics.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  /* ---------------- render ---------------- */

  return (
    <div className="mx-auto max-w-[720px]">
      {supported === false && !textMode && (
        <Banner tone="info">
          For the full voice experience, open this demo in{" "}
          <strong className="text-ink">Chrome</strong>. You can still try it by
          typing below.
        </Banner>
      )}

      {micDenied && (
        <Banner tone="warn">
          Microphone access is blocked. Click the mic/lock icon in your
          browser&apos;s address bar to allow it, then start again — or type
          instead.
        </Banner>
      )}

      <div className="relative rounded-[24px] border border-line2 bg-gradient-to-b from-card to-card2 p-8 shadow-card md:p-10">
        <div className="card-tag absolute left-7 top-[-13px] inline-flex items-center gap-2">
          <span
            className={cn(
              "h-[6px] w-[6px] rounded-full",
              started ? "animate-blink bg-acc" : "bg-mute",
            )}
          />
          {started ? "ON CALL" : "SUMMIT HOME SERVICES"}
        </div>

        <div className="flex flex-col items-center">
          <TalkButton
            status={status}
            started={started}
            supported={supported}
            onStart={() => startSession("voice")}
          />

          <div className="mt-5 flex h-6 items-center gap-2">
            <p className="text-center text-[15px] font-semibold text-ink">
              {statusLabel(status, started)}
            </p>
            {status === "speaking" && <Dots />}
          </div>

          {interim && (
            <p className="mt-1 max-w-[420px] text-center text-[14px] italic text-mute">
              &ldquo;{interim}&rdquo;
            </p>
          )}

          {!started && (
            <p className="mt-3 max-w-[420px] text-center text-[13.5px] text-body">
              Try saying:{" "}
              <span className="font-semibold text-acc-dim">
                &ldquo;{RECEPTIONIST.tryPrompt}&rdquo;
              </span>
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {started ? (
              <button
                type="button"
                onClick={endSession}
                className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-line2 px-5 py-[10px] text-[14px] font-bold text-ink transition-colors hover:border-acc hover:text-acc"
              >
                <PhoneOff size={16} /> End call
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startSession("text")}
                className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-line2 px-5 py-[10px] text-[14px] font-bold text-ink transition-colors hover:border-acc hover:text-acc"
              >
                <Keyboard size={16} /> Type instead
              </button>
            )}
          </div>
        </div>

        {turns.length > 0 && (
          <div className="mt-8 flex max-h-[320px] flex-col gap-3 overflow-y-auto border-t border-line pt-6">
            {turns.map((t, i) =>
              t.role === "assistant" ? (
                <div key={i} className="max-w-[85%] self-start">
                  <div className="mb-[5px] ml-1 flex items-center gap-[6px]">
                    <span className="h-[5px] w-[5px] rounded-[1px] bg-acc" />
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-acc-dim">
                      Receptionist
                    </span>
                  </div>
                  <div className="rounded-[14px_14px_14px_4px] border border-ai-line bg-gradient-to-br from-ai-bg1 to-ai-bg2 px-4 py-3 text-[14.5px] leading-[1.55] text-ai-ink">
                    {t.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="max-w-[85%] self-end">
                  <div className="mb-[5px] mr-1 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-mute">
                    You
                  </div>
                  <div className="rounded-[14px_14px_4px_14px] bg-bubble px-4 py-3 text-[14.5px] leading-[1.55] text-bubble-ink">
                    {t.text}
                  </div>
                </div>
              ),
            )}
            <div ref={transcriptEndRef} />
          </div>
        )}

        {started && textMode && (
          <form onSubmit={submitTyped} className="mt-6 flex items-center gap-2">
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Type your message…"
              className="flex-1 rounded-full border-[1.5px] border-line2 bg-card2 px-4 py-[11px] text-[15px] text-ink placeholder:text-mute"
            />
            <button
              type="submit"
              disabled={status === "speaking"}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-acc text-white transition-colors hover:bg-acc-b disabled:opacity-50"
            >
              <Send size={17} strokeWidth={2.4} />
            </button>
          </form>
        )}

        {error && (
          <p className="mt-4 text-center text-[13.5px] font-semibold text-acc-dim">
            {error}
          </p>
        )}
      </div>

      {booking && (
        <div className="mt-6 overflow-hidden rounded-[18px] border border-ok/35 bg-card shadow-soft">
          <div className="flex items-center gap-2 border-b border-line bg-ok/[0.06] px-5 py-3">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ok/[0.14]">
              <Check size={15} strokeWidth={3} className="text-ok" />
            </span>
            <span className="font-display text-[15px] font-bold text-ink">
              Appointment booked
            </span>
            <CalendarCheck size={16} className="ml-auto text-ok" />
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4 px-5 py-5">
            <BookingField label="Name" value={booking.caller_name} />
            <BookingField label="Callback" value={booking.phone} />
            <BookingField label="Service" value={booking.service} />
            <BookingField label="Preferred time" value={booking.preferred_time} />
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-[12.5px] text-mute">
        This is a live demo — the receptionist is AI, the company is a sample.
        Bookings you make here are stored only for this demo.
      </p>
    </div>
  );
}

/* ------------------------------ bits ------------------------------ */

function Banner({
  tone,
  children,
}: {
  tone: "info" | "warn";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex items-start gap-3 rounded-[14px] border px-4 py-3",
        tone === "warn" ? "border-acc/40 bg-acc/10" : "border-ai-line bg-ai-bg2",
      )}
    >
      <AlertTriangle size={18} className="mt-[1px] shrink-0 text-acc" />
      <p className="text-[14px] leading-[1.5] text-body">{children}</p>
    </div>
  );
}

function Dots() {
  return (
    <span className="flex items-center gap-[3px]" aria-hidden>
      {[0, 0.15, 0.3].map((d) => (
        <span
          key={d}
          className="h-[5px] w-[5px] animate-blink rounded-full bg-acc"
          style={{ animationDelay: `${d}s` }}
        />
      ))}
    </span>
  );
}

function TalkButton({
  status,
  started,
  onStart,
  supported,
}: {
  status: Status;
  started: boolean;
  onStart: () => void;
  supported: boolean | null;
}) {
  const listening = status === "listening";
  const speaking = status === "speaking";
  const clickable = !started && supported !== false;

  return (
    <button
      type="button"
      onClick={clickable ? onStart : undefined}
      disabled={started}
      aria-label={started ? "On call" : "Start talking"}
      className={cn(
        "relative grid h-[132px] w-[132px] place-items-center rounded-full transition-transform",
        clickable && "cursor-pointer hover:scale-[1.03] active:scale-95",
        started && "cursor-default",
      )}
    >
      {(listening || speaking) && (
        <span className="absolute inset-0 animate-pulseRing rounded-full bg-acc" />
      )}
      <span className="relative grid h-[112px] w-[112px] place-items-center rounded-full bg-gradient-to-br from-acc-a to-acc-b text-white shadow-[0_16px_40px_rgba(234,88,12,0.35)]">
        {speaking ? (
          <Volume2 size={40} />
        ) : listening ? (
          <Mic size={40} />
        ) : started ? (
          <Phone size={40} />
        ) : (
          <Mic size={40} />
        )}
      </span>
    </button>
  );
}

function BookingField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-mute">
        {label}
      </div>
      <div className="mt-[2px] text-[14.5px] font-bold text-ink">{value}</div>
    </div>
  );
}

function statusLabel(status: Status, started: boolean): string {
  if (!started) return "Tap to talk";
  switch (status) {
    case "listening":
      return "Listening";
    case "speaking":
      return "Speaking";
    default:
      return "Your turn — type below";
  }
}
