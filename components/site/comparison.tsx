import { Check, X } from "lucide-react";
import { Eyebrow } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { COMPARISON, type CompareValue } from "@/lib/mock-data";

function Cell({ value, highlight }: { value: CompareValue; highlight: boolean }) {
  if (value === true)
    return (
      <span className="mx-auto grid h-6 w-6 place-items-center rounded-full bg-ok/[0.12]">
        <Check size={15} strokeWidth={2.8} className="text-ok" />
      </span>
    );
  if (value === false)
    return (
      <span className="mx-auto grid h-6 w-6 place-items-center rounded-full bg-panel">
        <X size={14} strokeWidth={2.6} className="text-mute" />
      </span>
    );
  return (
    <span
      className={
        "text-[13px] font-semibold " + (highlight ? "text-acc-dim" : "text-body")
      }
    >
      {value}
    </span>
  );
}

/** Ring Relay vs the alternatives owners already have in mind. */
export function Comparison() {
  return (
    <section className="relative mx-auto max-w-[1000px] px-6 py-16 md:px-10">
      <Reveal className="mb-10 text-center">
        <Eyebrow>Why not just…</Eyebrow>
        <h2 className="mx-auto mt-4 max-w-[620px] text-balance font-display text-[34px] font-extrabold tracking-[-0.03em] text-ink">
          Better than the options you already have.
        </h2>
      </Reveal>

      <Reveal className="overflow-x-auto rounded-[18px] border border-line2 bg-card shadow-card">
        <div className="min-w-[620px]">
          {/* Header */}
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] border-b border-line2 bg-panel">
            <div className="px-5 py-4" />
            {COMPARISON.columns.map((col, i) => (
              <div
                key={col}
                className={
                  "px-3 py-4 text-center font-display text-[14px] font-bold " +
                  (i === 0 ? "text-acc" : "text-ink")
                }
              >
                {col}
              </div>
            ))}
          </div>
          {/* Rows */}
          {COMPARISON.rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center border-b border-line last:border-b-0"
            >
              <div className="px-5 py-[14px] text-[14px] font-semibold text-bubble-ink">
                {row.label}
              </div>
              {row.values.map((v, i) => (
                <div
                  key={i}
                  className={
                    "px-3 py-[14px] text-center " +
                    (i === 0 ? "bg-ai-bg2" : "")
                  }
                >
                  <Cell value={v} highlight={i === 0} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
