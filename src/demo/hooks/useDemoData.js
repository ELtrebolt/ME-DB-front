import { useState, useEffect, useCallback } from 'react';
import { createEmptyTiersObject } from '../../app/helpers';

const STORAGE_KEY_PREFIX = 'demo_';
export const VERSION_KEY = 'demo_version';
// Increment this version when you update the default JSON data files
// This will cause all users to get fresh data AND descriptions on their next visit
export const DEMO_VERSION = '1.0';

const MEDIA_TYPES = ['anime', 'tv', 'movies', 'games'];

/**
 * Dynamically import a single media type's default JSON data.
 * Webpack splits each JSON into its own chunk, so only the requested
 * type is downloaded — not all four at once.
 */
const loadDefaultData = (mediaType) =>
  import(`../data/${mediaType}.json`).then((m) => m.default);

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
    MEDIA_TYPES.forEach(type => {
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

  // Initialize data from localStorage or default JSON (loaded on demand)
  useEffect(() => {
    if (!mediaType || !MEDIA_TYPES.includes(mediaType)) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      const available = isLocalStorageAvailable();
      setStorageAvailable(available);

      if (!available) {
        const defaultForType = await loadDefaultData(mediaType);
        setData(defaultForType);
        updateUniqueTags(defaultForType);
        setLoading(false);
        return;
      }

      checkAndUpdateVersion();

      const storedData = safeGetItem(storageKey);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setData(parsedData);
          updateUniqueTags(parsedData);
        } catch (e) {
          const defaultForType = await loadDefaultData(mediaType);
          safeSetItem(storageKey, JSON.stringify(defaultForType));
          setData(defaultForType);
          updateUniqueTags(defaultForType);
        }
      } else {
        const defaultForType = await loadDefaultData(mediaType);
        safeSetItem(storageKey, JSON.stringify(defaultForType));
        setData(defaultForType);
        updateUniqueTags(defaultForType);
      }

      setLoading(false);
    };

    loadData();
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
    const tiersObj = createEmptyTiersObject();
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
    
    // Generate unique numeric ID (per media type)
    const maxN = data.reduce((max, item) => {
      const n = parseInt(item.ID, 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0);
    const newId = String(maxN + 1);
    
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

  // Reset to default data (async — loads the JSON chunk on demand)
  const resetToDefault = useCallback(async () => {
    const defaultForType = await loadDefaultData(mediaType);
    saveToStorage(defaultForType);
  }, [mediaType, saveToStorage]);

  return {
    data,
    loading,
    uniqueTags,
    storageAvailable,
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
  };
};

/**
 * Utility hook to get all demo data for stats.
 * Loads each media type's JSON chunk in parallel only when not already in localStorage.
 */
export const useAllDemoData = () => {
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      const available = isLocalStorageAvailable();
      setStorageAvailable(available);

      if (available) {
        checkAndUpdateVersion();
      }

      const data = {};
      await Promise.all(
        MEDIA_TYPES.map(async (type) => {
          const key = `${STORAGE_KEY_PREFIX}${type}`;
          const stored = available ? safeGetItem(key) : null;
          if (stored) {
            try {
              data[type] = JSON.parse(stored);
            } catch (e) {
              const defaultForType = await loadDefaultData(type);
              data[type] = defaultForType;
            }
          } else {
            const defaultForType = await loadDefaultData(type);
            data[type] = defaultForType;
            if (available) {
              safeSetItem(key, JSON.stringify(defaultForType));
            }
          }
        })
      );

      setAllData(data);
      setLoading(false);
    };

    loadAllData();
  }, []);

  return { allData, loading, storageAvailable };
};

export default useDemoData;
