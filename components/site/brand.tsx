/**
 * Ring Relay brand mark — a soundwave (three bars) inside a ring.
 *
 * - <BrandGlyph>  the glyph on its own (recolorable). Matches
 *   ringrelay-glyph-1d.svg; use on light backgrounds where no tile is wanted.
 * - <BrandMark>   the glyph in white on the orange gradient app-icon tile.
 *   Matches ringrelay-logo-1d.svg; the favicon (app/icon.svg) is the same art.
 */

export function BrandGlyph({
  size = 24,
  color = "currentColor",
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.6" />
      <rect x="7.4" y="8.5" width="2.2" height="7" rx="1.1" fill={color} stroke="none" />
      <rect x="10.9" y="6.5" width="2.2" height="11" rx="1.1" fill={color} stroke="none" />
      <rect x="14.4" y="8.5" width="2.2" height="7" rx="1.1" fill={color} stroke="none" />
    </svg>
  );
}

export function BrandMark({
  size = 38,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`grid place-items-center bg-gradient-to-br from-acc-a to-acc-b ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.25), // matches the 128/512 tile radius
        boxShadow:
          "0 4px 14px rgba(234,88,12,0.3), inset 0 1px 0 rgba(255,255,255,0.35)",
      }}
    >
      <BrandGlyph size={Math.round(size * 0.62)} color="#FFFFFF" />
    </span>
  );
}
