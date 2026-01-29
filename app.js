/**
 * =====================================================
 * TUI Calendar - Yearly Calendar Application
 * =====================================================
 */

// Store calendar instances
const calendars = [];

// Store active country filters (all enabled by default)
const activeFilters = new Set();

// Store all found flags
let allFlags = [];

// Store favorite event IDs (persisted to localStorage)
let favorites = new Set();

// Filter mode for favorites (null = show all, true = show only favorites)
let showOnlyFavorites = false;

// Flag to prevent link opening when clicking heart
let heartClickedRecently = false;

// Flag to country name mapping
const FLAG_NAMES = {
  '🇦🇱': 'Albania',
  '🇦🇴': 'Angola',
  '🇦🇹': 'Austria',
  '🇧🇪': 'Belgium',
  '🇧🇬': 'Bulgaria',
  '🇨🇦': 'Canada',
  '🇨🇭': 'Switzerland',
  '🇨🇿': 'Czech Republic',
  '🇩🇪': 'Germany',
  '🇩🇿': 'Algeria',
  '🇪🇪': 'Estonia',
  '🇪🇸': 'Spain',
  '🇫🇮': 'Finland',
  '🇫🇷': 'France',
  '🇬🇧': 'United Kingdom',
  '🇭🇷': 'Croatia',
  '🇭🇺': 'Hungary',
  '🇮🇹': 'Italy',
  '🇲🇽': 'Mexico',
  '🇳🇱': 'Netherlands',
  '🇵🇭': 'Philippines',
  '🇵🇱': 'Poland',
  '🇵🇹': 'Portugal',
  '🇷🇴': 'Romania',
  '🇸🇪': 'Sweden',
  '🇸🇮': 'Slovenia',
  '🇹🇭': 'Thailand',
  '🇹🇷': 'Turkey',
  '🇺🇸': 'United States'
};

/**
 * Convert emoji flag to ISO country code for flagcdn
 */
function emojiToCountryCode(emoji) {
  if (!emoji) return null;
  
  // Map emoji flags to ISO country codes
  const emojiToCode = {
    '🇦🇱': 'al',
    '🇦🇴': 'ao', '🇦🇹': 'at', '🇧🇪': 'be', '🇧🇬': 'bg', '🇨🇦': 'ca',
    '🇨🇭': 'ch', '🇨🇿': 'cz', '🇩🇪': 'de', '🇩🇿': 'dz', '🇪🇪': 'ee',
    '🇪🇸': 'es', '🇫🇮': 'fi', '🇫🇷': 'fr', '🇬🇧': 'gb', '🇭🇷': 'hr',
    '🇭🇺': 'hu', '🇮🇹': 'it', '🇲🇽': 'mx', '🇳🇱': 'nl', '🇵🇭': 'ph',
    '🇵🇱': 'pl', '🇵🇹': 'pt', '🇷🇴': 'ro', '🇸🇪': 'se', '🇸🇮': 'si',
    '🇹🇭': 'th', '🇹🇷': 'tr', '🇺🇸': 'us'
  };
  
  return emojiToCode[emoji] || null;
}

// Month names in English
const MONTH_NAMES = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

// Day names (short)
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Current year
const CURRENT_YEAR = 2026;

/**
 * Filter events for a specific month (including events visible in other-month cells)
 * Events are NOT clipped - they span across month boundaries naturally
 */
function getEventsForMonth(month) {
  // Get the visible date range for this month's calendar view
  // (includes days from previous/next month that appear in the grid)
  const firstOfMonth = new Date(CURRENT_YEAR, month, 1);
  const lastOfMonth = new Date(CURRENT_YEAR, month + 1, 0);
  
  // Find the first visible day (Monday of the week containing the 1st)
  let firstDayOfWeek = firstOfMonth.getDay();
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert to Monday-based
  const visibleStart = new Date(firstOfMonth);
  visibleStart.setDate(visibleStart.getDate() - firstDayOfWeek);
  
  // Find the last visible day (Sunday of the week containing the last day)
  let lastDayOfWeek = lastOfMonth.getDay();
  lastDayOfWeek = lastDayOfWeek === 0 ? 6 : lastDayOfWeek - 1; // Convert to Monday-based
  const daysToAdd = 6 - lastDayOfWeek;
  const visibleEnd = new Date(lastOfMonth);
  visibleEnd.setDate(visibleEnd.getDate() + daysToAdd);
  
  return window.EVENTS.filter(event => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    // Check if event overlaps with the visible date range
    return (startDate <= visibleEnd && endDate >= visibleStart);
  });
}

