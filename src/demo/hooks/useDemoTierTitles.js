import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'demo_tierTitles';

/**
 * Check if localStorage is available and working
 * @returns {boolean}
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
 * @param {string} key 
 * @returns {string|null}
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
 * @param {string} key 
 * @param {string} value 
 * @returns {boolean} - true if successful
 */
const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    // Could be QuotaExceededError or SecurityError
    console.warn('localStorage.setItem failed:', e.message);
    return false;
  }
};

/**
 * Custom hook for managing demo tier title overrides with localStorage persistence
 * @returns {object} - Functions to get/set tier titles
 */
export const useDemoTierTitles = () => {
  const [overrides, setOverrides] = useState({});
  const [storageAvailable, setStorageAvailable] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const available = isLocalStorageAvailable();
    setStorageAvailable(available);

    if (!available) {
      console.warn('localStorage is not available. Tier title changes will not persist.');
      return;
    }

    const stored = safeGetItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setOverrides(parsed);
      } catch (e) {
        console.warn('Failed to parse stored tier titles:', e.message);
        setOverrides({});
      }
    }
  }, []);

  /**
   * Get tier title override for a specific tier
   * @param {string} mediaType - The media type (anime, tv, movies, games)
   * @param {string} toDoString - 'collection' or 'to-do'
   * @param {string} tier - The tier letter (S, A, B, C, D, F)
   * @returns {string|null} - The override title or null if not set
   */
  const getTierTitle = useCallback((mediaType, toDoString, tier) => {
    const key = `${mediaType}-${toDoString}-${tier}`;
    return overrides[key] || null;
  }, [overrides]);

  /**
   * Set tier title override for a specific tier
   * @param {string} mediaType - The media type
   * @param {string} toDoString - 'collection' or 'to-do'
   * @param {string} tier - The tier letter
   * @param {string} title - The custom title
   */
  const setTierTitle = useCallback((mediaType, toDoString, tier, title) => {
    const key = `${mediaType}-${toDoString}-${tier}`;
    const newOverrides = { ...overrides, [key]: title };
    setOverrides(newOverrides);

    if (storageAvailable) {
      safeSetItem(STORAGE_KEY, JSON.stringify(newOverrides));
    }
  }, [overrides, storageAvailable]);

  /**
   * Get all tier title overrides
   * @returns {object} - Object with keys like "mediaType-toDoString-tier"
   */
  const getAllOverrides = useCallback(() => {
    return overrides;
  }, [overrides]);

  /**
   * Clear tier title override for a specific tier
   * @param {string} mediaType - The media type
   * @param {string} toDoString - 'collection' or 'to-do'
   * @param {string} tier - The tier letter
   */
  const clearTierTitle = useCallback((mediaType, toDoString, tier) => {
    const key = `${mediaType}-${toDoString}-${tier}`;
    const newOverrides = { ...overrides };
    delete newOverrides[key];
    setOverrides(newOverrides);

    if (storageAvailable) {
      safeSetItem(STORAGE_KEY, JSON.stringify(newOverrides));
    }
  }, [overrides, storageAvailable]);

  return {
    getTierTitle,
    setTierTitle,
    getAllOverrides,
    clearTierTitle,
    storageAvailable,
    overrides // Also return overrides directly for easier access
  };
};

export default useDemoTierTitles;
