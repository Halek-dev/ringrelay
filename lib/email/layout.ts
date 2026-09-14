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
function textToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map(
      (para) =>
        `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:#3f4a5a;">${escapeHtml(
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

/** Wrap rendered body text in the fixed Ring Relay email design. */
export function renderEmailHtml(bodyText: string, cta?: EmailCta): string {
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
