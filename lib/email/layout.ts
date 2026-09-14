/**
 * Branded email rendering. Client-safe on purpose: the admin editor imports
 * this to show a live preview that is pixel-identical to what actually sends.
 *
 * The design is a fixed wrapper (a bold orange header band with the wordmark
 * and tagline, a white body, and a quiet footer) around plain text the owner
 * writes in /admin/emails. Inline styles and table layout only, because email
 * clients ignore stylesheets. The owner edits words, never HTML.
 */

export type EmailVars = Record<string, string>;

/** Replace {{variable}} tokens. Unknown tokens are removed rather than shown. */
export function substituteVars(text: string, vars: EmailVars): string {
  return text.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_, k: string) => {
    const key = k.toLowerCase();
    return vars[key] ?? "";
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain text with blank-line paragraphs and line breaks becomes safe HTML. */
function textToHtml(text: string, color = "#3f4a5a", gap = 16): string {
  return text
    .split(/\n{2,}/)
    .map(
      (para) =>
        `<p style="margin:0 0 ${gap}px 0;font-size:15px;line-height:1.6;color:${color};">${escapeHtml(
          para.trim(),
        ).replace(/\n/g, "<br/>")}</p>`,
    )
    .join("");
}

const SITE_URL = "https://tryringrelay.com";

export type EmailCta = { label: string; url: string };

/** The call-to-action added to cold outreach emails (not careers mail). */
export const OUTREACH_CTA: EmailCta = {
  label: "Book a 15-minute call",
  url: `${SITE_URL}/book`,
};

export type RenderOpts = {
  cta?: EmailCta;
  // Plain, personal style for cold outreach: no colored header or button, so
  // Gmail files it in Primary instead of Promotions. The bold branded style is
  // for transactional mail (careers, booking confirmations).
  plain?: boolean;
};

/**
 * A near plain-text email that reads like a person typed it: no header band,
 * no button, just the message, the booking link as a plain link, and a small
 * sign-off. This is what keeps cold outreach out of the Promotions tab.
 */
function renderPlainEmailHtml(bodyText: string, cta?: EmailCta): string {
  const content = textToHtml(bodyText, "#222222", 15);
  const ctaLine = cta
    ? `<p style="margin:18px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#222222;">Grab a time here: <a href="${cta.url}" style="color:#1a56db;">${cta.label.toLowerCase()}</a></p>`
    : "";
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background-color:#ffffff;">
  <div style="max-width:560px;margin:0 auto;padding:18px 16px;font-family:Arial,Helvetica,sans-serif;">
    ${content}
    ${ctaLine}
    <p style="margin:20px 0 0 0;font-size:13px;line-height:1.6;color:#999999;">
      Ring Relay, Little Rock, Arkansas. Reply STOP and I will take you off this list.
    </p>
  </div>
</body>
</html>`;
}

/** Wrap rendered body text in the Ring Relay email design. */
export function renderEmailHtml(
  bodyText: string,
  opts?: EmailCta | RenderOpts,
): string {
  // Back-compat: an EmailCta may be passed directly as the second argument.
  const o: RenderOpts = opts
    ? "url" in opts
      ? { cta: opts }
      : opts
    : {};
  if (o.plain) return renderPlainEmailHtml(bodyText, o.cta);
  const cta = o.cta;
  const content = textToHtml(bodyText);
  const ctaBlock = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 2px 0;"><tr>
                <td style="background-color:#ea580c;border-radius:8px;">
                  <a href="${cta.url}" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14.5px;font-weight:bold;color:#ffffff;text-decoration:none;">${cta.label}</a>
                </td></tr></table>`
    : "";
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background-color:#efe9df;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#efe9df;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border:1px solid #e6ded2;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background-color:#ea580c;padding:22px 28px 20px 28px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:21px;font-weight:bold;color:#ffffff;letter-spacing:.01em;">
                Ring Relay
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12.5px;font-weight:600;color:#ffd9c4;margin-top:4px;">
                More reviews. More calls. On autopilot.
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;padding:28px 28px 22px 28px;font-family:Arial,Helvetica,sans-serif;">
              ${content}
              ${ctaBlock}
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;padding:0 28px 24px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#9a9484;">
              <a href="${SITE_URL}" style="color:#9a9484;">tryringrelay.com</a> &nbsp;·&nbsp;
              <a href="${SITE_URL}/privacy" style="color:#9a9484;">Privacy</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
