import { Star, MessageSquare, TrendingUp } from "lucide-react";
import { REVIEW_HERO } from "@/lib/mock-data";

/** Hero card: a review request going out and a Google profile climbing. */
export function ReviewHeroCard() {
  const r = REVIEW_HERO;
  const [reqPre, reqPost] = r.request.body.split("{link}");

  return (
    <div className="relative">
      {/* Offset backing card */}
      <div className="pointer-events-none absolute inset-x-[-14px] bottom-[-14px] left-[14px] top-[14px] rotate-[1.6deg] rounded-[22px] border border-line bg-panel" />

      <div className="relative rounded-[22px] border border-line2 bg-gradient-to-b from-card to-card2 p-7 shadow-lift">
        <div className="card-tag absolute left-[26px] top-[-13px] inline-flex items-center gap-2">
          <span className="h-[6px] w-[6px] animate-blink rounded-full bg-acc" />
          REVIEW REQUEST
        </div>

        {/* Business header */}
        <div className="flex items-center gap-[14px] border-b border-line pb-[18px] pt-2">
          <div className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-acc-a to-acc-b shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            <Star size={20} strokeWidth={2.4} color="#fff" fill="#fff" />
          </div>
          <div>
            <div className="font-display text-[15.5px] font-bold tracking-[-0.01em] text-ink">
              {r.business}
            </div>
            <div className="mt-[2px] text-[13px] text-mute">{r.when}</div>
          </div>
        </div>

        {/* The request going out */}
        <div className="py-5">
          <div className="mb-[7px] flex items-center justify-end gap-[6px]">
            <span className="h-[5px] w-[5px] rounded-[1px] bg-acc" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-acc-dim">
              Ring Relay · {r.request.channel}
            </span>
          </div>
          <div className="ml-auto max-w-[92%] rounded-[14px_14px_4px_14px] border border-ai-line bg-gradient-to-br from-ai-bg1 to-ai-bg2 px-4 py-3 text-[14.5px] leading-[1.55] text-ai-ink">
            {reqPre}
            <span className="font-semibold text-acc-dim underline">leave a review</span>
            {reqPost}
          </div>
        </div>

        {/* The 5-star review that comes back */}
        <div className="overflow-hidden rounded-[14px] border border-line bg-panel">
          <div className="flex items-center gap-[9px] border-b border-line px-4 py-[11px]">
            <div className="flex gap-[2px]">
              {Array.from({ length: r.result.stars }).map((_, i) => (
                <Star key={i} size={14} className="text-acc" fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <span className="ml-auto font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-mute">
              New Google review
            </span>
          </div>
          <div className="px-4 py-[14px]">
            <p className="text-[14.5px] leading-[1.55] text-bubble-ink">
              &ldquo;{r.result.quote}&rdquo;
            </p>
            <div className="mt-2 text-[13px] font-semibold text-mute">
              {r.result.author}
            </div>
          </div>
        </div>

        {/* Ranking bump */}
        <div className="mt-4 flex items-center gap-3 rounded-[14px] border border-ok/30 bg-ok/[0.06] px-4 py-[13px]">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ok text-white">
            <TrendingUp size={17} strokeWidth={2.4} />
          </span>
          <div className="flex items-center gap-2 text-[13.5px]">
            <span className="text-mute">
              {r.ranking.before.rank} · {r.ranking.before.reviews} reviews
            </span>
            <MessageSquare size={13} className="rotate-90 text-mute" />
            <span className="font-bold text-ink">
              {r.ranking.after.rank} on the map
            </span>
            <span className="text-ok">· {r.ranking.after.reviews} reviews</span>
          </div>
        </div>
      </div>
    </div>
  );
}
