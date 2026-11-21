import { writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { getMonths, fetchMonth, fetchPage } from './site.js';
import { parseTeasers, parseDescription } from './parse.js';
import { filterMachines } from './machines.js';
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

  const weekend = selectEvents(teasers, month);
  if (weekend.length === 0) throw new Error('0 événement de week-end trouvé');
  // Un week-end sans rien sur la Place des Machines est normal : pas d'échec ici.
  const events = await filterMachines(weekend, async (url) => {
    await sleep(500);
    return parseDescription(await fetchPage(url));
  });
  writeFileSync(OUTPUT, toIcs(events));
  console.log(`${events.length} événements écrits dans docs/capucins.ics`);
}

main().catch((err) => {
  console.error(`Échec : ${err.message}`);
  process.exit(1);
});
