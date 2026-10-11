import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeText, fold, toIcs } from '../src/ics.js';

const loupGarou = {
  url: 'https://www.ateliersdescapucins.fr/fr/programmation/loup-garou-au-ludibar-3',
  title: 'Loup-Garou au Ludibar',
  type: 'Jeux',
  place: 'Ludibar',
  start: '2026-10-10',
  end: '2026-10-10',
};

test('échappement', () => {
  assert.equal(escapeText('a\\b;c,d\ne'), 'a\\\\b\\;c\\,d\\ne');
});

test('repliage à 75 octets sans couper un caractère multi-octets', () => {
  const line = 'SUMMARY:' + 'é'.repeat(100);
  const parts = fold(line).split('\r\n');
  assert.ok(parts.length > 1);
  for (const p of parts) assert.ok(Buffer.byteLength(p) <= 75, p);
  for (const p of parts.slice(1)) assert.ok(p.startsWith(' '));
  assert.equal(parts.map((p, i) => (i ? p.slice(1) : p)).join(''), line);
  assert.equal(fold('court'), 'court');
});

test('événement complet, CRLF, DTEND exclusif', () => {
  const ics = toIcs([loupGarou]);
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.ok(!/[^\r]\n/.test(ics));
  assert.ok(ics.replaceAll('\r\n ', '').includes(
    [
      'BEGIN:VEVENT',
      'UID:loup-garou-au-ludibar-3@capucins-calendar',
      'DTSTAMP:20260101T000000Z',
      'DTSTART;VALUE=DATE:20261010',
      'DTEND;VALUE=DATE:20261011',
      'SUMMARY:[Jeux] Loup-Garou au Ludibar',
      'LOCATION:Ludibar\\, Ateliers des Capucins\\, Brest',
      'URL:https://www.ateliersdescapucins.fr/fr/programmation/loup-garou-au-ludibar-3',
      'DESCRIPTION:https://www.ateliersdescapucins.fr/fr/programmation/loup-garou-au-ludibar-3',
      'END:VEVENT',
    ].join('\r\n'),
  ));
});

test('plage sur plusieurs jours, sans type, fin de mois', () => {
  const ics = toIcs([{ ...loupGarou, type: null, start: '2026-10-30', end: '2026-10-31' }]);
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20261030\r\nDTEND;VALUE=DATE:20261101'));
  assert.ok(ics.includes('SUMMARY:Loup-Garou au Ludibar\r\n'));
});

test('tri stable par date puis URL, indépendant de l\'ordre en entrée', () => {
  const a = { ...loupGarou, url: 'https://x/fr/programmation/b', start: '2026-10-10' };
  const b = { ...loupGarou, url: 'https://x/fr/programmation/a', start: '2026-10-10' };
  const c = { ...loupGarou, url: 'https://x/fr/programmation/c', start: '2026-10-03', end: '2026-10-03' };
  const ics = toIcs([a, b, c]);
  assert.equal(ics, toIcs([c, b, a]));
  assert.deepEqual([...ics.matchAll(/UID:(\w+)@/g)].map((m) => m[1]), ['c', 'a', 'b']);
});
