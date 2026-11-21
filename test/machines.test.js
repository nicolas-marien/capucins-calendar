import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterMachines } from '../src/machines.js';
import { parseDescription } from '../src/parse.js';
import { selectEvents } from '../src/weekend.js';
import { allFixtures } from './helpers.js';

const detail = (name) =>
  parseDescription(readFileSync(new URL(`fixtures/detail-${name}.html`, import.meta.url), 'utf8'));

test('description : seul le texte de l\'événement, pas les événements liés', () => {
  const festival = detail('festival-du-livre');
  assert.match(festival, /transforme la Place des Machines/);
  assert.doesNotMatch(festival, /Festival du Livre de Brest.*Le \d{2}\/\d{2}/);
  assert.match(detail('marche-du-monde'), /Marché du Monde/);
});

test('lieu Place des Machines gardé, lieu générique selon la description, autres lieux exclus', async () => {
  const fetched = [];
  const describe = async (url) => {
    fetched.push(url);
    return url.endsWith('/festival-du-livre-de-brest') ? detail('festival-du-livre') : 'Dans le hall.';
  };
  const kept = await filterMachines(selectEvents(allFixtures(), '2026-10'), describe);
  const titles = kept.map((e) => e.title);

  for (const t of ["Deus'ta ! 2026", 'Marché du Monde 2026', 'Festival du Livre de Brest']) {
    assert.ok(titles.includes(t), t);
  }
  assert.ok(!titles.includes('10 ANS ENSEMBLE !'));
  assert.ok(!titles.includes('Festival du livre de Brest')); // version Médiathèque
  assert.ok(!kept.some((e) => /Médiathèque|Ludibar|Auditorium/.test(e.place)));
  // Pas de page de détail pour les événements dont le lieu est précis.
  assert.ok(!fetched.some((u) => /marche-du-monde|deusta/.test(u)));
});
