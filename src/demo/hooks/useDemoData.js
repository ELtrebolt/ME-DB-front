import { useState, useEffect, useCallback } from 'react';

// Import sample data
import animeData from '../data/anime.json';
import tvData from '../data/tv.json';
import moviesData from '../data/movies.json';
import gamesData from '../data/games.json';

const STORAGE_KEY_PREFIX = 'demo_';
const VERSION_KEY = 'demo_version';
// Increment this version when you update the default JSON data files
// This will cause all users to get fresh data on their next visit
const DEMO_VERSION = '1.0';

const defaultData = {
  anime: animeData,
  tv: tvData,
  movies: moviesData,
  games: gamesData
};

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
 * Safe localStorage remover
 * @param {string} key 
 */
const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('localStorage.removeItem failed:', e.message);
  }
};

/**
 * Check and handle demo data versioning
 * If version mismatch, clear old demo data so users get fresh defaults
 */
const checkAndUpdateVersion = () => {
  const storedVersion = safeGetItem(VERSION_KEY);
  
  if (storedVersion !== DEMO_VERSION) {
    // Version mismatch - clear all demo data
    ['anime', 'tv', 'movies', 'games'].forEach(type => {
      safeRemoveItem(`${STORAGE_KEY_PREFIX}${type}`);
    });
    // Update stored version
    safeSetItem(VERSION_KEY, DEMO_VERSION);
    return true; // Indicates data was reset
  }
  return false;
};

/**
 * Custom hook for managing demo data with localStorage persistence
 * @param {string} mediaType - The media type (anime, tv, movies, games)
 * @returns {object} - Data and CRUD operations
 */
