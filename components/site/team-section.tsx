import { getPublishedTeamMembers } from "@/lib/data/careers";
import { Reveal } from "@/components/site/reveal";

/**
 * Renders published team members. When there are none, the entire section
 * does not exist on the page. No empty state, no "coming soon", no
 * placeholders. Real people or nothing.
 */
export async function TeamSection() {
  const members = await getPublishedTeamMembers();
  if (members.length === 0) return null;

  return (
    <section className="relative mx-auto max-w-[1080px] px-6 pb-[88px] md:px-10">
      <h2 className="mb-8 text-center font-display text-[28px] font-extrabold tracking-[-0.03em] text-ink sm:text-[34px]">
        The team
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m, i) => (
          <Reveal key={m.id} delay={i * 70}>
            <div className="rounded-[18px] border border-line2 bg-card p-6 text-center shadow-soft">
              {m.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.photo_url}
                  alt={m.name}
                  className="mx-auto h-24 w-24 rounded-full border border-line2 object-cover"
                />
              ) : (
                <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-line2 bg-panel font-display text-[28px] font-bold text-mute">
                  {m.name.charAt(0)}
                </div>
              )}
              <h3 className="mt-4 font-display text-[18px] font-bold text-ink">
                {m.name}
              </h3>
              <div className="mt-[2px] text-[13.5px] font-semibold text-acc-dim">
                {m.role_title}
              </div>
              {m.bio && (
                <p className="mt-3 text-[14px] leading-[1.6] text-body">{m.bio}</p>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
