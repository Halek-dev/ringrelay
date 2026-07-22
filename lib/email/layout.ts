/**
 * Branded email rendering. Client-safe on purpose: the admin editor imports
 * this to show a live preview that is pixel-identical to what actually sends.
 *
 * The design is a fixed wrapper (wordmark, accent bar, footer) around plain
 * text the owner writes in /admin/emails. Inline styles and table layout only,
 * because email clients ignore stylesheets. The owner edits words, never HTML.
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

/** Wrap rendered body text in the fixed Ring Relay email design. */
export function renderEmailHtml(bodyText: string): string {
  const content = textToHtml(bodyText);
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background-color:#f5f1ea;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1ea;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="height:5px;background-color:#ea580c;border-radius:3px 3px 0 0;"></td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border:1px solid #e6ded2;border-top:0;border-radius:0 0 12px 12px;padding:32px 28px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;margin-bottom:24px;color:#101826;">
                Ring<span style="color:#ea580c;">Relay</span>
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;">
                ${content}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8a8577;" align="center">
              Ring Relay. We relay the call. You keep the lead.<br/>
              <a href="${SITE_URL}" style="color:#8a8577;">tryringrelay.com</a> &nbsp;·&nbsp;
              <a href="${SITE_URL}/privacy" style="color:#8a8577;">Privacy</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