/**
 * Calculate the maximum number of overlapping events on any day in the visible month grid
 */
function getMaxEventsPerDayInMonth(month) {
  // Get the visible date range for this month's calendar view
  const firstOfMonth = new Date(CURRENT_YEAR, month, 1);
  const lastOfMonth = new Date(CURRENT_YEAR, month + 1, 0);
  
  // Find the first visible day (Monday of the week containing the 1st)
  let firstDayOfWeek = firstOfMonth.getDay();
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const visibleStart = new Date(firstOfMonth);
  visibleStart.setDate(visibleStart.getDate() - firstDayOfWeek);
  
  // Find the last visible day (Sunday of the week containing the last day)
  let lastDayOfWeek = lastOfMonth.getDay();
  lastDayOfWeek = lastDayOfWeek === 0 ? 6 : lastDayOfWeek - 1;
  const daysToAdd = 6 - lastDayOfWeek;
  const visibleEnd = new Date(lastOfMonth);
  visibleEnd.setDate(visibleEnd.getDate() + daysToAdd);
  
  // Calculate total visible days
  const totalDays = Math.round((visibleEnd - visibleStart) / (1000 * 60 * 60 * 24)) + 1;
  
  // Count events for each visible day
  const eventCounts = new Array(totalDays).fill(0);
  
  const monthEvents = getEventsForMonth(month);
  
  monthEvents.forEach(event => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    // For each visible day the event spans, increment the count
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(visibleStart);
      currentDate.setDate(visibleStart.getDate() + i);
      if (currentDate >= startDate && currentDate <= endDate) {
        eventCounts[i]++;
      }
    }
  });
  
  return Math.max(...eventCounts, 0);
}

/**
 * Get the number of weeks in a month
 */
