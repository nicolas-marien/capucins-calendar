import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isWeekendEvent, selectEvents, dedupeByUrl, currentMonth } from '../src/weekend.js';
import { allFixtures } from './helpers.js';

const selected = selectEvents(allFixtures(), '2026-10');
const titles = selected.map((e) => e.title);

test('repères gardés', () => {
  for (const title of [
    "Deus'ta ! 2026",
    'Village des sciences de Brest - Fête de la Science 2026',
    'Festival Ménopause',
    '10 ANS ENSEMBLE !',
    'Marché du Monde 2026',
    'Festival du Livre de Brest',
    'Les rendez-vous des 4-7 ans : Histoires bilingues français/breton',
  ]) {
    assert.ok(titles.includes(title), title);
  }
});

test('repères exclus', () => {
  for (const title of [
    'Les rendez-vous des 8-12 ans / Jeu "Mon lopin de mer"',
    'S@medis connectés',
    'Les Ateliers fêtent leurs 10 ans !',
  ]) {
    assert.ok(!titles.includes(title), title);
  }
});

test("Deus'ta, présent en octobre et novembre, n'apparaît qu'une fois", () => {
  assert.equal(allFixtures().filter((e) => e.title === "Deus'ta ! 2026").length, 2);
  assert.equal(titles.filter((t) => t === "Deus'ta ! 2026").length, 1);
});

test('même titre, URL différentes : deux événements', () => {
  const festival = selected.filter((e) => /^Festival du livre de Brest$/i.test(e.title));
  assert.equal(festival.length, 2);
});

test('limite des 4 jours', () => {
  // 2026-10-10 est un samedi.
  assert.ok(isWeekendEvent({ start: '2026-10-07', end: '2026-10-10' })); // 4 jours
  assert.ok(!isWeekendEvent({ start: '2026-10-07', end: '2026-10-11' })); // 5 jours
  assert.ok(!isWeekendEvent({ start: '2026-10-12', end: '2026-10-15' })); // lun.–jeu.
  assert.ok(isWeekendEvent({ start: '2026-10-11', end: '2026-10-11' })); // dimanche
  assert.ok(!isWeekendEvent({ start: '2026-10-14', end: '2026-10-14' })); // mercredi
  assert.ok(isWeekendEvent({ start: '2026-12-31', end: '2027-01-03' })); // à cheval sur l'année
});

test('fenêtre : les événements terminés avant le 1er du mois sont exclus', () => {
  const events = [
    { url: 'a', start: '2026-09-26', end: '2026-09-26' },
    { url: 'b', start: '2026-09-30', end: '2026-10-03' },
    { url: 'c', start: '2026-10-03', end: '2026-10-03' },
  ];
  assert.deepEqual(selectEvents(events, '2026-10').map((e) => e.url), ['b', 'c']);
});

test('dedupeByUrl', () => {
  assert.equal(dedupeByUrl([{ url: 'a' }, { url: 'a' }, { url: 'b' }]).length, 2);
});

test('currentMonth à Paris', () => {
  assert.equal(currentMonth(new Date('2026-10-31T23:30:00Z')), '2026-11');
  assert.equal(currentMonth(new Date('2026-10-31T22:30:00Z')), '2026-10');
});
