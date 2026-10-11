import { addDays } from './weekend.js';

const DTSTAMP = '20260101T000000Z';

export const escapeText = (s) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

// Replie une ligne à 75 octets UTF-8 sans couper un caractère.
export function fold(line) {
  const out = [];
  let current = '';
  let bytes = 0;
  for (const ch of line) {
    const size = Buffer.byteLength(ch);
    if (bytes + size > 75) {
      out.push(current);
      current = ' ';
      bytes = 1;
    }
    current += ch;
    bytes += size;
  }
  out.push(current);
  return out.join('\r\n');
}

const compact = (date) => date.replaceAll('-', '');

function location(place) {
  if (!place) return 'Ateliers des Capucins, Brest';
  if (/capucins/i.test(place)) return `${place}, Brest`;
  return `${place}, Ateliers des Capucins, Brest`;
}

function vevent(e) {
  const slug = new URL(e.url).pathname.split('/').filter(Boolean).pop();
  return [
    'BEGIN:VEVENT',
    `UID:${slug}@capucins-calendar`,
    `DTSTAMP:${DTSTAMP}`,
    `DTSTART;VALUE=DATE:${compact(e.start)}`,
    `DTEND;VALUE=DATE:${compact(addDays(e.end, 1))}`,
    `SUMMARY:${escapeText(e.type ? `[${e.type}] ${e.title}` : e.title)}`,
    `LOCATION:${escapeText(location(e.place))}`,
    `URL:${e.url}`,
    `DESCRIPTION:${escapeText(e.url)}`,
    'END:VEVENT',
  ];
}

export function toIcs(events) {
  const sorted = [...events].sort(
    (a, b) => a.start.localeCompare(b.start) || a.url.localeCompare(b.url),
  );
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//nicolas-marien//capucins-calendar//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Capucins – week-ends',
    'X-WR-CALDESC:Événements du week-end aux Ateliers des Capucins (Brest)',
    'REFRESH-INTERVAL;VALUE=DURATION:P1D',
    'X-PUBLISHED-TTL:P1D',
    ...sorted.flatMap(vevent),
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}
