import { PrimaryCta } from "@/components/site/buttons";

/** Navy final-CTA band with a hazard stripe across the top. */
export function CtaBand({
  title,
  subtitle,
  ctaLabel = "Book a Demo",
  ctaHref = "/contact",
}: {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <section className="relative z-10 mx-auto max-w-[1280px] px-6 pb-24 md:px-10">
      <div className="relative flex flex-col items-start justify-between gap-8 overflow-hidden rounded-[24px] bg-ink px-8 py-12 md:flex-row md:items-center md:px-[60px] md:py-14">
        <div className="hazard-stripe-onink absolute inset-x-0 top-0 h-1" />
        <div>
          <h2 className="font-display text-[28px] font-extrabold tracking-[-0.03em] text-white md:text-[34px]">
            {title}
          </h2>
          <p className="mt-[10px] text-[17px] text-white/[0.65]">{subtitle}</p>
        </div>
        <PrimaryCta href={ctaHref} className="shrink-0">
          {ctaLabel}
        </PrimaryCta>
      </div>
    </section>
  );
}
