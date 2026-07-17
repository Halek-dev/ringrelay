import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import { Eyebrow } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { getOpenPostings } from "@/lib/data/careers";
import { EMPLOYMENT_TYPE_LABEL } from "@/lib/db-types";
import { AGENCY } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Ring Relay is an early stage, remote first agency hiring its first team members. See the roles we are hiring for right now.",
};

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const postings = await getOpenPostings();

  return (
    <>
      <section className="relative mx-auto max-w-[880px] px-6 pb-14 pt-[88px] text-center md:px-10">
        <div className="fade-1">
          <Eyebrow>Careers</Eyebrow>
        </div>
        <h1 className="fade-2 mt-[26px] text-balance font-display text-[42px] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[54px]">
          Help us answer <span className="headline-em">the missed calls.</span>
        </h1>
        <p className="fade-3 mx-auto mt-[22px] max-w-[600px] text-pretty text-[18px] leading-[1.65] text-body">
          Ring Relay is an early stage agency. We set up AI phone receptionists
          for US home services businesses so they stop losing jobs to missed
          calls. We are remote first and hiring our first team members. Small
          team, real responsibility, honest work.
        </p>
      </section>

      <section className="relative mx-auto max-w-[760px] px-6 pb-[88px] md:px-10">
        {postings.length === 0 ? (
          <div className="rounded-[18px] border border-line2 bg-card p-8 text-center shadow-soft">
            <h2 className="font-display text-[20px] font-bold text-ink">
              No open roles right now
            </h2>
            <p className="mx-auto mt-2 max-w-[440px] text-[15px] leading-[1.6] text-body">
              We hire in small steps as the business grows. If you think you
              would be a fit for a support or outreach role, send us your CV and
              a short note and we will keep it on file.
            </p>
            <a
              href={`mailto:${AGENCY.email}?subject=General application`}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-bold text-bg transition-all hover:bg-acc hover:text-white"
            >
              Send us your CV <ArrowRight size={15} strokeWidth={2.5} />
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {postings.map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                <Link
                  href={`/careers/${p.slug}`}
                  className="group flex flex-col gap-3 rounded-[18px] border border-line2 bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-acc/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-display text-[20px] font-bold tracking-[-0.01em] text-ink">
                      {p.title}
                    </h2>
                    <span className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-acc-dim transition-colors group-hover:text-acc">
                      View role <ArrowRight size={15} strokeWidth={2.4} />
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-[13.5px] font-semibold text-mute">
                    <span className="inline-flex items-center gap-[6px]">
                      <Clock size={13} /> {EMPLOYMENT_TYPE_LABEL[p.employment_type]}
                    </span>
                    <span className="inline-flex items-center gap-[6px]">
                      <MapPin size={13} /> {p.location}
                    </span>
                  </div>
                  <p className="text-[15px] leading-[1.6] text-body">{p.summary}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
