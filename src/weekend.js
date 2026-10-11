const MAX_DAYS = 4;
const DAY_MS = 24 * 60 * 60 * 1000;

// Dates calendaires "yyyy-mm-dd" ↔ millisecondes UTC, pour ne pas dépendre du fuseau du runner.
const toMs = (date) => Date.UTC(...date.split('-').map((n, i) => (i === 1 ? n - 1 : +n)));
const fromMs = (ms) => new Date(ms).toISOString().slice(0, 10);

export const addDays = (date, n) => fromMs(toMs(date) + n * DAY_MS);

export function isWeekendEvent({ start, end }) {
  const days = (toMs(end) - toMs(start)) / DAY_MS + 1;
  if (days > MAX_DAYS) return false;
  for (let d = start; d <= end; d = addDays(d, 1)) {
    const weekday = new Date(toMs(d)).getUTCDay();
    if (weekday === 0 || weekday === 6) return true;
  }
  return false;
}

// Mois en cours à Paris, "yyyy-mm".
export const currentMonth = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit' })
    .format(now);

export function dedupeByUrl(events) {
  return [...new Map(events.map((e) => [e.url, e])).values()];
}

// Événements du week-end qui ne sont pas terminés avant le 1er du mois en cours.
export function selectEvents(events, month) {
  return dedupeByUrl(events)
    .filter((e) => e.end >= `${month}-01`)
    .filter(isWeekendEvent);
}