function getWeeksInMonth(month) {
  const firstDay = new Date(CURRENT_YEAR, month, 1);
  const lastDay = new Date(CURRENT_YEAR, month + 1, 0);
  
  // Adjust for Monday start (0 = Sunday, 1 = Monday, etc)
  let firstDayOfWeek = firstDay.getDay();
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert to Monday-based
  
  const daysInMonth = lastDay.getDate();
  const totalCells = firstDayOfWeek + daysInMonth;
  
  return Math.ceil(totalCells / 7);
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert events to TUI Calendar format
 */
function convertEventsToTUIFormat(events) {
  return events.map(event => {
    return {
      id: event.id,
      calendarId: 'main',
      title: event.title,
      start: event.start,
      end: event.end,
      isAllday: true,
      category: 'allday',
      backgroundColor: event.backgroundColor || '#03bd9e',
      color: event.color || '#ffffff',
      borderColor: event.backgroundColor || '#03bd9e',
      // Custom properties for link and flag
      raw: {
        link: event.link,
        flag: event.flag || null
      }
    };
  });
}

/**
 * Get flagcdn URL for a flag emoji
 */
function getFlagImageUrl(flagEmoji) {
  const countryCode = emojiToCountryCode(flagEmoji);
  if (!countryCode) return null;
  return `https://flagcdn.com/20x15/${countryCode}.png`;
}

/**
 * Get all unique flags from events
 */
function getAllFlags() {
  const flags = new Set();
  
  window.EVENTS.forEach(event => {
    if (event.flag) {
      flags.add(event.flag);
    }
  });
  
  return Array.from(flags).sort();
}

/**
 * Load favorites from localStorage
 */
function loadFavorites() {
  try {
    const saved = localStorage.getItem('calendarFavorites');
    if (saved) {
      favorites = new Set(JSON.parse(saved));
    }
  } catch (e) {
    console.warn('Could not load favorites:', e);
  }
}

/**
 * Save favorites to localStorage
 */
function saveFavorites() {
  try {
    localStorage.setItem('calendarFavorites', JSON.stringify([...favorites]));
  } catch (e) {
    console.warn('Could not save favorites:', e);
  }
}


/**
 * Toggle favorite status for an event
 */
function toggleFavorite(eventId) {
  if (favorites.has(eventId)) {
    favorites.delete(eventId);
  } else {
    favorites.add(eventId);
  }
  saveFavorites();
  
  // Only refresh calendars if favorites filter is active, otherwise just update the heart icon
  if (showOnlyFavorites) {
    refreshCalendars();
  } else {
    // Just update the heart icon in the DOM without full refresh
    updateHeartIcon(eventId);
  }
  updateFavoriteFilterUI();
}

/**
 * Update heart icon for a specific event without full calendar refresh
 */
function updateHeartIcon(eventId) {
  const isFavorite = favorites.has(eventId);
  const heartIcon = isFavorite ? '❤️' : '🤍';
  const heartClass = isFavorite ? 'favorite-heart active' : 'favorite-heart';
  
  // Find all heart icons for this event
  document.querySelectorAll(`[data-favorite-id="${eventId}"]`).forEach(heart => {
    heart.textContent = heartIcon;
    heart.className = heartClass;
  });
}

/**
 * Check if an event should be visible based on current filters
 */
function isEventVisible(event) {
  // If showing only favorites, bypass country filter for favorite events
  if (showOnlyFavorites) {
    return favorites.has(event.id);
  }
  
  // Use event.flag field
  const flag = event.flag;
  
  // If event has no flag, only show when ALL filters are active
  if (!flag) {
    return activeFilters.size === allFlags.length;
  }
  
  // If event has a flag, check if that flag is in active filters
  return activeFilters.has(flag);
}

/**
 * Get filtered events for a month
 */
function getFilteredEventsForMonth(month) {
  return getEventsForMonth(month).filter(isEventVisible);
}

/**
 * Calculate max events per day for filtered events in a month
 */
function getMaxFilteredEventsPerDayInMonth(month) {
  const firstOfMonth = new Date(CURRENT_YEAR, month, 1);
  const lastOfMonth = new Date(CURRENT_YEAR, month + 1, 0);
  
  let firstDayOfWeek = firstOfMonth.getDay();
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const visibleStart = new Date(firstOfMonth);
  visibleStart.setDate(visibleStart.getDate() - firstDayOfWeek);
  
  let lastDayOfWeek = lastOfMonth.getDay();
  lastDayOfWeek = lastDayOfWeek === 0 ? 6 : lastDayOfWeek - 1;
  const daysToAdd = 6 - lastDayOfWeek;
  const visibleEnd = new Date(lastOfMonth);
  visibleEnd.setDate(visibleEnd.getDate() + daysToAdd);
  
  const totalDays = Math.round((visibleEnd - visibleStart) / (1000 * 60 * 60 * 24)) + 1;
  const eventCounts = new Array(totalDays).fill(0);
  
  // Use filtered events
  const monthEvents = getFilteredEventsForMonth(month);
  
  monthEvents.forEach(event => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(visibleStart);
      currentDate.setDate(visibleStart.getDate() + i);
      if (currentDate >= startDate && currentDate <= endDate) {
        eventCounts[i]++;
      }
    }
  });
  
  return Math.max(...eventCounts, 0);
}

/**
 * Recalculate calendar height based on filtered events
 */
