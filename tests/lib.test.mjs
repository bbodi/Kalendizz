import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const KalLib = require('../lib.js');

const {
  weekendOfStart,
  utcTodayISO,
  cleanTitle,
  orderWeekendEvents,
  colorForEvent,
  colorDistance
} = KalLib;

/* ---------------- weekend math ---------------- */

test('weekendOfStart: Friday belongs to its own weekend (Sat key)', () => {
  const w = weekendOfStart('2026-10-23'); // Friday
  assert.equal(w.key, '2026-10-24');
  assert.equal(w.fri.toISOString().slice(0, 10), '2026-10-23');
  assert.equal(w.sun.toISOString().slice(0, 10), '2026-10-25');
});

test('weekendOfStart: Monday–Thursday roll into the same week\'s weekend', () => {
  assert.equal(weekendOfStart('2026-10-19').key, '2026-10-24'); // Mon
  assert.equal(weekendOfStart('2026-10-22').key, '2026-10-24'); // Thu
});

test('weekendOfStart: Sunday belongs to the weekend that just started', () => {
  assert.equal(weekendOfStart('2026-10-25').key, '2026-10-24'); // Sun
});

test('weekendOfStart: year boundary', () => {
  const w = weekendOfStart('2027-01-01'); // Friday
  assert.equal(w.key, '2027-01-02');
});

test('utcTodayISO is a valid date string', () => {
  assert.match(utcTodayISO(), /^\d{4}-\d{2}-\d{2}$/);
});

/* ---------------- title cleanup ---------------- */

test('cleanTitle: Unicode math letters become plain text', () => {
  assert.equal(cleanTitle('𝗧𝗔́ 𝗕𝗢𝗠 African Rhythms'), 'TÁ BOM African Rhythms');
  assert.equal(
    cleanTitle('𝑼𝑹𝑩𝑨𝑵 𝑲𝑰𝒁 𝑻𝑬𝑴𝑷𝑻𝑨𝑻𝑰𝑶𝑵 𝑭𝑬𝑺𝑻𝑰𝑽𝑨𝑳 𝑨𝑴 𝑩𝑶𝑫𝑬𝑵𝑺𝑬𝑬 4.𝑬𝑫𝑰𝑻𝑰𝑶𝑵'),
    'URBAN KIZ TEMPTATION FESTIVAL AM BODENSEE 4.EDITION');
});

test('cleanTitle: redundant dates are removed', () => {
  assert.equal(
    cleanTitle('WEnd Kizomba Lille | ALL IN ONE | 23 au 25 Octobre'),
    'WEnd Kizomba Lille | ALL IN ONE');
  assert.equal(
    cleanTitle('13° Firenze Kizomba Salsa Bachata Festival 22 23 24 gennaio 2027'),
    '13° Firenze Kizomba Salsa Bachata Festival');
  assert.equal(
    cleanTitle('14, 15 et 16Mai 2027 WANTED FESTIVAL'),
    'WANTED FESTIVAL');
});

test('cleanTitle: duplicated words collapse', () => {
  assert.equal(cleanTitle('Kizomba Festival Festival 2026'), 'Kizomba Festival');
});

test('cleanTitle: stray asterisks and edge years are removed, accents preserved', () => {
  assert.equal(cleanTitle('2027 Alegria Festival Bordeaux édition 6******'),
    'Alegria Festival Bordeaux édition 6');
  assert.equal(cleanTitle('TENTAÇÃO WINTER Zurich'), 'TENTAÇÃO WINTER Zurich');
});

test('cleanTitle: empty input stays empty', () => {
  assert.equal(cleanTitle(''), '');
  assert.equal(cleanTitle(null), '');
});

/* ---------------- colors / ordering ---------------- */

test('colorForEvent: flag maps to the country palette, fallback otherwise', () => {
  assert.equal(colorForEvent({ flag: '🇫🇷' }), '#1a46e5');
  assert.equal(colorForEvent({ flag: '🇬🇧' }), '#0a3459');
  assert.equal(colorForEvent({ flag: '🇺🇸' }), '#3a1f8f');
  assert.equal(colorForEvent({ flag: '❓' }), '#5a6acf');
  assert.equal(colorForEvent({ flag: null, backgroundColor: '#123456' }), '#123456');
});

test('colorDistance: France / UK / US are clearly separated', () => {
  const frUk = colorDistance('#1a46e5', '#0a3459');
  const frUs = colorDistance('#1a46e5', '#3a1f8f');
  const ukUs = colorDistance('#0a3459', '#3a1f8f');
  assert.ok(frUk > 0.18, `FR/UK too close: ${frUk}`);
  assert.ok(frUs > 0.15, `FR/US too close: ${frUs}`);
  assert.ok(ukUs > 0.11, `UK/US too close: ${ukUs}`);
});

test('orderWeekendEvents: same-country events stay grouped', () => {
  const list = [
    { id: 'a', flag: '🇫🇷', start: '2026-11-07', title: 'A' },
    { id: 'b', flag: '🇪🇸', start: '2026-11-06', title: 'B' },
    { id: 'c', flag: '🇫🇷', start: '2026-11-05', title: 'C' },
    { id: 'd', flag: '🇩🇪', start: '2026-11-08', title: 'D' }
  ];
  const out = orderWeekendEvents(list, colorForEvent);
  const flags = out.map(e => e.flag);
  // 🇫🇷 entries must be adjacent
  const frIdx = flags.map((f, i) => (f === '🇫🇷' ? i : -1)).filter(i => i >= 0);
  assert.equal(frIdx.length, 2);
  assert.equal(frIdx[1], frIdx[0] + 1);
});

test('orderWeekendEvents: all events are returned exactly once', () => {
  const list = [
    { id: 'a', flag: '🇫🇷', start: '2026-11-07', title: 'A' },
    { id: 'b', flag: '🇪🇸', start: '2026-11-06', title: 'B' },
    { id: 'c', flag: '🇫🇷', start: '2026-11-05', title: 'C' }
  ];
  const out = orderWeekendEvents(list, colorForEvent);
  assert.deepEqual(out.map(e => e.id).sort(), ['a', 'b', 'c']);
});
