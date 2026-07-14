import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Primary CTA pill — orange, trailing circular arrow disc.
 * Hover lifts -2px and deepens the shadow; active presses to 0.98.
 */
export function PrimaryCta({
  href,
  children,
  className,
  discSize = 38,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  discSize?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-[14px] rounded-full bg-acc pl-[30px] pr-[10px] py-[10px] text-[16.5px] font-bold text-white",
        "shadow-[0_12px_32px_rgba(234,88,12,0.32)] transition-all duration-200",
        "hover:-translate-y-0.5 hover:bg-acc-b hover:shadow-[0_18px_44px_rgba(234,88,12,0.42)]",
        "active:translate-y-0 active:scale-[0.98]",
        className,
      )}
    >
      {children}
      <span
        className="grid place-items-center rounded-full bg-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
        style={{ width: discSize, height: discSize }}
      >
        <ArrowRight size={16} strokeWidth={2.6} color="#fff" />
      </span>
    </Link>
  );
}

/** Secondary CTA — transparent pill with a hairline border. */
export function SecondaryCta({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-[10px] rounded-full border-[1.5px] border-line2 bg-transparent px-[30px] py-[15px] text-[16px] font-semibold text-ink transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-acc hover:bg-ai-bg2 hover:text-acc-dim",
        "active:translate-y-0 active:scale-[0.98]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
