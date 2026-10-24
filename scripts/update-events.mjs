#!/usr/bin/env node
/**
 * =====================================================
 * Update events.js from https://kizomba-world.com/
 * =====================================================
 *
 * The site hides behind Cloudflare for plain HTTP clients, so this
 * script pulls the Tribe Events REST API through the r.jina.ai reader
 * proxy (the same public endpoint a browser add-on would use).
 *
 * Usage:
 *   node scripts/update-events.mjs            # fetch + merge + write
 *   node scripts/update-events.mjs --dry-run  # fetch + report only
 *   node scripts/update-events.mjs --ci       # exit 0 when the fetch is
 *                                             # blocked (scheduled automation)
 *
 * The merge is idempotent:
 *   - events already in events.js are kept untouched (dedupe by slug,
 *     then by normalized title + date proximity),
 *   - only future events (start >= today, UTC) are added,
 *   - country flags are derived from the venue, falling back to
 *     country names found in the event description,
 *   - a small manual-patch table covers events whose country cannot
 *     be derived automatically.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENTS_PATH = path.join(__dirname, '..', 'events.js');
const API_BASE = 'https://kizomba-world.com/wp-json/tribe/events/v1/events';
const READER = 'https://r.jina.ai/';
const DRY_RUN = process.argv.includes('--dry-run');

/* ---------------- country → flag ---------------- */

const FLAG_BY_COUNTRY = {
  'Albania': '🇦🇱', 'Angola': '🇦🇴', 'Armenia': '🇦🇲', 'Australia': '🇦🇺',
  'Austria': '🇦🇹', 'Belgium': '🇧🇪', 'Benin': '🇧🇯',
  'Bosnia and Herzegovina': '🇧🇦', 'Brasil': '🇧🇷', 'Brazil': '🇧🇷',
  'Bulgaria': '🇧🇬', 'Canada': '🇨🇦', 'Cape Verde': '🇨🇻', 'Croatia': '🇭🇷',
  'Cyprus': '🇨🇾', 'Czech Republic': '🇨🇿', 'Denmark': '🇩🇰',
  'Deutschland': '🇩🇪', 'Egypt': '🇪🇬', 'Estonia': '🇪🇪', 'Finland': '🇫🇮',
  'France': '🇫🇷', 'Germany': '🇩🇪', 'Ghana': '🇬🇭', 'Greece': '🇬🇷',
  'Hungary': '🇭🇺', 'Iceland': '🇮🇸', 'India': '🇮🇳', 'Indonesia': '🇮🇩',
  'Ireland': '🇮🇪', 'Italy': '🇮🇹', 'Ivory Cost': '🇨🇮', 'Ivory Coast': '🇨🇮',
  'Jamaica': '🇯🇲', 'Japan': '🇯🇵', 'Kazakhstan': '🇰🇿', 'Korea': '🇰🇷',
  'South Korea': '🇰🇷', 'La Martinique': '🇲🇶', 'Martinique': '🇲🇶',
  'Latvia': '🇱🇻', 'Lithuania': '🇱🇹', 'Luxembourg': '🇱🇺', 'Mauritius': '🇲🇺',
  'Mexico': '🇲🇽', 'Mongolian': '🇲🇳', 'Mongolia': '🇲🇳', 'Morocco': '🇲🇦',
  'Netherlands': '🇳🇱', 'New Caledonia': '🇳🇨', 'New Zealand': '🇳🇿',
  'Norway': '🇳🇴', 'Philippines': '🇵🇭', 'Poland': '🇵🇱', 'Portugal': '🇵🇹',
  'Réunion': '🇷🇪', 'Reunion': '🇷🇪', 'Romania': '🇷🇴', 'Saint Martin': '🇲🇫',
  'Sardegna': '🇮🇹', 'Sénégal': '🇸🇳', 'Senegal': '🇸🇳', 'Serbia': '🇷🇸',
  'Slovakia': '🇸🇰', 'Slovenia': '🇸🇮', 'Spain': '🇪🇸', 'Sweden': '🇸🇪',
  'Switzerland': '🇨🇭', 'Thailand': '🇹🇭', 'Tunisia': '🇹🇳', 'Turkey': '🇹🇷',
  'Ukraine': '🇺🇦', 'United Arab Emirates': '🇦🇪', 'United Kingdom': '🇬🇧',
  'United States': '🇺🇸', 'USA': '🇺🇸', 'Vietnam': '🇻🇳'
};
const COUNTRY_NAMES = Object.keys(FLAG_BY_COUNTRY)
  .sort((a, b) => b.length - a.length);

