// Minimal CSV parser supporting quoted fields with embedded commas/quotes.
// Returns an array of row objects keyed by the header names.
export function parseCSV(text) {
  const rows = [];
  let field = '';
  let record = [];
  let inQuotes = false;
  text = text.replace(/\r\n?/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      record.push(field); field = '';
    } else if (c === '\n') {
      record.push(field); field = '';
      if (record.some((v) => v !== '')) rows.push(record);
      record = [];
    } else field += c;
  }
  if (field !== '' || record.length) {
    record.push(field);
    if (record.some((v) => v !== '')) rows.push(record);
  }

  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const o = {};
    header.forEach((h, idx) => { o[h] = (r[idx] ?? '').trim(); });
    return o;
  });
}