export const useDemoData = (mediaType) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uniqueTags, setUniqueTags] = useState([]);
  const [storageAvailable, setStorageAvailable] = useState(true);

  const storageKey = `${STORAGE_KEY_PREFIX}${mediaType}`;

  // Initialize data from localStorage or default JSON
  useEffect(() => {
    if (!mediaType || !['anime', 'tv', 'movies', 'games'].includes(mediaType)) {
      setLoading(false);
      return;
    }

    // Check if localStorage is available
    const available = isLocalStorageAvailable();
    setStorageAvailable(available);

    if (!available) {
      // localStorage not available - use in-memory defaults only
      console.warn('localStorage is not available. Demo changes will not persist.');
      const initialData = defaultData[mediaType] || [];
      setData(initialData);
      updateUniqueTags(initialData);
      setLoading(false);
      return;
    }

    // Check version and reset if needed
    checkAndUpdateVersion();

    const storedData = safeGetItem(storageKey);
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
        updateUniqueTags(parsedData);
      } catch (e) {
        // If parse fails, use default data
        const initialData = defaultData[mediaType] || [];
        safeSetItem(storageKey, JSON.stringify(initialData));
        setData(initialData);
        updateUniqueTags(initialData);
      }
    } else {
      // First visit or data was reset - initialize from JSON
      const initialData = defaultData[mediaType] || [];
      safeSetItem(storageKey, JSON.stringify(initialData));
      setData(initialData);
      updateUniqueTags(initialData);
    }
    
    setLoading(false);
  }, [mediaType, storageKey]);

  // Update unique tags from data
  const updateUniqueTags = (mediaData) => {
    const tags = new Set();
    mediaData.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => tags.add(tag));
      }
    });
    setUniqueTags(Array.from(tags).sort());
  };

  // Save data to localStorage (with fallback to in-memory only)
  const saveToStorage = useCallback((newData) => {
    if (storageAvailable) {
      const success = safeSetItem(storageKey, JSON.stringify(newData));
      if (!success) {
        console.warn('Failed to save to localStorage. Changes are in-memory only.');
      }
    }
    setData(newData);
    updateUniqueTags(newData);
  }, [storageKey, storageAvailable]);

  // Get media by toDo status (collection or to-do)
  const getMediaByToDo = useCallback((toDo) => {
    if (!data) return [];
    return data.filter(item => item.toDo === toDo);
  }, [data]);

  // Get media organized by tier
  const getMediaByTier = useCallback((toDo) => {
    const tiersObj = { S: [], A: [], B: [], C: [], D: [], F: [] };
    const filtered = getMediaByToDo(toDo);
    
    filtered.forEach(item => {
      if (tiersObj[item.tier]) {
        tiersObj[item.tier].push(item);
      }
    });

    // Sort by orderIndex within each tier
    Object.keys(tiersObj).forEach(tier => {
      tiersObj[tier].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    });

    return tiersObj;
  }, [getMediaByToDo]);

  // Get single media item by ID
  const getMediaById = useCallback((id) => {
    if (!data) return null;
    return data.find(item => item.ID === id) || null;
  }, [data]);

  // Create new media item
  const createMedia = useCallback((newItem) => {
    if (!data) return null;
    
    // Generate unique ID
    const timestamp = Date.now();
    const newId = `demo-${mediaType}-new-${timestamp}`;
    
    const itemWithId = {
      ...newItem,
      ID: newId,
      mediaType: mediaType
    };
    
    const newData = [...data, itemWithId];
    saveToStorage(newData);
    
    return itemWithId;
  }, [data, mediaType, saveToStorage]);

  // Update existing media item
  const updateMedia = useCallback((id, updates) => {
    if (!data) return false;
    
    const index = data.findIndex(item => item.ID === id);
    if (index === -1) return false;
    
    const newData = [...data];
    newData[index] = { ...newData[index], ...updates };
    saveToStorage(newData);
    
    return true;
  }, [data, saveToStorage]);

  // Delete media item
  const deleteMedia = useCallback((id) => {
    if (!data) return false;
    
    const newData = data.filter(item => item.ID !== id);
    if (newData.length === data.length) return false;
    
    saveToStorage(newData);
    return true;
  }, [data, saveToStorage]);

  // Reorder items within a tier
  const reorderInTier = useCallback((tier, toDo, orderedIds) => {
    if (!data) return false;
    
    const newData = [...data];
    
    // Update orderIndex for items in the specified tier
    orderedIds.forEach((id, index) => {
      const itemIndex = newData.findIndex(item => item.ID === id);
      if (itemIndex !== -1) {
        newData[itemIndex] = { ...newData[itemIndex], orderIndex: index };
      }
    });
    
    saveToStorage(newData);
    return true;
  }, [data, saveToStorage]);

  // Move item to different tier
  const moveToTier = useCallback((id, newTier, newOrderIndex = 0) => {
    if (!data) return false;
    
    const index = data.findIndex(item => item.ID === id);
    if (index === -1) return false;
    
    const newData = [...data];
    newData[index] = { 
      ...newData[index], 
      tier: newTier, 
      orderIndex: newOrderIndex 
    };
    
    saveToStorage(newData);
    return true;
  }, [data, saveToStorage]);

  // Toggle between collection and to-do
  const toggleToDo = useCallback((id) => {
    if (!data) return false;
    
    const index = data.findIndex(item => item.ID === id);
    if (index === -1) return false;
    
    const newData = [...data];
    newData[index] = { 
      ...newData[index], 
      toDo: !newData[index].toDo,
      orderIndex: 0 // Reset order when moving between lists
    };
    
    saveToStorage(newData);
    return true;
  }, [data, saveToStorage]);

  // Reset to default data
  const resetToDefault = useCallback(() => {
    const initialData = defaultData[mediaType] || [];
    saveToStorage(initialData);
  }, [mediaType, saveToStorage]);

  // Get all media across all types (for stats)
  const getAllDemoData = useCallback(() => {
    const allData = {};
    ['anime', 'tv', 'movies', 'games'].forEach(type => {
      const key = `${STORAGE_KEY_PREFIX}${type}`;
      const stored = safeGetItem(key);
      if (stored) {
        try {
          allData[type] = JSON.parse(stored);
        } catch (e) {
          allData[type] = defaultData[type] || [];
        }
      } else {
        allData[type] = defaultData[type] || [];
      }
    });
    return allData;
  }, []);

  return {
    data,
    loading,
    uniqueTags,
    storageAvailable, // New: indicates if changes will persist
    getMediaByToDo,
    getMediaByTier,
    getMediaById,
    createMedia,
    updateMedia,
    deleteMedia,
    reorderInTier,
    moveToTier,
    toggleToDo,
    resetToDefault,
    getAllDemoData
  };
};

/**
 * Utility hook to get all demo data for stats
 */
export const useAllDemoData = () => {
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    const loadAllData = () => {
      // Check if localStorage is available
      const available = isLocalStorageAvailable();
      setStorageAvailable(available);

      // Check version and reset if needed
      if (available) {
        checkAndUpdateVersion();
      }

      const data = {};
      ['anime', 'tv', 'movies', 'games'].forEach(type => {
        const key = `${STORAGE_KEY_PREFIX}${type}`;
        const stored = available ? safeGetItem(key) : null;
        if (stored) {
          try {
            data[type] = JSON.parse(stored);
          } catch (e) {
            data[type] = defaultData[type] || [];
          }
        } else {
          // Initialize from default if not in storage
          data[type] = defaultData[type] || [];
          if (available) {
            safeSetItem(key, JSON.stringify(data[type]));
          }
        }
      });
      setAllData(data);
      setLoading(false);
    };

    loadAllData();
  }, []);

  return { allData, loading, storageAvailable };
};

export default useDemoData;
