import { Eyebrow } from "@/components/site/section";

/** Shared shell for legal pages: consistent width, type, and spacing. */
export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto max-w-[760px] px-6 pb-[88px] pt-14 md:px-10">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-5 font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[42px]">
        {title}
      </h1>
      <p className="mt-2 text-[13.5px] font-semibold text-mute">
        Last updated: {updated}
      </p>
      <div className="legal-prose mt-8 flex flex-col gap-6">{children}</div>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 font-display text-[20px] font-bold tracking-[-0.01em] text-ink">
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-[15px] leading-[1.7] text-body">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="ml-5 flex list-disc flex-col gap-[6px] text-[15px] leading-[1.65] text-body marker:text-acc">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
