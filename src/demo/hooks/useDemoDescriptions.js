import { useState, useEffect, useCallback } from 'react';
import { DEMO_VERSION } from './useDemoData';

const STORAGE_KEY = 'demo_descriptions';
const DESCRIPTIONS_VERSION_KEY = 'demo_descriptions_version';

// Generate default descriptions based on current DEMO_VERSION
// When DEMO_VERSION changes, these will be applied fresh
const DEFAULT_DESCRIPTIONS = {
  'anime-collection': 'Top 30 from IMDB as of Jan 2026 = imdb.com/search/title/?keywords=anime',
  'anime-to-do': 'Top 30-60 from IMDB as of Jan 2026 = imdb.com/search/title/?keywords=anime',
  'movies-collection': 'Top 30 from IMDB as of Jan 2026 = imdb.com/chart/top/',
  'movies-to-do': 'Top 30-60 from IMDB as of Jan 2026 = imdb.com/chart/top/',
  'tv-collection': 'Top 30 from IMDB as of Jan 2026 = imdb.com/chart/toptv/',
  'tv-to-do': 'Top 30-60 from IMDB as of Jan 2026 = imdb.com/chart/toptv/',
  'games-collection': 'Top 30 from Metacritic as of Jan 2026 = metacritic.com/browse/game/',
  'games-to-do': 'Top 30-60 from Metacritic as of Jan 2026 = metacritic.com/browse/game/',
};

/**
 * Check if localStorage is available and working
 */
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Safe localStorage getter
 */
const safeGetItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn('localStorage.getItem failed:', e.message);
    return null;
  }
};

/**
 * Safe localStorage setter
 */
const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn('localStorage.setItem failed:', e.message);
    return false;
  }
};

/**
 * Custom hook for managing demo list descriptions with localStorage persistence
 */
export const useDemoDescriptions = () => {
  const [descriptions, setDescriptions] = useState(DEFAULT_DESCRIPTIONS);
  const [storageAvailable, setStorageAvailable] = useState(true);

  // Initialize from localStorage (merge with defaults)
  // Reset descriptions when DEMO_VERSION changes
  useEffect(() => {
    const available = isLocalStorageAvailable();
    setStorageAvailable(available);

    if (!available) {
      console.warn('localStorage is not available. Description changes will not persist.');
      return;
    }

    // Check if version has changed - if so, reset descriptions to defaults
    const storedVersion = safeGetItem(DESCRIPTIONS_VERSION_KEY);
    if (storedVersion !== DEMO_VERSION) {
      // Version mismatch - clear old descriptions and use fresh defaults
      safeSetItem(STORAGE_KEY, JSON.stringify(DEFAULT_DESCRIPTIONS));
      safeSetItem(DESCRIPTIONS_VERSION_KEY, DEMO_VERSION);
      setDescriptions(DEFAULT_DESCRIPTIONS);
      return;
    }

    const stored = safeGetItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge stored values with defaults (stored takes priority)
        setDescriptions({ ...DEFAULT_DESCRIPTIONS, ...parsed });
      } catch (e) {
        console.warn('Failed to parse stored descriptions:', e.message);
        setDescriptions(DEFAULT_DESCRIPTIONS);
      }
    }
  }, []);

  /**
   * Get description for a specific list
   * @param {string} mediaType - The media type (anime, tv, movies, games)
   * @param {string} toDoString - 'collection' or 'to-do'
   * @returns {string} - The description
   */
  const getDescription = useCallback((mediaType, toDoString) => {
    const key = `${mediaType}-${toDoString}`;
    return descriptions[key] || '';
  }, [descriptions]);

  /**
   * Set description for a specific list
   * @param {string} mediaType - The media type
   * @param {string} toDoString - 'collection' or 'to-do'
   * @param {string} description - The description text
   */
  const setDescription = useCallback((mediaType, toDoString, description) => {
    const key = `${mediaType}-${toDoString}`;
    const newDescriptions = { ...descriptions, [key]: description };
    setDescriptions(newDescriptions);

    if (storageAvailable) {
      safeSetItem(STORAGE_KEY, JSON.stringify(newDescriptions));
    }
  }, [descriptions, storageAvailable]);

  return {
    getDescription,
    setDescription,
    descriptions,
    storageAvailable
  };
};

export default useDemoDescriptions;