function recalculateCalendarHeight(monthIndex) {
  const container = document.getElementById(`calendar-${monthIndex}`);
  if (!container) return;
  
  const maxEvents = getMaxFilteredEventsPerDayInMonth(monthIndex);
  const weeksInMonth = getWeeksInMonth(monthIndex);
  
  const dayHeaderHeight = 30;
  const eventHeight = 24;
  const dayNumberHeight = 26;
  const padding = 15;
  
  const rowHeight = dayNumberHeight + (maxEvents * eventHeight) + padding;
  const calendarHeight = dayHeaderHeight + (weeksInMonth * rowHeight);
  
  container.style.height = (calendarHeight + 200) + 'px';
}

/**
 * Refresh all calendars with current filter settings
 */
function refreshCalendars() {
  calendars.forEach((calendar, monthIndex) => {
    // Clear existing events
    calendar.clear();
    
    // Recalculate height
    recalculateCalendarHeight(monthIndex);
    
    // Add filtered events
    const monthEvents = getFilteredEventsForMonth(monthIndex);
    const tuiEvents = convertEventsToTUIFormat(monthEvents);
    if (tuiEvents.length > 0) {
      calendar.createEvents(tuiEvents);
    }
  });
  
  // Trigger window resize to force calendars to recalculate layout
  window.dispatchEvent(new Event('resize'));
}

/**
 * Initialize the filter panel UI
 */
function initFilterPanel() {
  allFlags = getAllFlags();
  
  // Load favorites from localStorage
  loadFavorites();
  
  // Initialize all filters as active
  allFlags.forEach(flag => activeFilters.add(flag));
  
  const filterGrid = document.getElementById('filter-grid');
  const filterToggle = document.getElementById('filter-toggle');
  const filterDropdown = document.getElementById('filter-dropdown');
  const filterArrow = filterToggle.querySelector('.filter-arrow');
  const selectAllBtn = document.getElementById('select-all');
  const selectNoneBtn = document.getElementById('select-none');
  
  // Clear existing filter items to prevent duplicates
  filterGrid.innerHTML = '';
  
  // Add favorites filter as first item
  const favItem = document.createElement('div');
  favItem.className = 'filter-item filter-favorite';
  favItem.id = 'filter-favorite';
  favItem.textContent = '❤️';
  favItem.dataset.flag = 'favorite';
  
  favItem.addEventListener('click', () => {
    showOnlyFavorites = !showOnlyFavorites;
    updateFavoriteFilterUI();
    refreshCalendars();
  });
  
  favItem.addEventListener('mouseenter', (e) => {
    showTooltip('Favorites only', e.clientX, e.clientY);
  });
  
  favItem.addEventListener('mousemove', (e) => {
    showTooltip('Favorites only', e.clientX, e.clientY);
  });
  
  favItem.addEventListener('mouseleave', () => {
    hideTooltip();
  });
  
  filterGrid.appendChild(favItem);
  
  // Populate flag grid
  allFlags.forEach(flag => {
    const item = document.createElement('div');
    // Set initial class based on loaded state
    const isActive = activeFilters.has(flag);
    item.className = isActive ? 'filter-item active' : 'filter-item inactive';
    item.dataset.flag = flag;
    
    // Add flag image instead of emoji text (use smaller size for filter)
    const flagUrl = getFlagImageUrl(flag);
    if (flagUrl) {
      const img = document.createElement('img');
      img.src = flagUrl;
      img.alt = flag;
      img.className = 'filter-flag-image';
      item.appendChild(img);
    } else {
      // Fallback to emoji if no image available
      item.textContent = flag;
    }
    
    item.addEventListener('click', () => {
      if (activeFilters.has(flag)) {
        activeFilters.delete(flag);
        item.classList.remove('active');
        item.classList.add('inactive');
      } else {
        activeFilters.add(flag);
        item.classList.remove('inactive');
        item.classList.add('active');
      }
      refreshCalendars();
      updateFilterCount();
    });
    
    // Show country name on hover
    item.addEventListener('mouseenter', (e) => {
      const countryName = FLAG_NAMES[flag] || 'Unknown';
      showTooltip(countryName, e.clientX, e.clientY);
    });
    
    item.addEventListener('mousemove', (e) => {
      const countryName = FLAG_NAMES[flag] || 'Unknown';
      showTooltip(countryName, e.clientX, e.clientY);
    });
    
    item.addEventListener('mouseleave', () => {
      hideTooltip();
    });
    
    filterGrid.appendChild(item);
  });
  
  updateFavoriteFilterUI();
  
  // Toggle dropdown
  filterToggle.addEventListener('click', () => {
    filterDropdown.classList.toggle('hidden');
    filterArrow.classList.toggle('open');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#filter-panel')) {
      filterDropdown.classList.add('hidden');
      filterArrow.classList.remove('open');
    }
  });
  
  // Select All button
  selectAllBtn.addEventListener('click', () => {
    allFlags.forEach(flag => activeFilters.add(flag));
    document.querySelectorAll('.filter-item:not(.filter-favorite)').forEach(item => {
      item.classList.add('active');
      item.classList.remove('inactive');
    });
    refreshCalendars();
    updateFilterCount();
  });
  
  // Select None button
  selectNoneBtn.addEventListener('click', () => {
    activeFilters.clear();
    document.querySelectorAll('.filter-item:not(.filter-favorite)').forEach(item => {
      item.classList.remove('active');
      item.classList.add('inactive');
    });
    refreshCalendars();
    updateFilterCount();
  });
  
  updateFilterCount();
}

