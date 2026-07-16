import type {
  ContactChannel,
  ContactChannelKind,
  ContactResult,
} from "@/lib/db-types";

/**
 * Channel ranking and labels, shared by the crawler (to sort results) and the
 * UI (to render them). Lower rank is better: a direct owner email beats a role
 * email beats a contact form beats Facebook, and guessed emails come last.
 *
 * For trades businesses a Facebook message is often the best real channel, so
 * it ranks above LinkedIn and Instagram and the UI emphasises it.
 */
export const CHANNEL_RANK: Record<ContactChannelKind, number> = {
  email_owner: 1,
  email_role: 2,
  contact_form: 3,
  facebook: 4,
  linkedin: 5,
  instagram: 6,
  email_guessed: 7,
};

export const CHANNEL_LABEL: Record<ContactChannelKind, string> = {
  email_owner: "Owner email",
  email_role: "Role email",
  email_guessed: "Guessed email",
  contact_form: "Contact form",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  instagram: "Instagram",
};

/** Sort channels best-first, then stably by how they were found. */
export function rankChannels(channels: ContactChannel[]): ContactChannel[] {
  return [...channels].sort(
    (a, b) => CHANNEL_RANK[a.kind] - CHANNEL_RANK[b.kind],
  );
}

/** The single best channel for the list-at-a-glance indicator, or null. */
export function bestChannel(result: ContactResult | null): ContactChannel | null {
  if (!result || result.channels.length === 0) return null;
  return rankChannels(result.channels)[0];
}

/** A short label for the best channel, for the leads list. */
export function bestChannelLabel(result: ContactResult | null): string | null {
  const best = bestChannel(result);
  return best ? CHANNEL_LABEL[best.kind] : null;
}
