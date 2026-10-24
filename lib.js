/**
 * =====================================================
 * Kalendizz — pure logic library (no DOM access)
 * =====================================================
 *
 * Everything here is deterministic and side-effect free, so it can be
 * unit-tested in Node (`node tests/lib.test.mjs`) as well as used from
 * app.js in the browser.
 *
 * Browser:  window.KalLib
 * Node:     require('./lib.js')
 */
(function (root, factory) {
  const KalLib = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = KalLib;
  }
  root.KalLib = KalLib;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------------- country metadata ---------------- */

  const FLAG_NAMES = {
    '🇦🇱': 'Albania', '🇦🇪': 'United Arab Emirates', '🇦🇴': 'Angola',
    '🇦🇹': 'Austria', '🇧🇦': 'Bosnia and Herzegovina', '🇧🇪': 'Belgium',
    '🇧🇬': 'Bulgaria', '🇨🇦': 'Canada', '🇨🇻': 'Cape Verde', '🇨🇭': 'Switzerland',
    '🇨🇿': 'Czech Republic', '🇩🇪': 'Germany', '🇩🇰': 'Denmark', '🇩🇿': 'Algeria',
    '🇪🇪': 'Estonia', '🇪🇸': 'Spain', '🇫🇮': 'Finland', '🇫🇷': 'France',
    '🇬🇧': 'United Kingdom', '🇭🇷': 'Croatia', '🇭🇺': 'Hungary', '🇮🇩': 'Indonesia',
    '🇮🇹': 'Italy', '🇯🇲': 'Jamaica', '🇰🇿': 'Kazakhstan', '🇱🇹': 'Lithuania',
    '🇱🇺': 'Luxembourg', '🇱🇻': 'Latvia', '🇲🇦': 'Morocco', '🇲🇽': 'Mexico',
    '🇳🇱': 'Netherlands', '🇳🇴': 'Norway', '🇵🇭': 'Philippines', '🇵🇱': 'Poland',
    '🇵🇹': 'Portugal', '🇷🇴': 'Romania', '🇸🇪': 'Sweden', '🇸🇮': 'Slovenia',
    '🇸🇳': 'Senegal', '🇹🇭': 'Thailand', '🇹🇷': 'Turkey', '🇺🇸': 'United States',
    '🇻🇳': 'Vietnam'
  };

  /*
   * Bubble color per country, generated with OKLab color science:
   *   - hue constrained to the country's flag colors,
   *   - pairwise perceptual distance maximized (weighted by event count,
   *     so countries with many festivals get the most distinct colors),
   *   - kept away from the page background and accents.
   * Closest high-count pair (UK/US) is still ≥ 0.12 ΔE(OKLab) apart;
   * France vs UK/US is ≥ 0.16.
   */
  const COUNTRY_COLORS = {
    '🇦🇱': '#cc2964', // Albania - red
    '🇦🇪': '#0f5e3a', // United Arab Emirates - flag green
    '🇦🇴': '#4e0704', // Angola - red/black
    '🇦🇹': '#9c1a0a', // Austria - red
    '🇧🇦': '#0b3d91', // Bosnia and Herzegovina - blue
    '🇧🇪': '#16181d', // Belgium - black
    '🇧🇬': '#18520e', // Bulgaria - green
    '🇨🇦': '#ae374e', // Canada - red
    '🇨🇻': '#0068a5', // Cape Verde - blue
    '🇨🇭': '#770b20', // Switzerland - red
    '🇨🇿': '#005152', // Czech Republic - teal blue
    '🇩🇪': '#8a4a10', // Germany - flag gold
    '🇩🇰': '#ce2960', // Denmark - red
    '🇩🇿': '#2d4301', // Algeria - green
    '🇪🇪': '#007268', // Estonia - teal blue
    '🇪🇸': '#e12929', // Spain - red
    '🇫🇮': '#007177', // Finland - blue
    '🇫🇷': '#1a46e5', // France - blue
    '🇬🇧': '#0a3459', // United Kingdom - navy
    '🇭🇷': '#b21f50', // Croatia - red
    '🇭🇺': '#68610f', // Hungary - olive green
    '🇮🇩': '#a21734', // Indonesia - red
    '🇮🇹': '#177828', // Italy - green
    '🇯🇲': '#146b3a', // Jamaica - green
    '🇰🇿': '#1f7a9c', // Kazakhstan - sky blue
    '🇱🇹': '#454600', // Lithuania - olive
    '🇱🇺': '#07555e', // Luxembourg - cyan
    '🇱🇻': '#911955', // Latvia - carmine red
    '🇲🇦': '#a81723', // Morocco - red
    '🇲🇽': '#017c45', // Mexico - green
    '🇳🇱': '#055dc5', // Netherlands - blue
    '🇳🇴': '#9f183c', // Norway - red
    '🇵🇭': '#10296b', // Philippines - navy
    '🇵🇱': '#b02720', // Poland - red
    '🇵🇹': '#01591c', // Portugal - green
    '🇷🇴': '#7a6a08', // Romania - flag yellow
    '🇸🇪': '#004588', // Sweden - blue
    '🇸🇮': '#006d8c', // Slovenia - blue
    '🇸🇳': '#3d6c10', // Senegal - green
    '🇹🇭': '#232366', // Thailand - navy
    '🇹🇷': '#d8310c', // Turkey - red
    '🇺🇸': '#3a1f8f', // United States - indigo
    '🇻🇳': '#d8284b'  // Vietnam - red
  };

  /**
   * Bubble color for an event: derived from the country flag wherever
   * possible, falling back to the stored color for flagless events.
   */
  function colorForEvent(ev) {
    if (ev.flag && COUNTRY_COLORS[ev.flag]) {
      return COUNTRY_COLORS[ev.flag];
    }
    return ev.backgroundColor || '#5a6acf';
  }

  /* ---------------- date helpers (UTC for events) ---------------- */

  function parseDate(str) {
    return new Date(str + 'T00:00:00Z');
  }

  function addDays(date, n) {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + n);
    return d;
  }

  function iso(date) {
    return date.toISOString().slice(0, 10);
  }

  /**
   * Weekend (Fri–Sun) that contains the given start date.
   * Events starting Mon–Thu land in the weekend of the same week,
   * because festivals run into that weekend.
   */
  function weekendOfStart(startStr) {
    const d = parseDate(startStr);
    const monOffset = (d.getUTCDay() + 6) % 7; // days back to Monday
    const sat = addDays(d, 5 - monOffset);
    return {
      key: iso(sat),
      fri: addDays(sat, -1),
      sat: sat,
      sun: addDays(sat, 1)
    };
  }

  /** Today as YYYY-MM-DD in UTC — keeps weekend math timezone-safe. */
  function utcTodayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  /* ---------------- OKLab color math ---------------- */

  function hexToOklab(hex) {
    const n = parseInt(String(hex).slice(1), 16);
    if (Number.isNaN(n)) return null;
    let r = ((n >> 16) & 255) / 255;
    let g = ((n >> 8) & 255) / 255;
    let b = (n & 255) / 255;
    const lin = v => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    r = lin(r); g = lin(g); b = lin(b);
    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
    const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
    return [
      0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
      1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
      0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    ];
  }

  function colorDistance(hexA, hexB) {
    const A = hexA ? hexToOklab(hexA) : null;
    const B = hexB ? hexToOklab(hexB) : null;
    if (!A || !B) return 0;
    return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
  }

  /**
   * Within one weekend, same-country events stay grouped together,
   * but the GROUP ORDER is optimized so consecutive groups have
   * maximally different bubble colors: sum of consecutive OKLab
   * distances is maximized AND same-hue adjacency is penalized.
   * (Exhaustive for <= 7 groups, 2-opt local search above that.)
   */
  function optimizeGroupOrder(groups) {
    const n = groups.length;
    if (n <= 1) return groups;

    groups.forEach((g, i) => { g._idx = i; });
    const cache = new Map();
    const pair = (g1, g2) => {
      const key = g1._idx < g2._idx ? g1._idx + '|' + g2._idx : g2._idx + '|' + g1._idx;
      if (cache.has(key)) return cache.get(key);
      const de = colorDistance(g1.color, g2.color);
      let sim = 0;
      const A = hexToOklab(g1.color);
      const B = hexToOklab(g2.color);
      if (A && B) {
        const hA = Math.atan2(A[2], A[1]) * 180 / Math.PI;
        const hB = Math.atan2(B[2], B[1]) * 180 / Math.PI;
        let hd = Math.abs(hA - hB);
        if (hd > 180) hd = 360 - hd;
        sim = Math.max(0, 1 - de / 0.22) * 0.6 + Math.max(0, 1 - hd / 45) * 0.4;
      }
      const v = { de, sim };
      cache.set(key, v);
      return v;
    };

    const score = arr => {
      let s = 0;
      for (let i = 0; i < arr.length - 1; i++) {
        const p = pair(arr[i], arr[i + 1]);
        s += p.de - 1.2 * p.sim;
      }
      return s;
    };

    // Candidate 1: biggest group first.
    const byCount = groups.slice()
      .sort((a, b) => b.count - a.count || a.start.localeCompare(b.start));
    // Candidate 2: greedy farthest-color walk.
    const greedy = [byCount[0]];
    const rest = byCount.slice(1);
    while (rest.length) {
      let bi = 0, bs = -Infinity;
      rest.forEach((g, i) => {
        const p = pair(greedy[greedy.length - 1], g);
        const sc = p.de - 1.2 * p.sim + Math.min(g.count, 8) * 0.004;
        if (sc > bs) { bs = sc; bi = i; }
      });
      greedy.push(rest.splice(bi, 1)[0]);
    }

    let best = score(greedy) > score(byCount) ? greedy : byCount;
    let bestScore = score(best);

    if (n <= 7) {
      const permute = arr => {
        if (arr.length <= 1) return [arr];
        const out = [];
        arr.forEach((el, i) => {
          const rest = arr.slice(0, i).concat(arr.slice(i + 1));
          permute(rest).forEach(p => out.push([el].concat(p)));
        });
        return out;
      };
      permute(best).forEach(p => {
        const sc = score(p);
        if (sc > bestScore) { best = p; bestScore = sc; }
      });
    } else {
      // 2-opt segment reversal search.
      let improved = true;
      while (improved) {
        improved = false;
        for (let i = 0; i < n - 1 && !improved; i++) {
          for (let k = i + 1; k < n; k++) {
            const cand = best.slice();
            let a = i, b = k;
            while (a < b) {
              const t = cand[a]; cand[a] = cand[b]; cand[b] = t;
              a++; b--;
            }
            const sc = score(cand);
            if (sc > bestScore + 1e-9) {
              best = cand; bestScore = sc; improved = true;
              break;
            }
          }
        }
      }
    }

    groups.forEach(g => { delete g._idx; });
    return best;
  }

  /** Group by country, then order the groups by perceptual color distance. */
  function orderWeekendEvents(list, colorFn) {
    const groups = new Map();
    list.forEach(ev => {
      const key = ev.flag || ('__noflag__' + ev.id);
      if (!groups.has(key)) {
        groups.set(key, {
          color: colorFn(ev),
          count: 0,
          start: ev.start,
          events: []
        });
      }
      const g = groups.get(key);
      g.count++;
      if (ev.start < g.start) g.start = ev.start;
      g.events.push(ev);
    });

    const arr = Array.from(groups.values());
    arr.forEach(g => g.events.sort((a, b) =>
      a.start.localeCompare(b.start) || a.title.localeCompare(b.title)));

    return optimizeGroupOrder(arr).reduce((out, g) => out.concat(g.events), []);
  }

  /* ---------------- event title cleanup ---------------- */
  /*
   * Source titles often contain Unicode math letters (𝗧𝗔́ 𝗕𝗢𝗠),
   * fullwidth characters, stray asterisks, duplicated words
   * ("Festival Festival") and exact dates ("23 au 25 Octobre"),
   * which are all redundant in a dated calendar. This normalizes
   * them for display only — the data in events.js stays untouched.
   */
  const TITLE_MONTH =
    '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|' +
    'Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|' +
    'Dec(?:ember)?|Octobre|janvier|Février|février|mars|avril|mai|juin|' +
    'juillet|août|septembre|novembre|décembre|gennaio|febbraio|marzo|' +
    'aprile|maggio|giugno|luglio|agosto|settembre|ottobre|dicembre|' +
    'enero|febrero|abril|mayo|junio|julio|septiembre|octubre|' +
    'noviembre|diciembre)';

  function cleanTitle(raw) {
    let s = String(raw || '');
    if (!s) return s;

    // Invisible / zero-width chars and soft hyphens.
    s = s.replace(/[\uFEFF\u200B-\u200D\u00AD]/g, '');
    // Unicode math letters, fullwidth glyphs, superscripts… → plain ASCII
    // (NFKD decomposes 𝗧𝗔́ 𝗕𝗢𝗠 → "TA ́ BOM", 𝟭𝟰 → "14", ＦＲＥＥ → "FREE").
    s = s.normalize('NFKD');
    s = s.replace(/\u00A0/g, ' ');
    // Unify dash glyphs.
    s = s.replace(/[\u2010-\u2015\u2212]/g, '-');
    // Stray formatting asterisks ("édition 6******").
    s = s.replace(/\*+/g, '');

    // Exact date in the title → redundant, drop it:
    // "23 au 25 Octobre", "23-25 October 2026", "22 23 24 gennaio",
    // "22.23.24 January 2027", "14, 15 et 16Mai 2027" …
    s = s.replace(new RegExp(
      '\\b\\d{1,2}(?:[\\s,.\\/–-]*(?:au|to|et|and)?[\\s,.\\/–-]*\\d{1,2})+' +
      '(?=\\s*(?:' + TITLE_MONTH + '|20\\d{2})\\b|\\s*$)', 'gi'), ' ');
    // ISO dates "2026-10-23".
    s = s.replace(/\b20\d{2}-\d{2}-\d{2}\b/g, ' ');
    // Single day + month: "1 Nov 2026".
    s = s.replace(new RegExp('\\b\\d{1,2}\\s*' + TITLE_MONTH +
      '(?:\\s*,?\\s*20\\d{2})?\\b', 'gi'), ' ');
    // Bare "October 2026" / "Octobre 2026" / ", October 2026".
    s = s.replace(new RegExp('[\\s,.-]*' + TITLE_MONTH + '\\s*,?\\s*20\\d{2}\\b', 'gi'), ' ');
    // Month word left over after the day numbers were removed ("23 au 25 Octobre" → " Octobre").
    s = s.replace(new RegExp('\\s+' + TITLE_MONTH + '\\b(?!\\s*20\\d{2})', 'gi'), ' ');
    // Year range "2026 - 2027".
    s = s.replace(/\b20\d{2}\s*-\s*20\d{2}\b/g, ' ');
    // Standalone event year at the very start or end ("2027 Alegria Festival…", "… Edition 2026").
    s = s.replace(/^\s*20\d{2}\s+/, '');
    s = s.replace(/\s+20\d{2}\s*$/, ' ');

    // Collapse duplicated consecutive words: "Festival Festival",
    // "Kizomba KIZOMBA", "festival festival" (case-insensitive).
    let prev = '';
    while (prev !== s) {
      prev = s;
      s = s.replace(/\b(\p{L}[\p{L}0-9'’-]*)\s+\1\b/giu, '$1');
    }

    // Normalize spacing around punctuation and separators.
    s = s.replace(/\s+/g, ' ').trim();
    s = s.replace(/\s*,\s*/g, ', ');
    s = s.replace(/\s+([.;:!?])/g, '$1');
    s = s.replace(/^\s*[-–—|,.;:#&]+\s*|\s*[-–—|,.;:#&]+\s*$/g, '');
    s = s.replace(/\s+/g, ' ').trim();
    // Re-compose accented letters that NFKD decomposed (é, ç, ã …).
    s = s.normalize('NFC');

    return s || String(raw || '');
  }

  return {
    FLAG_NAMES,
    COUNTRY_COLORS,
    colorForEvent,
    parseDate,
    addDays,
    iso,
    weekendOfStart,
    utcTodayISO,
    hexToOklab,
    colorDistance,
    optimizeGroupOrder,
    orderWeekendEvents,
    cleanTitle
  };
});
