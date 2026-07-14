import { cn } from "@/lib/utils";

/** Mono eyebrow label (e.g. "01 · How it works"). */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-acc-dim",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Headline with the signature orange underline on the emphasized fragment.
 * Pass `pre` for the plain part and `em` for the underlined part.
 */
export function Headline({
  pre,
  em,
  className,
}: {
  pre: string;
  em?: string;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "text-balance font-display font-extrabold tracking-[-0.035em] text-ink",
        className,
      )}
    >
      {pre}
      {em ? (
        <>
          {" "}
          <span className="headline-em">{em}</span>
        </>
      ) : null}
    </h1>
  );
}
