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
 * Pure logic lives in lib.js (window.KalLib); this file only
 * touches the DOM: rendering, filtering, favorites, packing.
 */
(function () {
  'use strict';

  const {
    FLAG_NAMES,
    colorForEvent,
    parseDate,
    weekendOfStart,
    utcTodayISO,
    orderWeekendEvents,
    cleanTitle
  } = window.KalLib;

  const FAVORITES_KEY = 'calendarFavorites';
  const SHOW_PAST_KEY = 'calendarShowPast';
  const FILTERS_KEY = 'calendarFilters';
  const DENSITY_KEY = 'calendarDensity';
  const NO_FLAG_KEY = '__noflag__';
  const NO_FLAG_LABEL = 'Other / no country';

  const events = window.EVENTS || [];
  const byId = new Map();
  let allFlags = [];
  let activeFlags = new Set();
  let favorites = new Set();
  let showOnlyFavorites = false;
  let showPastEvents = false;
  let density = 'compact';
  let searchQuery = '';
  let searchTimer = null;
  let currentWeekendKey = null;
  let prevActiveFlags = null;

  const root = document.getElementById('calendar-root');
  const headerSub = document.getElementById('header-sub');
  const emptyState = document.getElementById('empty-state');
  const filterPanel = document.getElementById('filter-panel');
  const filterToggle = document.getElementById('filter-toggle');
  const filterDropdown = document.getElementById('filter-dropdown');
  const filterGrid = document.getElementById('filter-grid');
  const filterCount = document.getElementById('filter-count');
  const filterSearch = document.getElementById('filter-search');
  const selectAllBtn = document.getElementById('select-all');
  const selectNoneBtn = document.getElementById('select-none');
  const pastToggle = document.getElementById('past-toggle');
  const densityToggle = document.getElementById('density-toggle');
  const monthNav = document.getElementById('month-nav');
  const navPills = document.getElementById('nav-pills');
  const eventSearch = document.getElementById('event-search');

  /* ---------------- localized labels ---------------- */

  const UI_LOCALE = (navigator.language || 'en-US');
  const fmtMonthLong = new Intl.DateTimeFormat(UI_LOCALE, { month: 'long', timeZone: 'UTC' });
  const fmtMonthShort = new Intl.DateTimeFormat(UI_LOCALE, { month: 'short', timeZone: 'UTC' });
  const fmtWeekdayShort = new Intl.DateTimeFormat(UI_LOCALE, { weekday: 'short', timeZone: 'UTC' });

  function rangeLabel(w) {
    return w.fri.getUTCDate() + ' – ' + w.sun.getUTCDate();
  }

  function monthLabel(w) {
    const fm = w.fri.getUTCMonth(), fy = w.fri.getUTCFullYear();
    const sm = w.sun.getUTCMonth(), sy = w.sun.getUTCFullYear();
    const fShort = fmtMonthShort.format(w.fri);
    const sShort = fmtMonthShort.format(w.sun);
    if (fm === sm && fy === sy) {
      return fShort + ' ' + fy;
    }
    if (fy === sy) {
      return fShort + ' / ' + sShort + ' ' + fy;
    }
    return fShort + ' ' + String(fy).slice(2) +
      ' / ' + sShort + ' ' + String(sy).slice(2);
  }

  function dayLabel(w) {
    return fmtWeekdayShort.format(w.fri) + '–' + fmtWeekdayShort.format(w.sun);
  }

  function fmtEventRange(ev) {
    const s = parseDate(ev.start);
    const hasEnd = ev.end && ev.end > ev.start;
    const e = hasEnd ? parseDate(ev.end) : null;
    const short = d => fmtMonthShort.format(d) + ' ' + d.getUTCDate();
    if (!e) return short(s);
    if (e.getUTCFullYear() === s.getUTCFullYear() &&
        e.getUTCMonth() === s.getUTCMonth()) {
      return short(s) + '–' + e.getUTCDate();
    }
    if (e.getUTCFullYear() === s.getUTCFullYear()) {
      return short(s) + '–' + short(e);
    }
    return short(s) + ' ' + s.getUTCFullYear() + '–' + short(e) + ' ' + e.getUTCFullYear();
  }

  /* ---------------- grouping: months → weekends → events ---------------- */

  function buildGroups() {
    const byMonth = new Map();

    events.forEach(ev => {
      const w = weekendOfStart(ev.start);
      const mKey = w.sat.getUTCFullYear() + '-' +
        String(w.sat.getUTCMonth() + 1).padStart(2, '0');

      if (!byMonth.has(mKey)) {
        byMonth.set(mKey, {
          key: mKey,
          label: fmtMonthLong.format(w.sat) + ' ' + w.sat.getUTCFullYear(),
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
        w.events = orderWeekendEvents(w.events, colorForEvent);
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

  // Title cleanup is pure but runs per chip per render — memoize it.
  const titleCache = new Map();
  function displayTitle(ev) {
    let t = titleCache.get(ev.id);
    if (t === undefined) {
      t = cleanTitle(ev.title);
      titleCache.set(ev.id, t);
    }
    return t;
  }

  function buildTip(ev, title, country) {
    let tip = (country && country !== title) ? country + ' — ' + title : title;
    const extra = [fmtEventRange(ev)];
    if (ev.tags && ev.tags.length) {
      extra.push(ev.tags.slice(0, 4).join(', '));
    }
    if (ev.cancelled) extra.push('cancelled');
    return tip + ' · ' + extra.join(' · ');
  }

  function googleCalUrl(ev, title, country) {
    const start = ev.start.replace(/-/g, '');
    const endStr = ev.end && ev.end > ev.start ? ev.end : ev.start;
    // Google Calendar all-day events use an exclusive end date.
    const end = parseDate(endStr);
    end.setUTCDate(end.getUTCDate() + 1);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: start + '/' + end.toISOString().slice(0, 10).replace(/-/g, ''),
      location: country || ev.location || '',
      details: ev.link || ''
    });
    return 'https://calendar.google.com/calendar/render?' + params.toString();
  }

  function chipHtml(ev) {
    const bg = colorForEvent(ev);
    const fg = ev.color || '#ffffff';
    const fav = favorites.has(ev.id);
    const title = displayTitle(ev);
    const country = FLAG_NAMES[ev.flag] || ev.location || '';
    const flagHtml = ev.flag
      ? '<button type="button" class="chip-flag" data-flag="' + esc(ev.flag) + '"' +
        ' title="Show only ' + esc(country || ev.flag) + '"' +
        ' aria-label="Show only ' + esc(country || ev.flag) + '">' +
        esc(ev.flag) + '</button>'
      : '';
    const dealHtml = ev.deal
      ? '<a class="chip-deal" href="' + esc(ev.deal) + '" target="_blank" rel="noopener" title="Get the deal">✨</a>'
      : '';
    const calHtml = ev.link
      ? '<a class="chip-cal" href="' + esc(googleCalUrl(ev, title, country)) + '"' +
        ' target="_blank" rel="noopener" title="Add to Google Calendar"' +
        ' aria-label="Add to Google Calendar">📅</a>'
      : '';
    const tip = buildTip(ev, title, country);
    const cancelled = ev.cancelled ? ' cancelled' : '';
    const favClass = fav ? ' favorite' : '';
    const heartClass = fav ? 'chip-heart active' : 'chip-heart';
    const heartIcon = fav ? '❤️' : '🤍';
    // The event name itself is a real link: cmd/ctrl/middle-click work
    // natively, keyboard focus lands on it.
    const titleHtml = ev.link
      ? '<a class="chip-title" href="' + esc(ev.link) + '" target="_blank" rel="noopener"' +
        ' title="' + esc(tip) + '">' + esc(title) + '</a>'
      : '<span class="chip-title" title="' + esc(tip) + '">' + esc(title) + '</span>';

    return '<div class="event-chip' + cancelled + favClass + '"' +
      ' data-id="' + esc(ev.id) + '"' +
      ' data-link="' + esc(ev.link || '') + '"' +
      ' title="' + esc(tip) + '"' +
      ' style="background-color:' + esc(bg) + ';color:' + esc(fg) + '">' +
      flagHtml +
      titleHtml +
      '<button type="button" class="' + heartClass + '" data-id="' + esc(ev.id) + '"' +
      ' aria-label="' + (fav ? 'Remove from favorites' : 'Add to favorites') + '"' +
      ' title="' + (fav ? 'Remove from favorites' : 'Add to favorites') + '">' +
      heartIcon + '</button>' +
      calHtml +
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
      ? '<span class="wd-now">' + esc('This weekend') + '</span>'
      : '';

    return '<div class="' + cls.join(' ') + '" data-weekend="' + w.key + '">' +
      '<div class="weekend-date">' +
        '<span class="wd-range">' + rangeLabel(w) + '</span>' +
        '<span class="wd-month">' + esc(monthLabel(w)) + '</span>' +
        '<span class="wd-days">' + esc(dayLabel(w)) + '</span>' +
        nowBadge +
      '</div>' +
      '<div class="weekend-chips">' +
        w.events.map(chipHtml).join('') +
      '</div>' +
      '</div>';
  }

  function plural(n, word) {
    return n + ' ' + word + (n === 1 ? '' : 's');
  }

  function render() {
    byId.clear();
    events.forEach(ev => byId.set(ev.id, ev));

    const groups = buildGroups();
    const totalWeekends = groups.reduce((n, m) => n + m.weekends.length, 0);

    const parts = [];
    let lastYear = null;
    groups.forEach(month => {
      const year = month.key.slice(0, 4);
      if (year !== lastYear) {
        parts.push(
          '<div class="year-divider" aria-hidden="true"><span>' + esc(year) + '</span></div>');
        lastYear = year;
      }
      parts.push(
        '<section class="month-section" data-month="' + month.key + '"' +
          ' aria-labelledby="mh-' + month.key + '">' +
          '<h2 class="month-title" id="mh-' + month.key + '">' +
            '<span>' + esc(month.label) + '</span>' +
            '<span class="month-count">' + plural(month.weekends.length, 'weekend') +
              ' · ' + plural(month.count, 'event') + '</span>' +
          '</h2>' +
          month.weekends.map(weekendRowHtml).join('') +
        '</section>');
    });
    root.innerHTML = parts.join('');

    const years = events.map(e => e.start.slice(0, 4)).sort();
    headerSub.textContent =
      events.length + ' events · ' + totalWeekends + ' weekends · ' +
      (allFlags.length - (allFlags.includes(NO_FLAG_KEY) ? 1 : 0)) + ' countries · ' +
      years[0] + '–' + years[years.length - 1];

    buildMonthNav(groups);
  }

  /* ---------------- month navigation ---------------- */

  function buildMonthNav(months) {
    if (!monthNav || !navPills) return;
    let html = '<button type="button" class="nav-now" data-now="1"' +
      ' title="Jump to this weekend">● ' + esc('Now') + '</button>';
    months.forEach(m => {
      const sat = parseDate(m.key + '-15');
      html += '<button type="button" class="nav-month" data-month="' + esc(m.key) + '"' +
        ' title="Jump to ' + esc(m.label) + '">' +
        esc(fmtMonthShort.format(sat) + ' ' + m.key.slice(0, 4)) + '</button>';
    });
    navPills.innerHTML = html;

    navPills.addEventListener('click', e => {
      const nowBtn = e.target.closest('.nav-now');
      if (nowBtn) {
        const cur = root.querySelector('.weekend-row.current');
        if (cur) cur.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      const mBtn = e.target.closest('.nav-month');
      if (mBtn) {
        const sec = root.querySelector(
          '.month-section[data-month="' + mBtn.dataset.month + '"]');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  function updateMonthNav() {
    if (!monthNav) return;
    monthNav.querySelectorAll('.nav-month').forEach(btn => {
      const sec = root.querySelector(
        '.month-section[data-month="' + btn.dataset.month + '"]');
      btn.classList.toggle('hidden', !sec || sec.classList.contains('hidden'));
    });
    const nowBtn = monthNav.querySelector('.nav-now');
    if (nowBtn) {
      nowBtn.classList.toggle('hidden',
        !root.querySelector('.weekend-row.current:not(.hidden)'));
    }
    updateMonthNavActive();
  }

  /* ---------------- scrollspy: highlight the month in view ---------------- */

  let navActiveKey = null;

  function updateMonthNavActive() {
    if (!monthNav) return;
    const navLine = Math.max(monthNav.getBoundingClientRect().bottom, 8);
    const sections = Array.from(
      root.querySelectorAll('.month-section:not(.hidden)'));
    let active = null;
    // The active month is the last one whose top edge has passed
    // the bottom of the sticky nav.
    for (const sec of sections) {
      if (sec.getBoundingClientRect().top <= navLine + 8) {
        active = sec.dataset.month;
      } else {
        break;
      }
    }
    if (!active && sections.length) active = sections[0].dataset.month;
    if (!active || active === navActiveKey) return;
    navActiveKey = active;

    monthNav.querySelectorAll('.nav-month').forEach(btn => {
      const on = btn.dataset.month === active;
      btn.classList.toggle('active', on);
      if (on) {
        // Keep the highlighted pill visible in the horizontal strip.
        const target = btn.offsetLeft -
          (navPills.clientWidth - btn.clientWidth) / 2;
        navPills.scrollTo({ left: target, behavior: 'smooth' });
      }
    });
  }

  /* ---------------- filtering ---------------- */

  function matchesSearch(ev) {
    if (!searchQuery) return true;
    const title = cleanTitle(ev.title)
      .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const hay = [
      title,
      FLAG_NAMES[ev.flag] || '',
      ev.location || '',
      (ev.tags || []).join(' ')
    ].join(' ')
      .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const tokens = searchQuery.split(/\s+/).filter(Boolean);
    if (!tokens.length) return true;
    if (!tokens.every(w => hay.includes(w))) return false;

    // Multi-word queries must also touch the event NAME. Otherwise
    // accidental cross-field hits produce confusing matches, e.g.
    // "all sta" → tag "All in One" + location "United States"
    // matched "Queen City Dance Festival".
    if (tokens.length > 1 && !tokens.some(w => title.includes(w))) {
      return false;
    }
    return true;
  }

  function isVisible(ev) {
    if (showOnlyFavorites) {
      return favorites.has(ev.id) && matchesSearch(ev);
    }
    if (!ev.flag) {
      return activeFlags.has(NO_FLAG_KEY) && matchesSearch(ev);
    }
    return activeFlags.has(ev.flag) && matchesSearch(ev);
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
    updateMonthNav();
    packAllChips();
    updateFilterCount();
    saveFilters();
  }

  /* ---------------- event search ---------------- */

  function runEventSearch(value) {
    searchQuery = normalizeForSearch(value);
    applyFilters();
    if (searchQuery) {
      const first = root.querySelector('.event-chip:not(.hidden)');
      const row = first && first.closest('.weekend-row');
      if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function initEventSearch() {
    if (!eventSearch) return;
    eventSearch.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => runEventSearch(eventSearch.value), 120);
    });
    eventSearch.addEventListener('keydown', e => {
      if (e.key === 'Escape' && eventSearch.value) {
        e.stopPropagation();
        eventSearch.value = '';
        runEventSearch('');
      }
    });
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

  /* ---------------- filter persistence ---------------- */

  function saveFilters() {
    try {
      localStorage.setItem(FILTERS_KEY, JSON.stringify({
        flags: Array.from(activeFlags),
        favorites: showOnlyFavorites
      }));
    } catch (err) { /* session-only */ }
  }

  function loadFilters() {
    try {
      const saved = JSON.parse(localStorage.getItem(FILTERS_KEY) || 'null');
      if (saved && Array.isArray(saved.flags)) {
        const known = new Set(allFlags);
        activeFlags = new Set(saved.flags.filter(f => known.has(f)));
        if (!activeFlags.size) activeFlags = new Set(allFlags);
        showOnlyFavorites = !!saved.favorites;
      }
    } catch (err) { /* keep defaults */ }
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
      heart.title = fav ? 'Remove from favorites' : 'Add to favorites';
      // Highlight the whole liked chip with a golden ring.
      const chip = heart.closest('.event-chip');
      if (chip) chip.classList.toggle('favorite', fav);
    });

    if (showOnlyFavorites) {
      applyFilters();
    }
  }

  /**
   * Clicking a chip's flag filters the calendar down to that country.
   * Clicking the same flag again restores the previous selection.
   */
  function filterToFlag(flag) {
    if (!flag) return;
    const singleMode = activeFlags.size === 1 && activeFlags.has(flag);
    if (singleMode) {
      activeFlags = prevActiveFlags ? new Set(prevActiveFlags) : new Set(allFlags);
      prevActiveFlags = null;
    } else {
      if (activeFlags.size > 1) prevActiveFlags = new Set(activeFlags);
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

  function normalizeForSearch(s) {
    return String(s || '')
      .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function applyFilterSearch() {
    if (!filterSearch) return;
    const q = normalizeForSearch(filterSearch.value);
    filterGrid.querySelectorAll('.filter-item:not(.filter-fav)').forEach(btn => {
      const name = btn.dataset.name || '';
      btn.classList.toggle('search-hidden', q !== '' && !name.includes(q));
    });
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
      if (flag === NO_FLAG_KEY) {
        btn.textContent = '🌐';
        btn.title = NO_FLAG_LABEL;
        btn.dataset.name = normalizeForSearch(NO_FLAG_LABEL);
      } else {
        btn.textContent = flag;
        btn.title = FLAG_NAMES[flag] || flag;
        btn.dataset.name = normalizeForSearch(FLAG_NAMES[flag] || flag);
      }
      btn.addEventListener('click', () => {
        if (activeFlags.has(flag)) {
          activeFlags.delete(flag);
        } else {
          activeFlags.add(flag);
        }
        prevActiveFlags = null;
        updateFilterUI();
        applyFilters();
      });
      filterGrid.appendChild(btn);
    });

    updateFilterUI();
    applyFilterSearch();
  }

  function initFilterPanel() {
    allFlags = Array.from(new Set(events.map(e => e.flag).filter(Boolean))).sort();
    if (events.some(e => !e.flag)) {
      allFlags.push(NO_FLAG_KEY);
    }
    activeFlags = new Set(allFlags);
    buildFilterGrid();

    filterToggle.addEventListener('click', () => {
      const open = filterDropdown.classList.toggle('hidden') === false;
      filterToggle.classList.toggle('open', open);
      filterToggle.setAttribute('aria-expanded', String(open));
    });

    if (filterSearch) {
      filterSearch.addEventListener('input', applyFilterSearch);
    }

    selectAllBtn.addEventListener('click', () => {
      activeFlags = new Set(allFlags);
      showOnlyFavorites = false;
      prevActiveFlags = null;
      updateFilterUI();
      applyFilters();
    });

    selectNoneBtn.addEventListener('click', () => {
      activeFlags.clear();
      showOnlyFavorites = false;
      prevActiveFlags = null;
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

    // Esc closes the dropdown and returns focus to the toggle button.
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !filterDropdown.classList.contains('hidden')) {
        filterDropdown.classList.add('hidden');
        filterToggle.classList.remove('open');
        filterToggle.setAttribute('aria-expanded', 'false');
        filterToggle.focus();
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

      // Native anchors handle themselves (calendar, deal + event title).
      if (e.target.closest('.chip-deal') || e.target.closest('.chip-cal') ||
          e.target.closest('.chip-title')) {
        return;
      }

      const ev = byId.get(chip.dataset.id);
      if (ev && ev.link) {
        window.open(ev.link, '_blank', 'noopener');
      }
    });

    // Middle-click anywhere else on a chip opens the event, like a real link.
    root.addEventListener('auxclick', e => {
      const chip = e.target.closest('.event-chip');
      if (!chip) return;
      if (e.target.closest('.chip-heart') || e.target.closest('.chip-flag') ||
          e.target.closest('.chip-deal') || e.target.closest('.chip-cal') ||
          e.target.closest('.chip-title')) {
        return;
      }
      if (e.button === 1) {
        e.preventDefault();
        const ev = byId.get(chip.dataset.id);
        if (ev && ev.link) window.open(ev.link, '_blank', 'noopener');
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
   *   - no chip is ever shrunk below MIN_CHIP_WIDTH,
   *     so every bubble stays readable.
   */

  const CHIP_GAP = 5;
  const LINE_SLACK = 4;

  // Minimum readable chip width depends on the density setting.
  function minChipWidth() {
    return density === 'comfortable' ? 200 : 160;
  }

  // Natural (full-name) widths only depend on title + icons;
  // measure once per unique combination, re-measure on resize/zoom.
  const naturalWidthCache = new Map();

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

    const MIN_W = minChipWidth();

    // 1. Measure natural (full-name) widths — cached per title + icons.
    chips.forEach(chip => { chip.style.maxWidth = 'none'; });
    const naturals = chips.map(chip => {
      const titleEl = chip.querySelector('.chip-title');
      const key = (titleEl ? titleEl.textContent : '') +
        '|' + (chip.querySelector('.chip-deal') ? 'd' : '') +
        '|' + (chip.querySelector('.chip-cal') ? 'c' : '') +
        '|' + density;
      if (naturalWidthCache.has(key)) {
        return naturalWidthCache.get(key);
      }
      const w = Math.min(chip.getBoundingClientRect().width, W);
      naturalWidthCache.set(key, w);
      return w;
    });
    const shortMax = Math.max(MIN_W, W * 0.5);

    // 2. Greedy line packing. A chip joins the current line when it fits,
    //    or when the widest chip of the line can be shrunk enough
    //    (never below the minimum readable width) to make room.
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
      if (widestSpace >= MIN_W) {
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
          const shrink = Math.min(Math.max(alloc[j] - MIN_W, 0), deficit);
          alloc[j] -= shrink;
          deficit -= shrink;
        }
        // Safety net: if shrinking one chip was not enough, scale the line.
        if (deficit > 0) {
          const available = (W - LINE_SLACK) - gaps;
          lineIdxs.forEach(j => {
            alloc[j] = Math.max(
              MIN_W,
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

  function loadPrefs() {
    loadFavorites();
    try {
      showPastEvents = localStorage.getItem(SHOW_PAST_KEY) === '1';
    } catch (err) {
      showPastEvents = false;
    }
    try {
      density = localStorage.getItem(DENSITY_KEY) === 'comfortable' ? 'comfortable' : 'compact';
    } catch (err) {
      density = 'compact';
    }
  }

  function saveShowPast() {
    try {
      localStorage.setItem(SHOW_PAST_KEY, showPastEvents ? '1' : '0');
    } catch (err) { /* session-only */ }
  }

  /* ---------------- density toggle ---------------- */

  function applyDensity() {
    document.body.classList.toggle('density-comfortable', density === 'comfortable');
    if (densityToggle) {
      const comfortable = density === 'comfortable';
      densityToggle.setAttribute('aria-pressed', String(comfortable));
      const label = densityToggle.querySelector('.density-label');
      if (label) label.textContent = comfortable ? ' Compact' : ' Roomier';
      densityToggle.title = comfortable
        ? 'Switch to compact density'
        : 'Switch to comfortable density';
    }
    naturalWidthCache.clear();
    packAllChips();
  }

  function init() {
    // UTC keeps the "current weekend" consistent with event dates,
    // independent of the viewer's timezone.
    currentWeekendKey = weekendOfStart(utcTodayISO()).key;
    loadPrefs();
    initFilterPanel();
    loadFilters(); // needs allFlags from initFilterPanel
    initEventSearch();

    if (pastToggle) {
      pastToggle.addEventListener('click', () => {
        showPastEvents = !showPastEvents;
        saveShowPast();
        updatePastToggle();
        applyFilters();
      });
    }

    if (densityToggle) {
      densityToggle.addEventListener('click', () => {
        density = density === 'comfortable' ? 'compact' : 'comfortable';
        try {
          localStorage.setItem(DENSITY_KEY, density);
        } catch (err) { /* session-only */ }
        applyDensity();
      });
    }

    render();
    bindCalendarEvents();
    applyFilters();
    updatePastToggle();
    applyDensity();

    // Printing always includes past events (hiding them is a screen
    // convenience, not a data preference).
    let printShowedPast = false;
    window.addEventListener('beforeprint', () => {
      if (!showPastEvents) {
        printShowedPast = true;
        showPastEvents = true;
        applyFilters();
      }
    });
    window.addEventListener('afterprint', () => {
      if (printShowedPast) {
        printShowedPast = false;
        showPastEvents = false;
        applyFilters();
      }
    });

    // Scrollspy: highlight the month currently under the sticky nav.
    let navScrollRaf = null;
    window.addEventListener('scroll', () => {
      if (navScrollRaf) return;
      navScrollRaf = requestAnimationFrame(() => {
        navScrollRaf = null;
        updateMonthNavActive();
      });
    }, { passive: true });

    let resizeRaf = null;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        naturalWidthCache.clear();
        packAllChips();
        updateMonthNavActive();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
