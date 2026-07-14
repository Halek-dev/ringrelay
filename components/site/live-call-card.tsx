import { Phone, MessageSquare } from "lucide-react";
import { LIVE_CALL } from "@/lib/mock-data";

/** The animated "LIVE CALL LOG" card featured in the hero. */
export function LiveCallCard() {
  const c = LIVE_CALL;
  return (
    <div className="relative">
      {/* Offset backing card */}
      <div className="pointer-events-none absolute inset-x-[-14px] bottom-[-14px] left-[14px] top-[14px] rotate-[1.6deg] rounded-[22px] border border-line bg-panel" />

      <div className="relative rounded-[22px] border border-line2 bg-gradient-to-b from-card to-card2 p-7 shadow-lift">
        <div className="card-tag absolute left-[26px] top-[-13px] inline-flex items-center gap-2">
          <span className="h-[6px] w-[6px] animate-blink rounded-full bg-acc" />
          LIVE CALL LOG
        </div>

        {/* Caller header */}
        <div className="flex items-center gap-[14px] border-b border-line pb-[18px] pt-2">
          <div className="relative h-[46px] w-[46px] shrink-0">
            <div className="absolute inset-0 animate-pulseRing rounded-full bg-acc" />
            <div className="relative grid h-[46px] w-[46px] place-items-center rounded-full bg-gradient-to-br from-acc-a to-acc-b shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
              <Phone size={20} strokeWidth={2.4} color="#fff" />
            </div>
          </div>
          <div>
            <div className="font-display text-[15.5px] font-bold tracking-[-0.01em] text-ink">
              {c.fromNumber}
            </div>
            <div className="mt-[2px] text-[13px] text-mute">{c.when}</div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex h-[22px] items-end gap-[2.5px]">
              {[0, 0.15, 0.3, 0.45, 0.6].map((d) => (
                <span
                  key={d}
                  className="w-[3px] origin-bottom animate-wave rounded-[2px] bg-acc"
                  style={{ height: "100%", animationDelay: `${d}s` }}
                />
              ))}
            </div>
            <span className="font-mono text-[12px] font-semibold tracking-[0.04em] text-ink">
              {c.duration}
            </span>
          </div>
        </div>

        {/* Transcript */}
        <div className="flex flex-col gap-[14px] py-5">
          {c.transcript.map((line, i) =>
            line.role === "caller" ? (
              <div key={i} className="max-w-[88%] self-start">
                <div className="mb-[5px] ml-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-mute">
                  Caller
                </div>
                <div className="rounded-[14px_14px_14px_4px] bg-bubble px-4 py-3 text-[14.5px] leading-[1.55] text-bubble-ink">
                  {line.text}
                </div>
              </div>
            ) : (
              <div key={i} className="max-w-[88%] self-end">
                <div className="mb-[5px] mr-1 flex items-center justify-end gap-[6px]">
                  <span className="h-[5px] w-[5px] rounded-[1px] bg-acc" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-acc-dim">
                    Ring Relay AI
                  </span>
                </div>
                <div className="rounded-[14px_14px_4px_14px] border border-ai-line bg-gradient-to-br from-ai-bg1 to-ai-bg2 px-4 py-3 text-[14.5px] leading-[1.55] text-ai-ink">
                  {line.text}
                </div>
              </div>
            ),
          )}
        </div>

        {/* Booked summary */}
        <div className="overflow-hidden rounded-[14px] border border-line bg-panel">
          <div className="flex items-center gap-[9px] border-b border-line px-4 py-[11px]">
            <MessageSquare size={15} strokeWidth={2.2} className="text-acc" />
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-mute">
              Texted to you · {c.summary.textedAt}
            </span>
            <span className="ml-auto rounded-[5px] border border-ok/30 bg-ok/[0.07] px-2 py-[3px] font-mono text-[10.5px] font-semibold tracking-[0.1em] text-ok">
              {c.summary.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-[18px] gap-y-[10px] px-4 py-[14px]">
            <SummaryField label="Job" value={c.summary.job} />
            <SummaryField label="When" value={c.summary.when} />
            <SummaryField label="Customer" value={c.summary.customer} />
            <SummaryField label="Address" value={c.summary.address} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-[2px] text-[11px] font-semibold uppercase tracking-[0.06em] text-mute">
        {label}
      </div>
      <div className="text-[14px] font-semibold text-ink">{value}</div>
    </div>
  );
}
