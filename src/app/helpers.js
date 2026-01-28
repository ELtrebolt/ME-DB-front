/**
 * Shared utility functions used across the application
 */

import { matchSorter } from 'match-sorter';
const constants = require('./constants');

/**
 * Filters suggestions by label using match-sorter
 * @param {string} value - The search value
 * @param {array} suggestions - Array of suggestion objects with 'label' property
 * @returns {array} - Filtered suggestions
 */
export function suggestionsByLabel(value, suggestions) {
  return matchSorter(suggestions, value, { keys: ['label'] });
}

/**
 * Converts a string to capital notation (Title Case)
 * @param {string} inputString - The string to convert
 * @returns {string} - The string in Title Case
 */
export function toCapitalNotation(inputString) {
  if (!inputString) return '';
  return inputString
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Filters tier data based on various criteria
 * @param {object} tierData - The tier data to filter
 * @param {string} timePeriod - Time period filter ('all', 'ytd', 'lastMonth', etc.)
 * @param {string} startDate - Custom start date (for 'custom' timePeriod)
 * @param {string} endDate - Custom end date (for 'custom' timePeriod)
 * @param {array} allTags - All available tags
 * @param {array} selectedTags - Selected tags to filter by
 * @param {string} tagLogic - Tag logic ('AND' or 'OR')
 * @param {function} setSuggestedTags - Callback to set suggested tags
 * @param {function} setSearchChanged - Callback to set search changed state
 * @param {string} searchQuery - Search query string
 * @param {array} searchScope - Search scope (['title'], ['description'], ['tags'], etc.)
 * @param {array} selectedTiers - Selected tiers to filter by
 * @param {string} sortOrder - Sort order ('default', 'dateNewest', 'dateOldest', 'titleAZ')
 * @returns {object} - Filtered tier data
 */
export function filterData(tierData, timePeriod, startDate, endDate, allTags, selectedTags, tagLogic, setSuggestedTags, setSearchChanged, searchQuery, searchScope, selectedTiers, sortOrder) {
  var data = createEmptyTiersObject();

  if (!tierData) return data;

  const isInDateRange = (dateStr) => {
    if (!dateStr) return timePeriod === 'all';
    const date = new Date(dateStr);
    const now = new Date();
    let start = null;
    let end = null;

    if (timePeriod === 'all') return true;

    if (timePeriod === 'ytd') {
      start = new Date(now.getFullYear(), 0, 1);
      end = now;
    } else if (timePeriod === 'lastMonth') {
      start = new Date();
      start.setMonth(now.getMonth() - 1);
      end = now;
    } else if (timePeriod === 'last3Months') {
      start = new Date();
      start.setMonth(now.getMonth() - 3);
      end = now;
    } else if (timePeriod === 'last6Months') {
      start = new Date();
      start.setMonth(now.getMonth() - 6);
      end = now;
    } else if (timePeriod === 'last12Months') {
      start = new Date();
      start.setMonth(now.getMonth() - 12);
      end = now;
    } else if (timePeriod === 'custom') {
      if (startDate) start = new Date(startDate);
      if (endDate) {
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      }
    }

    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  };

  const filteredArray = [];
  for(const tier of Object.keys(tierData)) {
    if (selectedTiers && !selectedTiers.includes(tier)) continue;

    for(const m of tierData[tier]) {
      if(searchQuery !== '') {
        const query = searchQuery.toLowerCase();
        let match = false;
        if (searchScope.includes('title') && m.title.toLowerCase().includes(query)) match = true;
        if (!match && searchScope.includes('description') && m.description && m.description.toLowerCase().includes(query)) match = true;
        if (!match && searchScope.includes('tags') && m.tags && m.tags.some(t => t.toLowerCase().includes(query))) match = true;
        if(!match) continue;
      }

      if(selectedTags && selectedTags.length > 0) {
        if(!m.tags || m.tags.length === 0) continue;
        const tagLabels = selectedTags.map(t => t.label);
        if (tagLogic === 'AND') {
          if (!tagLabels.every(label => m.tags.includes(label))) continue;
        } else {
          if (!tagLabels.some(label => m.tags.includes(label))) continue;
        }
      }

      if (!isInDateRange(m.year)) continue;
      filteredArray.push(m);
    }
  }

  filteredArray.forEach(m => {
    data[m.tier].push(m);
  });

  Object.keys(data).forEach(tier => {
    data[tier].sort((a, b) => {
      if (sortOrder === 'dateNewest') return new Date(b.year) - new Date(a.year);
      if (sortOrder === 'dateOldest') return new Date(a.year) - new Date(b.year);
      if (sortOrder === 'titleAZ') return a.title.localeCompare(b.title);
      const ai = (typeof a.orderIndex === 'number') ? a.orderIndex : Number.MAX_SAFE_INTEGER;
      const bi = (typeof b.orderIndex === 'number') ? b.orderIndex : Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      return (a.title || '').localeCompare(b.title || '');
    });
  });

  let tags_list = [];
  if (tagLogic === 'OR') {
    tags_list = allTags;
  } else {
    const allTagsList = allTags.map((item) => item['label']);
    const added_tags = new Set();
    Object.keys(data).forEach(tier => {
      data[tier].forEach(item => {
        if(item.tags) {
          item.tags.forEach(tag => {
            const foundIndex = allTagsList.indexOf(tag);
            if(foundIndex >= 0 && !added_tags.has(tag)) {
              tags_list.push({ value: foundIndex, label: tag });
              added_tags.add(tag);
            }
          });
        }
      });
    });
  }
  setSuggestedTags(tags_list);
  setSearchChanged(false);
  return data;
}

/**
 * Gets a truncated title for media type tier lists
 * @param {string} mediaType - The media type (anime, tv, movies, games)
 * @param {string} toDoString - The to-do string ('to-do' or 'collection')
 * @returns {string} - The truncated title
 */
export function getTruncatedTitle(mediaType, toDoString) {
  const displayToDoString = toDoString === 'to-do' ? 'To-Do' : toCapitalNotation(toDoString);
  const fullTitle = `${toCapitalNotation(mediaType)} ${displayToDoString} Tier List`;
  return fullTitle.length > 20 ? `${toCapitalNotation(mediaType)} ${displayToDoString}` : fullTitle;
}

/**
 * Calculates dropdown width based on label lengths
 * @param {array} labels - Array of label strings or objects with 'text' and optional 'hasIcon' properties
 * @param {object} options - Options object
 * @param {string} options.variant - 'mobile' or 'desktop' (default: 'mobile')
 * @param {number} options.minWidth - Minimum width in pixels (default: 80)
 * @param {number} options.iconWidth - Additional width per icon in pixels (default: 0)
 * @returns {number} - Calculated width in pixels
 */
export function calculateDropdownWidth(labels, { variant = 'mobile', minWidth = 80, iconWidth = 0 } = {}) {
  if (!labels.length) return minWidth;
  
  // Handle both string arrays and object arrays
  const widths = labels.map(label => {
    const text = typeof label === 'string' ? label : label.text;
    const hasIcon = typeof label === 'object' && label.hasIcon;
    const charWidth = variant === 'desktop' ? 7 : 6;
    const padding = variant === 'desktop' ? 32 : 24;
    return text.length * charWidth + padding + (hasIcon ? iconWidth : 0);
  });
  
  return Math.max(Math.max(...widths), minWidth);
}

/**
 * Creates an empty tier object with all standard tiers as keys and empty arrays as values
 * @returns {object} - Object with tier keys (S, A, B, C, D, F) and empty arrays
 */
export function createEmptyTiersObject() {
  const tiers = constants.STANDARD_TIERS;
  const tiersObj = {};
  tiers.forEach(tier => {
    tiersObj[tier] = [];
  });
  return tiersObj;
}
