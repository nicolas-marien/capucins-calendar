import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDates, parseTeasers, htmlFromAjax } from '../src/parse.js';
import { october, ajaxMonth } from './helpers.js';

test('parse la page HTML du mois en cours', () => {
  const events = october();
  assert.equal(events.length, 61);
  assert.deepEqual(
    events.find((e) => e.title === 'Festival Ménopause'),
    {
      url: 'https://www.ateliersdescapucins.fr/fr/programmation/festival-menopause',
      title: 'Festival Ménopause',
      type: 'Salon',
      place: 'Les Ateliers des Capucins',
      start: '2026-10-18',
      end: '2026-10-18',
    },
  );
});

test('parse les réponses AJAX', () => {
  assert.equal(ajaxMonth('2026-11').length, 39);
  assert.equal(ajaxMonth('2026-12').length, 18);
  const deusta = ajaxMonth('2026-11').find((e) => e.title === "Deus'ta ! 2026");
  assert.equal(deusta.start, '2026-10-30');
  assert.equal(deusta.end, '2026-11-01');
});

test('type absent → null', () => {
  const tenYears = october().find((e) => e.title === 'Les Ateliers fêtent leurs 10 ans !');
  assert.equal(tenYears.type, null);
});

test('loup-garou : URL absolue, type, lieu', () => {
  const e = october().find((e) => e.url.endsWith('/loup-garou-au-ludibar-3'));
  assert.equal(e.url, 'https://www.ateliersdescapucins.fr/fr/programmation/loup-garou-au-ludibar-3');
  assert.equal(e.title, 'Loup-Garou au Ludibar');
  assert.equal(e.type, 'Jeux');
  assert.equal(e.place, 'Ludibar');
});

test('parseDates', () => {
  assert.deepEqual(parseDates('Le 10/10/2026'), { start: '2026-10-10', end: '2026-10-10' });
  assert.deepEqual(parseDates('Du 29/05/2026 au 30/03/2027'), { start: '2026-05-29', end: '2027-03-30' });
  assert.equal(parseDates('Tous les samedis'), null);
});

test('un format de date inconnu fait échouer', () => {
  const html = '<a class="EventFestivalTeaser" href="/fr/programmation/x"><h2>X</h2><div class="info-datetime">Bientôt</div></a>';
  assert.throws(() => parseTeasers(html), /Format de date inconnu « Bientôt »/);
});

test('htmlFromAjax échoue sans liste de résultats', () => {
  assert.throws(() => htmlFromAjax([{ command: 'settings' }]), /sans liste/);
});