/**
 * Update the filter count badge
 */
function updateFilterCount() {
  const filterHeader = document.getElementById('filter-toggle');
  let countBadge = filterHeader.querySelector('.filter-count');
  
  const hiddenCount = allFlags.length - activeFilters.size;
  
  if (hiddenCount > 0) {
    if (!countBadge) {
      countBadge = document.createElement('span');
      countBadge.className = 'filter-count';
      filterHeader.appendChild(countBadge);
    }
    countBadge.textContent = `-${hiddenCount}`;
  } else if (countBadge) {
    countBadge.remove();
  }
}

/**
 * Update the favorite filter UI
 */
function updateFavoriteFilterUI() {
  const favItem = document.getElementById('filter-favorite');
  if (favItem) {
    if (showOnlyFavorites) {
      favItem.classList.add('active');
      favItem.classList.remove('inactive');
    } else {
      favItem.classList.remove('active');
      favItem.classList.remove('inactive');
    }
  }
}

/**
 * Setup click handlers for favorite hearts and event links
 */
function setupFavoriteClickHandler() {
  // Use capture phase to intercept before anything else
  document.addEventListener('mousedown', (e) => {
    // Handle heart clicks - set flag on mousedown before click event fires
    const heart = e.target.closest('.favorite-heart');
    if (heart) {
      heartClickedRecently = true;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const eventId = heart.dataset.favoriteId;
      if (eventId) {
        toggleFavorite(eventId);
      }
      // Reset flag after a short delay
      setTimeout(() => {
        heartClickedRecently = false;
      }, 100);
      return false;
    }
  }, true); // Use capture phase
  
  // Also prevent on click
  document.addEventListener('click', (e) => {
    const heart = e.target.closest('.favorite-heart');
    if (heart) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  }, true);
}

/**
 * Show event name tooltip bubble
 */
function showTooltip(eventName, x, y) {
  const tooltip = document.getElementById('event-tooltip');
  const tooltipText = document.getElementById('tooltip-text');
  
  if (!eventName) {
    hideTooltip();
    return;
  }
  
  tooltipText.textContent = eventName;
  tooltip.classList.remove('hidden');
  
  // Wait for the tooltip to render to get its actual size
  requestAnimationFrame(() => {
    const tooltipRect = tooltip.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let posX = x + 10;
    let posY = y - tooltipRect.height - 10; // Show above the cursor
    
    // Check right edge overflow
    if (posX + tooltipRect.width > windowWidth) {
      posX = windowWidth - tooltipRect.width - 10;
    }
    
    // Check left edge
    if (posX < 10) {
      posX = 10;
    }
    
    // Check top edge overflow - if not enough space above, show below
    if (posY < 10) {
      posY = y + 20;
    }
    
    // Check bottom edge overflow
    if (posY + tooltipRect.height > windowHeight) {
      posY = windowHeight - tooltipRect.height - 10;
    }
    
    tooltip.style.left = posX + 'px';
    tooltip.style.top = posY + 'px';
  });
}

