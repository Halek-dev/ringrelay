import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, MapPin, Clock, Globe2, Wallet } from "lucide-react";
import { getOpenPostingBySlug } from "@/lib/data/careers";
import { EMPLOYMENT_TYPE_LABEL } from "@/lib/db-types";
import { ApplyForm } from "@/components/site/apply-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const posting = await getOpenPostingBySlug(params.slug);
  return {
    title: posting ? `${posting.title} · Careers` : "Careers",
    description: posting?.summary ?? "Open roles at Ring Relay.",
  };
}

export default async function JobPage({
  params,
}: {
  params: { slug: string };
}) {
  const posting = await getOpenPostingBySlug(params.slug);
  if (!posting) notFound();

  const facts = [
    { icon: Clock, label: EMPLOYMENT_TYPE_LABEL[posting.employment_type] },
    { icon: MapPin, label: posting.location },
    ...(posting.pay_range ? [{ icon: Wallet, label: posting.pay_range }] : []),
    ...(posting.hours_per_week ? [{ icon: Clock, label: posting.hours_per_week }] : []),
    ...(posting.timezone_requirement
      ? [{ icon: Globe2, label: posting.timezone_requirement }]
      : []),
  ];

  return (
    <div className="relative mx-auto max-w-[760px] px-6 pb-[88px] pt-14 md:px-10">
      <Link
        href="/careers"
        className="inline-flex items-center gap-2 text-[14px] font-semibold text-body hover:text-ink"
      >
        <ArrowLeft size={15} /> All roles
      </Link>

      <h1 className="mt-6 font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[42px]">
        {posting.title}
      </h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {facts.map((f, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-[6px] rounded-full border border-line2 bg-card px-3 py-[6px] text-[13px] font-semibold text-body"
          >
            <f.icon size={13} className="text-acc" /> {f.label}
          </span>
        ))}
      </div>

      <div className="mt-8 whitespace-pre-line text-[16px] leading-[1.7] text-body">
        {posting.description}
      </div>

      {posting.responsibilities.length > 0 && (
        <JobList title="What you will do" items={posting.responsibilities} />
      )}
      {posting.requirements.length > 0 && (
        <JobList title="What we need" items={posting.requirements} />
      )}
      {posting.nice_to_haves.length > 0 && (
        <JobList title="Nice to have" items={posting.nice_to_haves} />
      )}

      <div id="apply" className="mt-12">
        <h2 className="mb-1 font-display text-[24px] font-extrabold tracking-[-0.02em] text-ink">
          Apply for this role
        </h2>
        <p className="mb-6 text-[14.5px] text-body">
          Short and honest beats long and polished. Tell us why this role fits
          you.
        </p>
        <ApplyForm postingId={posting.id} postingTitle={posting.title} />
      </div>
    </div>
  );
}

function JobList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 font-display text-[19px] font-bold tracking-[-0.01em] text-ink">
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-[10px]">
            <Check size={16} strokeWidth={2.6} className="mt-[3px] shrink-0 text-acc" />
            <span className="text-[15px] leading-[1.6] text-body">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
