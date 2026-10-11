import { readFileSync } from 'node:fs';
import { htmlFromAjax, parseTeasers } from '../src/parse.js';

const read = (name) => readFileSync(new URL(`fixtures/${name}`, import.meta.url), 'utf8');

export const october = () => parseTeasers(read('programmation-2026-10.html'));
export const ajaxMonth = (month) => parseTeasers(htmlFromAjax(JSON.parse(read(`ajax-${month}.json`))));
export const allFixtures = () => [...october(), ...ajaxMonth('2026-11'), ...ajaxMonth('2026-12')];