/* Manual country patch for events the API/description cannot resolve.
   Key: a unique substring of the event title (lowercase). */
const MANUAL_COUNTRY = [
  ['kizomba queen festival', 'Spain'],
  ['malaga dance congress', 'Spain'],
  ['new york sbkz congress', 'United States'],
  ['alegria festival bordeaux', 'France'],
  ['ljubljana', 'Slovenia'],
  ['samstg da muxima', 'Germany'],
  ['sempre kizomba semba', 'Canada'],
  ['jamais dodo', 'United States'],
  ['kizomba festival london', 'United Kingdom'],
  ['orléans kizomba festival', 'France'],
  ['orleans kizomba festival', 'France'],
  ['dc cherry blossom', 'United States'],
  ['rotterdam', 'Netherlands'],
  ['tarraxo spring lyon', 'France'],
  ['ktk bali', 'Indonesia'],
  ['wanted festival', 'France'],
  ['ta bom african rhythms', 'Spain'],
  ['urban kiz temptation bodensee', 'Germany'],
  ["l'immersion caribbean dream", 'France'],
  ['kyiv dance festival', 'Ukraine']
];

/* Known-good corrections for events whose site header/metadata
   contradicts the page description or external sources
   (verified 2026-10-24). Keyed by decoded event slug. */
const OVERRIDES = {
  'kizomba-tallinn-festival-2027-official-event': {
    start: '2027-03-11', end: '2027-03-15', country: 'Estonia'
  },
  'loves-kizomba-origins-2027-🌺🐝': {
    start: '2027-03-19', end: '2027-03-22', country: 'Spain'
  },
  'belgium-kizz-me-bachamore-festival-2027': {
    start: '2027-04-09', end: '2027-04-12', country: 'Belgium'
  },
  'kizzessence-all-in-one-2027': {
    start: '2027-01-08', end: '2027-01-10', country: 'Germany'
  },
  'kasselkiz-urban-kizomba-weekender-in-kassel': {
    start: '2026-10-30', end: '2026-11-01', country: 'Germany'
  }
};

const FALLBACK_COLORS = [
  '#e74c3c', '#3498db', '#9b59b6', '#1abc9c', '#e67e22', '#2ecc71',
  '#34495e', '#e91e63', '#00bcd4', '#ff5722', '#673ab7', '#795548'
];

/* ---------------- helpers ---------------- */

