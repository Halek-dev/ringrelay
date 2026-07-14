import { Reveal } from "@/components/site/reveal";

export type TimelineItem = {
  num: string;
  title: string;
  desc: string;
  day?: string;
  artifactLabel?: string;
  artifact?: string;
};

/**
 * Vertical numbered timeline with node squares + gradient connectors.
 * Used by How It Works (with call artifacts) and Onboarding (with day labels).
 */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="flex flex-col">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <Reveal
            key={item.num}
            delay={i * 60}
            className="grid grid-cols-[52px_1fr] gap-x-6 md:grid-cols-[64px_1fr] md:gap-x-7"
          >
            <div className="flex flex-col items-center">
              <div className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px] border-[1.5px] border-line2 bg-card font-mono text-[13px] font-semibold text-acc shadow-soft">
                {item.num}
              </div>
              {!last && (
                <div className="my-2 min-h-[30px] w-[2px] flex-1 bg-gradient-to-b from-line2 to-line" />
              )}
            </div>

            <div className="pb-9 md:pb-10">
              <div className="mb-2 mt-1 flex items-baseline gap-3">
                <h3 className="font-display text-[22px] font-bold tracking-[-0.02em] text-ink md:text-[23px]">
                  {item.title}
                </h3>
                {item.day && (
                  <span className="whitespace-nowrap font-mono text-[11px] font-semibold tracking-[0.08em] text-mute">
                    {item.day}
                  </span>
                )}
              </div>
              <p className="max-w-[560px] text-pretty text-[15.5px] leading-[1.65] text-body md:text-[16px]">
                {item.desc}
              </p>

              {item.artifact && (
                <div className="mt-[18px] flex max-w-[480px] items-start gap-3 rounded-[14px] border border-line2 bg-card px-[18px] py-4 shadow-soft">
                  <span className="mt-[6px] h-2 w-2 shrink-0 rounded-[2px] bg-acc" />
                  <div>
                    {item.artifactLabel && (
                      <div className="mb-[5px] font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mute">
                        {item.artifactLabel}
                      </div>
                    )}
                    <div className="text-[14.5px] leading-[1.55] text-bubble-ink">
                      {item.artifact}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