/**
 * Hide tooltip
 */
function hideTooltip() {
  const tooltip = document.getElementById('event-tooltip');
  tooltip.classList.add('hidden');
}

/**
 * Initialize a single month calendar
 */
function initCalendar(monthIndex) {
  const container = document.getElementById(`calendar-${monthIndex}`);
  if (!container) return null;
  
  // Calculate dynamic height based on max FILTERED events and weeks
  const maxEvents = getMaxFilteredEventsPerDayInMonth(monthIndex);
  const weeksInMonth = getWeeksInMonth(monthIndex);
  
  // Height calculation - generous values to ensure all events fit:
  // - Day header height: 30px
  // - Each event: 24px (including margin)
  // - Day number: 26px
  // - Extra padding per row: 15px
  const dayHeaderHeight = 30;
  const eventHeight = 24;
  const dayNumberHeight = 26;
  const padding = 15;
  
  const rowHeight = dayNumberHeight + (maxEvents * eventHeight) + padding;
  const calendarHeight = dayHeaderHeight + (weeksInMonth * rowHeight);
  
  // Set container height with generous extra buffer
  container.style.height = (calendarHeight + 50) + 'px';
  
  console.log(`Month ${monthIndex + 1}: maxEvents=${maxEvents}, weeks=${weeksInMonth}, height=${calendarHeight + 50}px`);
  
  // Create calendar
  const calendar = new tui.Calendar(container, {
    defaultView: 'month',
    usageStatistics: false,
    isReadOnly: true,
    month: {
      startDayOfWeek: 1, // Monday
      dayNames: DAY_NAMES,
      narrowWeekend: false,
      visibleWeeksCount: 0, // Automatic
      isAlways6Weeks: false, // Only show required weeks
      visibleEventCount: 999, // Show all events - no limit
    },
    gridSelection: false,
    useDetailPopup: false,
    useFormPopup: false,
    calendars: [
      {
        id: 'main',
        name: 'Events',
        backgroundColor: '#03bd9e',
        borderColor: '#03bd9e'
      }
    ],
    template: {
      // Month day name header (Mon, Tue, Wed...)
      monthDayName(model) {
        return `<span class="day-name">${model.label}</span>`;
      },
      // All day events
      allday(event) {
        const hasLink = event.raw && event.raw.link;
        const isFavorite = favorites.has(event.id);
        const heartClass = isFavorite ? 'favorite-heart active' : 'favorite-heart';
        const heartIcon = isFavorite ? '❤️' : '🤍';
        
        // Get flag image if flag exists
        let flagImage = '';
        if (event.raw && event.raw.flag) {
          const flagUrl = getFlagImageUrl(event.raw.flag);
          if (flagUrl) {
            flagImage = `<img src="${flagUrl}" alt="${event.raw.flag}" class="event-flag" />`;
          }
        }
        
        let titleContent;
        if (hasLink) {
          titleContent = `<span class="event-title" data-event-id="${event.id}" data-link="${event.raw.link}">${event.title}</span>`;
        } else {
          titleContent = `<span class="event-title" data-event-id="${event.id}">${event.title}</span>`;
        }
        
        return `<div class="event-wrapper" data-event-id="${event.id}">
          ${flagImage}
          ${titleContent}
          <span class="${heartClass}" data-favorite-id="${event.id}">${heartIcon}</span>
        </div>`;
      },
      // Month grid header (day number)
      monthGridHeader(model) {
        // Hide other month's days
        if (model.isOtherMonth) {
          return '';
        }
        // model.date = "2027-01-10" format, extract the day
        const dayNumber = parseInt(model.date.split('-')[2], 10);
        const isToday = model.isToday ? ' today' : '';
        return `<span class="grid-header${isToday}">${dayNumber}</span>`;
      },
      // Hidden events count in header
      monthGridHeaderExceed(hiddenEvents) {
        return `<span class="more-events">+${hiddenEvents}</span>`;
      },
      // "More events" popup title
      monthMoreTitleDate(moreTitle) {
        return `<span>${moreTitle.date}</span>`;
      },
      // Hidden events count in footer
      monthGridFooterExceed(hiddenEvents) {
        return `<span class="more-events">+${hiddenEvents}</span>`;
      }
    },
    theme: {
      common: {
        backgroundColor: 'transparent',
        border: 'none',
        dayName: {
          color: '#666'
        },
        holiday: {
          color: '#ff6b6b'
        },
        saturday: {
          color: '#5c7cfa'
        }
      },
      month: {
        dayName: {
          borderLeft: 'none',
          backgroundColor: 'inherit'
        },
        dayExceptThisMonth: {
          color: '#ddd'
        },
        holidayExceptThisMonth: {
          color: '#ffb8b8'
        },
        moreView: {
          backgroundColor: 'white',
          border: '1px solid #eee',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          width: 200,
          height: 150
        },
        moreViewTitle: {
          backgroundColor: '#f5f5f5'
        },
        gridCell: {
          headerHeight: 24,
          footerHeight: 0
        }
      }
    }
  });
  
  // Set to the specific month
  calendar.setDate(new Date(CURRENT_YEAR, monthIndex, 1));
  
  // Add filtered events
  const monthEvents = getFilteredEventsForMonth(monthIndex);
  const tuiEvents = convertEventsToTUIFormat(monthEvents);
  if (tuiEvents.length > 0) {
    calendar.createEvents(tuiEvents);
  }
  
  // Click event - open link (but not if heart was clicked)
  calendar.on('clickEvent', ({ event }) => {
    // Don't open link if heart was clicked
    if (heartClickedRecently) {
      return;
    }
    if (event.raw && event.raw.link) {
      window.open(event.raw.link, '_blank');
    }
  });
  
  return calendar;
}

