/**
 * =====================================================
 * Hand-built weekend calendar — no calendar library.
 * =====================================================
 *
 * Reads window.EVENTS (events.js) and renders a compact
 * calendar organised by WEEKENDS instead of single days:
 *
 *   Month section
 *     Weekend row  (Fri – Sun)
 *       Event chips (flag + name, colored)
 *
 * Extras: country filter panel, favorites (localStorage),
 * "this weekend" highlight, canceled-event styling.
 */

(function () {
  'use strict';

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
   * France / UK / US are 0.22 / 0.17 / 0.17 ΔE(OKLab) apart.
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
    '🇺🇸': '#2c1765', // United States - indigo
    '🇻🇳': '#d8284b'  // Vietnam - red
  };

  const FAVORITES_KEY = 'calendarFavorites';

  const events = window.EVENTS || [];
  const byId = new Map();
  let allFlags = [];
  let activeFlags = new Set();
  let favorites = new Set();
  let showOnlyFavorites = false;
  let showPastEvents = false;
  let currentWeekendKey = null;

  const root = document.getElementById('calendar-root');
  const headerSub = document.getElementById('header-sub');
  const emptyState = document.getElementById('empty-state');
  const filterPanel = document.getElementById('filter-panel');
  const filterToggle = document.getElementById('filter-toggle');
  const filterDropdown = document.getElementById('filter-dropdown');
  const filterGrid = document.getElementById('filter-grid');
  const filterCount = document.getElementById('filter-count');
  const selectAllBtn = document.getElementById('select-all');
  const selectNoneBtn = document.getElementById('select-none');
  const pastToggle = document.getElementById('past-toggle');

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

  function localTodayISO() {
    const now = new Date();
    return now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
  }

  /* ---------------- weekend labels ---------------- */

  function rangeLabel(w) {
    return w.fri.getUTCDate() + ' – ' + w.sun.getUTCDate();
  }

  function monthLabel(w) {
    const fm = w.fri.getUTCMonth(), fy = w.fri.getUTCFullYear();
    const sm = w.sun.getUTCMonth(), sy = w.sun.getUTCFullYear();
    if (fm === sm && fy === sy) {
      return MONTHS[fm].slice(0, 3) + ' ' + fy;
    }
    if (fy === sy) {
      return MONTHS[fm].slice(0, 3) + ' / ' + MONTHS[sm].slice(0, 3) + ' ' + fy;
    }
    return MONTHS[fm].slice(0, 3) + ' ' + String(fy).slice(2) +
      ' / ' + MONTHS[sm].slice(0, 3) + ' ' + String(sy).slice(2);
  }

  /* ---------------- grouping: months → weekends → events ---------------- */

  /* OKLab conversion for perceptual color distance */
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

  function orderWeekendEvents(list) {
    const groups = new Map();
    list.forEach(ev => {
      const key = ev.flag || ('__noflag__' + ev.id);
      if (!groups.has(key)) {
        groups.set(key, {
          color: colorForEvent(ev),
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

  function buildGroups() {
    const byMonth = new Map();

    events.forEach(ev => {
      const w = weekendOfStart(ev.start);
      const mKey = w.sat.getUTCFullYear() + '-' +
        String(w.sat.getUTCMonth() + 1).padStart(2, '0');

      if (!byMonth.has(mKey)) {
        byMonth.set(mKey, {
          key: mKey,
          label: MONTHS[w.sat.getUTCMonth()] + ' ' + w.sat.getUTCFullYear(),
          weekends: new Map()
        });
      }
      const month = byMonth.get(mKey);
      if (!month.weekends.has(w.key)) {
        month.weekends.set(w.key, Object.assign({ events: [] }, w));
      }
      month.weekends.get(w.key).events.push(ev);
    });

    const months = Array.from(byMonth.values())
      .sort((a, b) => a.key.localeCompare(b.key));

    months.forEach(month => {
      month.weekends = Array.from(month.weekends.values())
        .sort((a, b) => a.key.localeCompare(b.key));
      month.weekends.forEach(w => {
        w.events = orderWeekendEvents(w.events);
      });
      month.count = month.weekends.reduce((n, w) => n + w.events.length, 0);
    });

    return months;
  }

  /* ---------------- rendering ---------------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Bubble color: always derived from the event's country flag,
   * so the same country keeps the same color everywhere.
   * Events without a flag fall back to their stored color.
   */
  function colorForEvent(ev) {
    if (ev.flag && COUNTRY_COLORS[ev.flag]) {
      return COUNTRY_COLORS[ev.flag];
    }
    return ev.backgroundColor || '#5a6acf';
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

  function chipHtml(ev) {
    const bg = colorForEvent(ev);
    const fg = ev.color || '#ffffff';
    const fav = favorites.has(ev.id);
    const title = cleanTitle(ev.title);
    const country = FLAG_NAMES[ev.flag] || ev.location || '';
    const flagHtml = ev.flag
      ? '<span class="chip-flag" role="button" tabindex="-1"' +
        ' data-flag="' + esc(ev.flag) + '"' +
        ' title="Show only ' + esc(country || ev.flag) + '">' +
        esc(ev.flag) + '</span>'
      : '';
    const dealHtml = ev.deal
      ? '<a class="chip-deal" href="' + esc(ev.deal) + '" target="_blank" rel="noopener" title="Get the deal">✨</a>'
      : '';
    const tip = (country && country !== title) ? country + ' — ' + title : title;
    const cancelled = ev.cancelled ? ' cancelled' : '';
    const favClass = fav ? ' favorite' : '';
    const heartClass = fav ? 'chip-heart active' : 'chip-heart';
    const heartIcon = fav ? '❤️' : '🤍';

    return '<div class="event-chip' + cancelled + favClass + '" role="link" tabindex="0"' +
      ' data-id="' + esc(ev.id) + '"' +
      ' data-link="' + esc(ev.link || '') + '"' +
      ' title="' + esc(tip) + '"' +
      ' style="background-color:' + esc(bg) + ';color:' + esc(fg) + '">' +
      flagHtml +
      '<span class="chip-title">' + esc(title) + '</span>' +
      '<span class="' + heartClass + '" data-id="' + esc(ev.id) + '"' +
      ' role="button" aria-label="' + (fav ? 'Remove from favorites' : 'Add to favorites') + '">' +
      heartIcon + '</span>' +
      dealHtml +
      '</div>';
  }

  function weekendRowHtml(w) {
    const cls = ['weekend-row'];
    if (w.key === currentWeekendKey) {
      cls.push('current');
    } else if (w.key < currentWeekendKey) {
      cls.push('past');
    }

    const nowBadge = w.key === currentWeekendKey
      ? '<span class="wd-now">This weekend</span>'
      : '';

    return '<div class="' + cls.join(' ') + '" data-weekend="' + w.key + '">' +
      '<div class="weekend-date">' +
        '<span class="wd-range">' + rangeLabel(w) + '</span>' +
        '<span class="wd-month">' + monthLabel(w) + '</span>' +
        '<span class="wd-days">Fri – Sun</span>' +
        nowBadge +
      '</div>' +
      '<div class="weekend-chips">' +
        w.events.map(chipHtml).join('') +
      '</div>' +
      '</div>';
  }

  function render() {
    byId.clear();
    events.forEach(ev => byId.set(ev.id, ev));

    const groups = buildGroups();
    const totalWeekends = groups.reduce((n, m) => n + m.weekends.length, 0);

    root.innerHTML = groups.map(month =>
      '<section class="month-section" data-month="' + month.key + '">' +
        '<h2 class="month-title">' +
          '<span>' + esc(month.label) + '</span>' +
          '<span class="month-count">' + month.weekends.length + ' weekend' +
            (month.weekends.length > 1 ? 's' : '') + ' · ' + month.count + ' event' +
            (month.count > 1 ? 's' : '') + '</span>' +
        '</h2>' +
        month.weekends.map(weekendRowHtml).join('') +
      '</section>'
    ).join('');

    headerSub.textContent =
      events.length + ' events · ' + totalWeekends + ' weekends · ' +
      allFlags.length + ' countries · 2026–2027';
  }

  /* ---------------- filtering ---------------- */

  function isVisible(ev) {
    if (showOnlyFavorites) {
      return favorites.has(ev.id);
    }
    if (!ev.flag) {
      return activeFlags.size === allFlags.length;
    }
    return activeFlags.has(ev.flag);
  }

  function applyFilters() {
    let visibleTotal = 0;

    root.querySelectorAll('.event-chip').forEach(chip => {
      const ev = byId.get(chip.dataset.id);
      const visible = ev ? isVisible(ev) : true;
      chip.classList.toggle('hidden', !visible);
      if (visible) visibleTotal++;
    });

    root.querySelectorAll('.weekend-row').forEach(row => {
      const hasVisible = row.querySelector('.event-chip:not(.hidden)');
      // Past weekends are collapsed unless "Show past" is enabled.
      const isPast = row.classList.contains('past');
      const hide = !hasVisible || (!showPastEvents && isPast);
      row.classList.toggle('hidden', hide);
    });

    root.querySelectorAll('.month-section').forEach(sec => {
      sec.classList.toggle('hidden', !sec.querySelector('.weekend-row:not(.hidden)'));
    });

    emptyState.classList.toggle('hidden', visibleTotal > 0);
    packAllChips();
    updateFilterCount();
  }

  /* ---------------- past events toggle ---------------- */

  function updatePastToggle() {
    if (!pastToggle) return;
    pastToggle.setAttribute('aria-pressed', String(showPastEvents));
    const icon = pastToggle.querySelector('.past-icon');
    if (icon) icon.textContent = showPastEvents ? '🕑' : '⏳';
    const label = pastToggle.querySelector('.past-label');
    if (label) label.textContent = showPastEvents ? ' Hide past' : ' Show past';
    pastToggle.title = showPastEvents
      ? 'Hide events before this weekend'
      : 'Show events before this weekend';
  }

  /* ---------------- favorites ---------------- */

  function loadFavorites() {
    try {
      favorites = new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'));
    } catch (err) {
      favorites = new Set();
    }
  }

  function saveFavorites() {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
    } catch (err) { /* storage unavailable — favorites are session-only */ }
  }

  function toggleFavorite(id) {
    if (favorites.has(id)) {
      favorites.delete(id);
    } else {
      favorites.add(id);
    }
    saveFavorites();

    const fav = favorites.has(id);
    root.querySelectorAll('.chip-heart[data-id="' + id + '"]').forEach(heart => {
      heart.classList.toggle('active', fav);
      heart.textContent = fav ? '❤️' : '🤍';
      heart.setAttribute('aria-label', fav ? 'Remove from favorites' : 'Add to favorites');
      // Highlight the whole liked chip with a golden ring.
      const chip = heart.closest('.event-chip');
      if (chip) chip.classList.toggle('favorite', fav);
    });

    if (showOnlyFavorites) {
      applyFilters();
    }
  }

  /**
   * Clicking a chip's flag filters the calendar down to that
   * country only. Clicking the same flag again restores all.
   */
  function filterToFlag(flag) {
    if (!flag) return;
    const onlyThis = activeFlags.size === 1 && activeFlags.has(flag);
    if (onlyThis) {
      activeFlags = new Set(allFlags);
    } else {
      activeFlags = new Set([flag]);
    }
    showOnlyFavorites = false;
    updateFilterUI();
    applyFilters();
  }

  /* ---------------- filter panel UI ---------------- */

  function updateFilterUI() {
    const favBtn = filterGrid.querySelector('.filter-fav');
    if (favBtn) {
      favBtn.classList.toggle('active', showOnlyFavorites);
    }
    filterGrid.querySelectorAll('.filter-item:not(.filter-fav)').forEach(btn => {
      const active = activeFlags.has(btn.dataset.flag);
      btn.classList.toggle('active', active);
      btn.classList.toggle('inactive', !active);
    });
    updateFilterCount();
  }

  function updateFilterCount() {
    const hiddenCount = allFlags.length - activeFlags.size;
    if (showOnlyFavorites) {
      filterCount.textContent = '❤️';
      filterCount.classList.remove('hidden');
    } else if (hiddenCount > 0) {
      filterCount.textContent = '-' + hiddenCount;
      filterCount.classList.remove('hidden');
    } else {
      filterCount.textContent = '';
      filterCount.classList.add('hidden');
    }
  }

  function buildFilterGrid() {
    filterGrid.innerHTML = '';

    const favBtn = document.createElement('button');
    favBtn.type = 'button';
    favBtn.className = 'filter-item filter-fav';
    favBtn.title = 'Favorites only';
    favBtn.dataset.flag = '__favorites__';
    favBtn.textContent = '❤️';
    favBtn.addEventListener('click', () => {
      showOnlyFavorites = !showOnlyFavorites;
      updateFilterUI();
      applyFilters();
    });
    filterGrid.appendChild(favBtn);

    allFlags.forEach(flag => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-item ' + (activeFlags.has(flag) ? 'active' : 'inactive');
      btn.dataset.flag = flag;
      btn.title = FLAG_NAMES[flag] || flag;
      btn.textContent = flag;
      btn.addEventListener('click', () => {
        if (activeFlags.has(flag)) {
          activeFlags.delete(flag);
        } else {
          activeFlags.add(flag);
        }
        updateFilterUI();
        applyFilters();
      });
      filterGrid.appendChild(btn);
    });

    updateFilterUI();
  }

  function initFilterPanel() {
    allFlags = Array.from(new Set(events.map(e => e.flag).filter(Boolean))).sort();
    activeFlags = new Set(allFlags);
    buildFilterGrid();

    filterToggle.addEventListener('click', () => {
      const open = filterDropdown.classList.toggle('hidden') === false;
      filterToggle.classList.toggle('open', open);
      filterToggle.setAttribute('aria-expanded', String(open));
    });

    selectAllBtn.addEventListener('click', () => {
      activeFlags = new Set(allFlags);
      showOnlyFavorites = false;
      updateFilterUI();
      applyFilters();
    });

    selectNoneBtn.addEventListener('click', () => {
      activeFlags.clear();
      showOnlyFavorites = false;
      updateFilterUI();
      applyFilters();
    });

    document.addEventListener('click', e => {
      if (!filterPanel.contains(e.target)) {
        filterDropdown.classList.add('hidden');
        filterToggle.classList.remove('open');
        filterToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------- event interaction ---------------- */

  function bindCalendarEvents() {
    root.addEventListener('click', e => {
      const chip = e.target.closest('.event-chip');
      if (!chip) return;

      if (e.target.closest('.chip-heart')) {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(chip.dataset.id);
        return;
      }

      const flagEl = e.target.closest('.chip-flag');
      if (flagEl) {
        e.preventDefault();
        e.stopPropagation();
        filterToFlag(flagEl.dataset.flag);
        return;
      }

      if (e.target.closest('.chip-deal')) {
        // Let the small deal anchor open normally.
        return;
      }

      const ev = byId.get(chip.dataset.id);
      if (ev && ev.link) {
        window.open(ev.link, '_blank', 'noopener');
      }
    });

    root.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const chip = e.target.closest('.event-chip');
      if (!chip) return;
      e.preventDefault();
      const ev = byId.get(chip.dataset.id);
      if (ev && ev.link) {
        window.open(ev.link, '_blank', 'noopener');
      }
    });
  }

  /* ---------------- chip packing ---------------- */
  /*
   * Every chip starts with its full name (natural width).
   * Chips are then packed into lines:
   *   - short chips share a line with whatever fits,
   *   - a long chip is shortened ONLY when that lets a
   *     short chip join the same line,
   *   - otherwise names stay as long as possible,
   *   - a long chip is shortened ONLY for a genuinely SHORT
   *     neighbour, never to squeeze in another long one,
   *   - no chip is ever shrunk below MIN_CHIP_WIDTH,
   *     so every bubble stays readable.
   */

  const CHIP_GAP = 5;
  const MIN_CHIP_WIDTH = 160;
  const LINE_SLACK = 4;

  function packAllChips() {
    root.querySelectorAll('.weekend-chips').forEach(packContainer);
  }

  function lineNaturalTotal(lineIdxs, naturals) {
    return lineIdxs.reduce((sum, j) => sum + naturals[j], 0);
  }

  function packContainer(container) {
    const chips = Array.from(container.querySelectorAll('.event-chip'))
      .filter(chip => !chip.classList.contains('hidden'));
    if (chips.length === 0) return;

    const W = container.clientWidth;
    if (W <= 0) return;

    // 1. Measure natural (full-name) widths.
    chips.forEach(chip => { chip.style.maxWidth = 'none'; });
    const naturals = chips.map(chip =>
      Math.min(chip.getBoundingClientRect().width, W));
    const shortMax = Math.max(MIN_CHIP_WIDTH, W * 0.5);

    // 2. Greedy line packing. A chip joins the current line when it fits,
    //    or when the widest chip of the line can be shrunk enough
    //    (never below MIN_CHIP_WIDTH) to make room.
    const lines = [];
    let line = [];

    chips.forEach((chip, i) => {
      if (!line.length) {
        line = [i];
        return;
      }
      const gaps = line.length * CHIP_GAP;
      if (lineNaturalTotal(line, naturals) + gaps + naturals[i] <= W - LINE_SLACK) {
        line.push(i);
        return;
      }
      // A chip only pushes onto a full line when it is genuinely short;
      // then the widest chip is shortened so the short one can share the row.
      if (naturals[i] > shortMax) {
        lines.push(line);
        line = [i];
        return;
      }
      const widest = line.reduce(
        (best, j) => (naturals[j] > naturals[best] ? j : best), line[0]);
      const others = lineNaturalTotal(line, naturals) - naturals[widest];
      const widestSpace = (W - LINE_SLACK) - others - gaps - naturals[i];
      if (widestSpace >= MIN_CHIP_WIDTH) {
        line.push(i);
      } else {
        lines.push(line);
        line = [i];
      }
    });
    lines.push(line);

    // 3. Assign widths per line: short chips keep their natural width,
    //    the widest chip is shortened first when a line is too full.
    lines.forEach(lineIdxs => {
      if (!lineIdxs.length) return;
      const gaps = (lineIdxs.length - 1) * CHIP_GAP;
      const totalNatural = lineNaturalTotal(lineIdxs, naturals);

      const alloc = {};
      lineIdxs.forEach(j => { alloc[j] = naturals[j]; });

      if (totalNatural + gaps > W - LINE_SLACK) {
        let deficit = totalNatural + gaps - (W - LINE_SLACK);
        const order = lineIdxs.slice().sort((a, b) => naturals[b] - naturals[a]);
        for (const j of order) {
          if (deficit <= 0) break;
          const shrink = Math.min(Math.max(alloc[j] - MIN_CHIP_WIDTH, 0), deficit);
          alloc[j] -= shrink;
          deficit -= shrink;
        }
        // Safety net: if shrinking one chip was not enough, scale the line.
        if (deficit > 0) {
          const available = (W - LINE_SLACK) - gaps;
          lineIdxs.forEach(j => {
            alloc[j] = Math.max(
              MIN_CHIP_WIDTH,
              Math.round(naturals[j] * available / totalNatural));
          });
        }
      }

      lineIdxs.forEach(j => {
        chips[j].style.maxWidth = alloc[j] + 'px';
      });
    });
  }

  /* ---------------- init ---------------- */

  function init() {
    currentWeekendKey = weekendOfStart(localTodayISO()).key;
    loadFavorites();
    initFilterPanel();

    if (pastToggle) {
      pastToggle.addEventListener('click', () => {
        showPastEvents = !showPastEvents;
        updatePastToggle();
        applyFilters();
      });
    }

    render();
    bindCalendarEvents();
    applyFilters();
    updatePastToggle();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(packAllChips, 120);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
