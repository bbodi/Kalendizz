/**
 * =====================================================
 * TUI Calendar - Yearly Calendar Application
 * =====================================================
 */

// Store calendar instances
const calendars = [];

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
      // Custom properties for link
      raw: {
        link: event.link
      }
    };
  });
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
  
  // Calculate dynamic height based on max events and weeks
  const maxEvents = getMaxEventsPerDayInMonth(monthIndex);
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
        
        let content;
        if (hasLink) {
          content = `<a href="${event.raw.link}" target="_blank" class="event-link" data-event-id="${event.id}">${event.title}</a>`;
        } else {
          content = `<span class="event-title" data-event-id="${event.id}">${event.title}</span>`;
        }
        
        return content;
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
  
  // Add events (clipped to this month only)
  const monthEvents = getEventsForMonth(monthIndex);
  const tuiEvents = convertEventsToTUIFormat(monthEvents);
  if (tuiEvents.length > 0) {
    calendar.createEvents(tuiEvents);
  }
  
  // Click event - open link
  calendar.on('clickEvent', ({ event }) => {
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
  
  // Create 12 calendars
  for (let i = 0; i < 12; i++) {
    const cal = initCalendar(i);
    if (cal) {
      calendars.push(cal);
    }
  }
  
  // Setup hover events for image tooltips
  setupHoverEvents();
  
  console.log(`${calendars.length} calendars initialized successfully.`);
}

// Start on DOM load
document.addEventListener('DOMContentLoaded', init);
