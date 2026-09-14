/**
 * A small, dependency-free CSV parser, good enough for the prospect lists people
 * export from Google Sheets, Apollo, or a scrape: quoted fields, commas and
 * newlines inside quotes, and "" as an escaped quote. Returns rows of raw string
 * cells; blank lines are dropped. Header mapping is the caller's job.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  // Normalize newlines so CRLF from Windows exports parses the same as LF.
  const s = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  // Flush the final field and row (files often end without a trailing newline).
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop rows that are entirely empty.
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}
