import { writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { getMonths, fetchMonth } from './site.js';
import { parseTeasers } from './parse.js';
import { currentMonth, selectEvents } from './weekend.js';
import { toIcs } from './ics.js';

const OUTPUT = new URL('../docs/capucins.ics', import.meta.url);

async function main() {
  const month = currentMonth();
  const { formBuildId, months, html } = await getMonths();
  if (!months.includes(month)) throw new Error(`Mois ${month} absent du formulaire (${months.join(', ')})`);

  const teasers = parseTeasers(html);
  console.log(`${month} : ${teasers.length} événements`);
  for (const m of months.filter((m) => m > month)) {
    await sleep(500);
    const found = parseTeasers(await fetchMonth(m, formBuildId));
    console.log(`${m} : ${found.length} événements`);
    teasers.push(...found);
  }

  const events = selectEvents(teasers, month);
  if (events.length === 0) throw new Error('0 événement de week-end trouvé');
  writeFileSync(OUTPUT, toIcs(events));
  console.log(`${events.length} événements écrits dans docs/capucins.ics`);
}

main().catch((err) => {
  console.error(`Échec : ${err.message}`);
  process.exit(1);
});
