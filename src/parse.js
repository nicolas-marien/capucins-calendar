import * as cheerio from 'cheerio';

export const BASE_URL = 'https://www.ateliersdescapucins.fr';

const clean = (text) => text.replace(/\s+/g, ' ').trim();

// "dd/mm/yyyy" → "yyyy-mm-dd"
const isoDate = (d) => d.split('/').reverse().join('-');

export function parseDates(text) {
  let m = text.match(/^Le (\d{2}\/\d{2}\/\d{4})$/);
  if (m) return { start: isoDate(m[1]), end: isoDate(m[1]) };
  m = text.match(/^Du (\d{2}\/\d{2}\/\d{4}) au (\d{2}\/\d{2}\/\d{4})$/);
  if (m) return { start: isoDate(m[1]), end: isoDate(m[2]) };
  return null;
}

export function parseTeasers(html) {
  const $ = cheerio.load(html);
  return $('a.EventFestivalTeaser[href]')
    .map((_, el) => {
      const a = $(el);
      const url = new URL(a.attr('href'), BASE_URL).href;
      const title = clean(a.find('h2').text());
      const dateText = clean(a.find('.info-datetime').text());
      const dates = parseDates(dateText);
      if (!dates) {
        throw new Error(`Format de date inconnu « ${dateText} » pour « ${title} » (${url})`);
      }
      return {
        url,
        title,
        type: clean(a.find('.EventFestivalTeaser-content-type .wrapper').text()) || null,
        place: clean(a.find('.info-place').text()) || null,
        ...dates,
      };
    })
    .get();
}

// Extrait le HTML de la liste d'une réponse AJAX Drupal (tableau de commandes).
export function htmlFromAjax(commands) {
  const results = commands.filter(
    (c) => c.command === 'insert' && c.selector === '[data-drupal-selector=edit-results]',
  );
  if (results.length === 0) throw new Error('Réponse AJAX sans liste de résultats');
  return results.map((c) => c.data).join('');
}