const decodeEntities = s => String(s || '')
  .replace(/&#8211;|&#8212;|&ndash;|&mdash;/g, '–')
  .replace(/&#8217;|&#039;|&rsquo;/g, "'")
  .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
  .replace(/&#038;|&amp;/g, '&')
  .replace(/&#8230;|&hellip;/g, '…')
  .replace(/&#[0-9]+;/g, ' ');

const slugOf = url => {
  try {
    return decodeURIComponent(String(url || '').replace(/\/$/, '').split('/').pop()).toLowerCase();
  } catch (err) {
    return String(url || '').replace(/\/$/, '').split('/').pop().toLowerCase();
  }
};

const norm = s => String(s || '')
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');

const dayDiff = (a, b) => Math.round(
  (new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000);

const stripHtml = s => decodeEntities(String(s || '').replace(/<[^>]+>/g, ' '));

function findCountryInText(text) {
  for (const name of COUNTRY_NAMES) {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp('(^|[^a-z])' + esc + '([^a-z]|$)', 'i').test(text)) return name;
  }
  return null;
}

function manualCountryFor(title) {
  const t = norm(title);
  for (const [needle, country] of MANUAL_COUNTRY) {
    if (t.includes(norm(needle))) return country;
  }
  return null;
}

/* ---------------- fetch API through the reader proxy ---------------- */

async function fetchApiPage(page, perPage = 50) {
  const url = `${API_BASE}?per_page=${perPage}&page=${page}`;
  const res = await fetch(READER + encodeURIComponent(url), {
    headers: { 'User-Agent': 'kalendizz-updater/1.0' }
  });
  if (!res.ok) throw new Error(`reader HTTP ${res.status} for page ${page}`);
  const text = await res.text();
  // Jina wraps the body in a Markdown preamble; the JSON starts at '{'.
  const jsonStart = text.indexOf('{');
  if (jsonStart === -1) throw new Error(`no JSON on page ${page}`);
  return JSON.parse(text.slice(jsonStart));
}

/* ---------------- load current data ---------------- */

const src = fs.readFileSync(EVENTS_PATH, 'utf8');
const existing = eval(src.match(/const EVENTS = (\[[\s\S]*\]);/)[1]);

const usedSlugs = new Set();
const existingTitles = [];
existing.forEach(e => {
  if (e.link) usedSlugs.add(slugOf(e.link));
  existingTitles.push({ t: norm(e.title), start: e.start });
});

const maxId = existing.reduce((mx, e) => {
  const n = parseInt(String(e.id).replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? Math.max(mx, n) : mx;
}, 0);
let nextId = maxId + 1;
let colorIdx = 0;

/* ---------------- merge ---------------- */

const today = new Date().toISOString().slice(0, 10);
const apiEvents = [];
try {
  for (let page = 1; page <= 10; page++) {
    const data = await fetchApiPage(page);
    apiEvents.push(...(data.events || []));
    if (page >= (data.total_pages || 1)) break;
    console.log(`fetched page ${page}/${data.total_pages} (${data.events.length} events)`);
  }
} catch (err) {
  if (process.argv.includes('--ci')) {
    // Automated runs should never go red because the reader proxy
    // rate-limited us — just skip this week and retry next time.
    console.error('fetch failed (proxy rate limit?):', err.message);
    console.error('--ci mode: exiting 0, nothing updated this run.');
    process.exit(0);
  }
  throw err;
}
console.log(`total API events: ${apiEvents.length}`);

const added = [];
let skippedPast = 0, skippedDup = 0, noCountry = 0;

for (const ev of apiEvents) {
  if (ev.hide_from_listings === true) continue;

  const title = decodeEntities(ev.title).trim();
  const link = ev.url;
  const slug = slugOf(link);

  // Known-good corrections for events whose site header/metadata
  // contradicts the page description or external sources.
  const ov = OVERRIDES[slug] || null;
  let start = ov && ov.start ? ov.start : (ev.start_date || '').slice(0, 10);
  if (!start || start < today) { skippedPast++; continue; }
  if (usedSlugs.has(slug)) { skippedDup++; continue; }

  const nt = norm(title);
  const dup = existingTitles.find(x => {
    if (!x.t || !nt) return false;
    if (Math.abs(dayDiff(x.start, start)) > 21) return false;
    if (x.t === nt) return true;
    const shorter = Math.min(x.t.length, nt.length);
    return shorter >= 10 && (x.t.includes(nt) || nt.includes(x.t));
  });
  if (dup) { skippedDup++; continue; }

  let country = ov && ov.country ? ov.country : null;
  if (!country) {
    const v = ev.venue;
    if (v && !Array.isArray(v) && v.country) country = v.country;
    else if (Array.isArray(v) && v.length && v[0].country) country = v[0].country;
  }
  if (!country) country = findCountryInText(stripHtml(ev.description || ''));
  if (!country) country = manualCountryFor(title);
  if (!country) noCountry++;

  const flag = country ? (FLAG_BY_COUNTRY[country] || null) : null;
  const entry = {
    id: 'evt-' + nextId++,
    flag: flag,
    title: title,
    start: start,
    end: ov && ov.end ? ov.end : ((ev.end_date || '').slice(0, 10) || start),
    link: link,
    backgroundColor: FALLBACK_COLORS[colorIdx++ % FALLBACK_COLORS.length],
    color: '#ffffff'
  };
  if (country) entry.location = country;
  const tags = (ev.tags || []).map(t => t.name).filter(Boolean);
  if (tags.length) entry.tags = tags;

  added.push(entry);
}

console.log(`added: ${added.length} | skippedPast: ${skippedPast} | skippedDup: ${skippedDup} | noCountry: ${noCountry}`);
if (noCountry) {
  console.log('events still without country (add to MANUAL_COUNTRY):');
  added.filter(e => !e.flag).forEach(e => console.log('  -', e.start, e.title.slice(0, 70)));
}

if (DRY_RUN || added.length === 0) {
  console.log(DRY_RUN ? 'dry run — events.js not modified' : 'nothing new to add');
  process.exit(0);
}

/* ---------------- serialize ---------------- */

const merged = existing.concat(added)
  .sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title));

function q(s) { return JSON.stringify(s); }
const lines = [];
lines.push('/**');
lines.push(' * =====================================================');
lines.push(' * EVENTS DEFINITION');
lines.push(' * =====================================================');
lines.push(' *');
lines.push(' * Dance festival events extracted from https://kizomba-world.com/');
lines.push(` * (homepage + TEC REST API, merged ${new Date().toISOString().slice(0, 10)}).`);
lines.push(' * Regenerate with: node scripts/update-events.mjs');
lines.push(' *');
lines.push(' * {');
lines.push(" *   id: 'unique-id',            // Unique identifier");
lines.push(" *   flag: '🇫🇷',                 // Country flag emoji");
lines.push(" *   title: 'Event name',        // Display name");
lines.push(" *   start: '2026-10-23',        // Start date (YYYY-MM-DD)");
lines.push(" *   end: '2026-10-25',          // End date (YYYY-MM-DD)");
lines.push(" *   link: 'https://...',        // Link URL (opens on click)");
lines.push(" *   backgroundColor: '#e74c3c', // Fallback chip color");
lines.push(" *   color: '#ffffff',           // Chip text color (optional)");
lines.push(" *   location: 'France',         // Country (optional)");
lines.push(" *   tags: ['Kizomba'],          // Dance tags (optional)");
lines.push(' * }');
lines.push(' *');
lines.push(' * Bubble colors are derived from the country flag in lib.js.');
lines.push(' * =====================================================');
lines.push(' */');
lines.push('');
lines.push('const EVENTS = [');
merged.forEach((e, i) => {
  const keys = ['id', 'flag', 'title', 'start', 'end', 'link', 'backgroundColor', 'color'];
  if (e.location) keys.push('location');
  if (e.tags) keys.push('tags');
  if (e.deal) keys.push('deal');
  if (e.cancelled) keys.push('cancelled');
  lines.push('  {');
  keys.forEach((k, j) => {
    const comma = j < keys.length - 1 ? ',' : '';
    lines.push(`    ${k}: ${q(e[k])}${comma}`);
  });
  lines.push('  }' + (i < merged.length - 1 ? ',' : ''));
});
lines.push('];');
lines.push('');
lines.push('// Do not modify the line below!');
lines.push('window.EVENTS = EVENTS;');
lines.push('');
fs.writeFileSync(EVENTS_PATH, lines.join('\n'));
console.log(`wrote ${EVENTS_PATH} | total events: ${merged.length}`);
