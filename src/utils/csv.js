function escapeField(value) {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'string' ? value : String(value);
  const needsQuoting =
    str.includes(',') ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r');
  if (!needsQuoting) return str;
  return '"' + str.replace(/"/g, '""') + '"';
}

export function exportToCSV(rows, headers) {
  const cols = Array.isArray(headers) && headers.length > 0
    ? headers
    : rows && rows.length > 0
      ? Object.keys(rows[0])
      : [];
  const lines = [];
  lines.push(cols.map((h) => escapeField(h)).join(','));
  for (const row of rows || []) {
    const line = cols
      .map((key) => escapeField(row ? row[key] : ''))
      .join(',');
    lines.push(line);
  }
  return lines.join('\r\n');
}

export function downloadCSV(filename, csvString) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Parse CSV text into an array of row objects keyed by the first row's headers.
 * Handles quoted fields, escaped quotes ("" inside quoted field), and both CRLF
 * and LF line endings. A trailing newline does not produce an empty row.
 */
export function parseCSV(text) {
  if (typeof text !== 'string' || text.length === 0) return [];
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < n && text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ',') {
      row.push(field);
      field = '';
      i += 1;
      continue;
    }
    if (ch === '\r') {
      // CRLF: skip \n if present
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
      if (i + 1 < n && text[i + 1] === '\n') {
        i += 2;
      } else {
        i += 1;
      }
      continue;
    }
    if (ch === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
      i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }

  // Flush the last field / row if the input did not end with a newline, or
  // if we accumulated any content on the current row.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => String(h));
  const out = [];
  for (let r = 1; r < rows.length; r += 1) {
    const current = rows[r];
    // Skip truly empty trailing lines (a single empty field and nothing else).
    if (current.length === 1 && current[0] === '') continue;
    const obj = {};
    for (let c = 0; c < headers.length; c += 1) {
      obj[headers[c]] = c < current.length ? current[c] : '';
    }
    out.push(obj);
  }
  return out;
}
