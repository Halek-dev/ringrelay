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
      <div className="relative flex flex-col items-stretch justify-between gap-7 overflow-hidden rounded-[24px] bg-ink px-6 py-10 md:flex-row md:items-center md:px-[60px] md:py-14">
        <div className="hazard-stripe-onink absolute inset-x-0 top-0 h-1" />
        <div>
          <h2 className="font-display text-[26px] font-extrabold tracking-[-0.03em] text-white sm:text-[28px] md:text-[34px]">
            {title}
          </h2>
          <p className="mt-[10px] text-[16px] text-white/[0.65] sm:text-[17px]">
            {subtitle}
          </p>
        </div>
        <PrimaryCta href={ctaHref} className="w-full shrink-0 md:w-auto">
          {ctaLabel}
        </PrimaryCta>
      </div>
    </section>
  );
}
