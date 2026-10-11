import * as cheerio from 'cheerio';
import { BASE_URL, htmlFromAjax } from './parse.js';

const PAGE_URL = `${BASE_URL}/fr/programmation`;
const AJAX_URL = `${PAGE_URL}?ajax_form=1&_wrapper_format=drupal_ajax`;

async function request(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${url} : HTTP ${res.status}`);
  return res;
}

// La page affiche le mois en cours, y compris ses événements passés (absents de la réponse AJAX).
export async function getMonths() {
  const html = await (await request(PAGE_URL)).text();
  const form = cheerio.load(html)('#event-filters-form');
  if (form.length === 0) throw new Error('Formulaire #event-filters-form introuvable');
  const formBuildId = form.find('input[name="form_build_id"]').val();
  const months = form.find('input[name="month"]').map((_, el) => el.attribs.value).get();
  if (!formBuildId || months.length === 0) {
    throw new Error('Formulaire incomplet : form_build_id ou mois manquants');
  }
  return { formBuildId, months, html };
}

export async function fetchMonth(month, formBuildId) {
  const res = await request(AJAX_URL, {
    method: 'POST',
    body: new URLSearchParams({
      month,
      form_build_id: formBuildId,
      form_id: 'event_filters_form',
      _triggering_element_name: 'month',
    }),
  });
  return htmlFromAjax(await res.json());
}