/**
 * Setup hover events for event name tooltips
 */
function setupHoverEvents() {
  let currentEventId = null;
  
  // Delegated event handling on document
  document.addEventListener('mousemove', (e) => {
    const eventElement = e.target.closest('[data-event-id]');
    
    if (eventElement) {
      const eventId = eventElement.dataset.eventId;
      
      // Find the event in our data
      const eventData = window.EVENTS.find(ev => ev.id === eventId);
      
      if (eventData) {
        // Show tooltip with full event name
        showTooltip(eventData.title, e.clientX, e.clientY);
        currentEventId = eventId;
      } else {
        currentEventId = null;
        hideTooltip();
      }
    } else {
      if (currentEventId !== null) {
        currentEventId = null;
        hideTooltip();
      }
    }
  });
  
  // Also hide on mouse leave from document
  document.addEventListener('mouseleave', () => {
    currentEventId = null;
    hideTooltip();
  });
}

/**
 * Initialize application
 */
function init() {
  console.log('Initializing yearly calendar...');
  
  // Initialize filter panel first (before calendars, so we know all flags)
  initFilterPanel();
  
  // Create 12 calendars
  for (let i = 0; i < 12; i++) {
    const cal = initCalendar(i);
    if (cal) {
      calendars.push(cal);
    }
  }
  
  // Setup hover events for tooltips
  setupHoverEvents();
  
  // Setup favorite heart click handler
  setupFavoriteClickHandler();
  
  console.log(`${calendars.length} calendars initialized successfully.`);
  console.log(`Found ${allFlags.length} country flags:`, allFlags.join(' '));
  console.log(`Loaded ${favorites.size} favorites`);
}

// Start on DOM load
document.addEventListener('DOMContentLoaded', init);
