import Link from "next/link";
import { BrandMark } from "@/components/site/brand";
import { AGENCY } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  size = 38,
}: {
  href?: string | null;
  className?: string;
  size?: number;
}) {
  const inner = (
    <span className={cn("flex items-center gap-[11px]", className)}>
      <BrandMark size={size} />
      <span className="font-display text-[21px] font-extrabold tracking-[-0.03em] text-ink">
        {AGENCY.wordmark.black}
        <span className="text-acc">{AGENCY.wordmark.accent}</span>
      </span>
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="inline-flex">
      {inner}
    </Link>
  );
}
