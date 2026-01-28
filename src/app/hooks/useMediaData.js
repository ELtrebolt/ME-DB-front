import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useDemoData } from '../../demo/hooks/useDemoData';

const constants = require('../constants');

/**
 * Unified data hook that works with both API (app) and localStorage (demo) data sources
 * @param {string} mediaType - The media type (anime, tv, movies, games)
 * @param {string} dataSource - 'api' for app mode, 'demo' for demo mode
 * @returns {object} - Data and CRUD operations with unified interface
 */
export const useMediaData = (mediaType, dataSource = 'api') => {
  // Use demo data hook if in demo mode
  const demoData = useDemoData(mediaType);
  
  // API mode state
  const [apiLoading, setApiLoading] = useState(true);
  const [apiUniqueTags, setApiUniqueTags] = useState([]);

  // Fetch tags from API
  const fetchApiTags = useCallback(async () => {
    try {
      const res = await axios.get(constants['SERVER_URL'] + '/api/media/' + mediaType + '/tags');
      if (res.data.uniqueTags) {
        setApiUniqueTags(res.data.uniqueTags);
      }
    } catch (err) {
      console.log('Error fetching tags:', err);
    }
  }, [mediaType]);

  // Initialize API data
  useEffect(() => {
    if (dataSource === 'api') {
      fetchApiTags();
      setApiLoading(false);
    }
  }, [dataSource, fetchApiTags]);

  // Unified interface
  const getUniqueTags = useCallback(() => {
    if (dataSource === 'demo') {
      return demoData.uniqueTags || [];
    }
    return apiUniqueTags || [];
  }, [dataSource, demoData.uniqueTags, apiUniqueTags]);

  const isLoading = dataSource === 'demo' ? demoData.loading : apiLoading;

  return {
    // Data
    uniqueTags: getUniqueTags(),
    loading: isLoading,
    
    // Demo-specific (only available in demo mode)
    data: dataSource === 'demo' ? demoData.data : null,
    getMediaByToDo: dataSource === 'demo' ? demoData.getMediaByToDo : null,
    getMediaByTier: dataSource === 'demo' ? demoData.getMediaByTier : null,
    getMediaById: dataSource === 'demo' ? demoData.getMediaById : null,
    createMedia: dataSource === 'demo' ? demoData.createMedia : null,
    updateMedia: dataSource === 'demo' ? demoData.updateMedia : null,
    deleteMedia: dataSource === 'demo' ? demoData.deleteMedia : null,
    reorderInTier: dataSource === 'demo' ? demoData.reorderInTier : null,
    moveToTier: dataSource === 'demo' ? demoData.moveToTier : null,
    toggleToDo: dataSource === 'demo' ? demoData.toggleToDo : null,
    
    // API-specific helpers
    fetchTags: dataSource === 'api' ? fetchApiTags : null,
    
    // Source indicator
    dataSource
  };
};

export default useMediaData;
