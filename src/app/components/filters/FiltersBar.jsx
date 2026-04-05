import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import TimeFilter from "./TimeFilter";
import ExtraFilters from "./ExtraFilters";
import SearchBar from "./SearchBar";
import TagFilter from "./TagFilter";

import constants from '../../constants';

/**
 * FiltersBar - A reusable filter component containing TimeFilter, SearchBar, TagFilter, and ExtraFilters
 * 
 * Props:
 * - mediaType: string - The type of media being filtered
 * - basePath: string - Base path for navigation (optional)
 * - filteredData: object - The filtered data to pass to SearchBar
 * - suggestedTags: array - Tags to suggest in TagFilter
 * - selectedTags: array - Currently selected tags
 * - setSelectedTags: function - Setter for selected tags
 * - setSearchChanged: function - Callback to trigger filter recalculation
 * 
 * Filter state props (all required):
 * - timePeriod, setTimePeriod
 * - startDate, setStartDate
 * - endDate, setEndDate
 * - tagLogic, setTagLogic
 * - searchQuery, setSearchQuery
 * - searchScope, setSearchScope
 * - sortOrder, setSortOrder
 * - showExtraFilters, setShowExtraFilters
 */
function FiltersBar({
  // Data props
  mediaType,
  basePath = '',
  filteredData,
  suggestedTags,
  selectedTags,
  setSelectedTags,
  setSearchChanged,
  
  // Time filter state
  timePeriod,
  setTimePeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  
  // Tag filter state
  tagLogic,
  setTagLogic,
  
  // Search state
  searchQuery,
  setSearchQuery,
  searchScope,
  setSearchScope,
  
  // Sort state
  sortOrder,
  setSortOrder,
  
  // Extra filters visibility
  showExtraFilters,
  setShowExtraFilters,
  
  // Selected tiers (for clearing)
  setSelectedTiers,
  
  // Skip URL sync on first load (parent controls this)
  skipUrlSync = false
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasHadTagsRef = useRef(false);
  const isFirstRender = useRef(true);

  // Auto-show extra filters when custom time period is selected
  useEffect(() => {
    if (timePeriod === 'custom') {
      setShowExtraFilters(true);
    }
  }, [timePeriod, setShowExtraFilters]);

  // URL Sync - Update URL when filters change
  useEffect(() => {
    // Skip URL sync on first render or if explicitly disabled
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (skipUrlSync) return;
    
    const urlParams = new URLSearchParams(location.search);
    let changed = false;
    
    const updateParam = (key, val, def) => {
      if (val !== def) {
        if (urlParams.get(key) !== val) { urlParams.set(key, val); changed = true; }
      } else if (urlParams.has(key)) { urlParams.delete(key); changed = true; }
    };

    updateParam('timePeriod', timePeriod, 'all');
    updateParam('startDate', startDate, '');
    updateParam('endDate', endDate, '');
    updateParam('tagLogic', tagLogic, 'AND');

    // Read current tags from repeated 'tag' params; fall back to legacy comma 'tags' param
    const currentTagValues = urlParams.getAll('tag');
    const legacyTagsParam = urlParams.get('tags');
    const currentTagLabels = currentTagValues.length > 0
      ? currentTagValues
      : (legacyTagsParam ? legacyTagsParam.split(',').map(s => s.trim()).filter(Boolean) : []);

    if (selectedTags && selectedTags.length > 0) {
      hasHadTagsRef.current = true;
      const selectedLabels = selectedTags.map(tag => tag.label);
      const isSame = selectedLabels.length === currentTagLabels.length &&
        selectedLabels.every((l, i) => l === currentTagLabels[i]);
      if (!isSame) {
        // Remove both old formats and write new repeated params
        urlParams.delete('tags');
        urlParams.delete('tag');
        selectedLabels.forEach(label => urlParams.append('tag', label));
        changed = true;
        const pathParts = location.pathname.split('/');
        if (pathParts.length >= 3) urlParams.set('from', pathParts[2]);
      }
    } else if (currentTagLabels.length > 0) {
      const shouldHydrate = setSelectedTags && !hasHadTagsRef.current;
      if (shouldHydrate) {
        // Hydrate from URL when landing with tags (e.g. "Go Back" from detail)
        setSelectedTags(currentTagLabels.map(label => ({ label, value: label })));
      } else {
        urlParams.delete('tags');
        urlParams.delete('tag');
        urlParams.delete('from');
        changed = true;
      }
    } else {
      hasHadTagsRef.current = false;
    }

    if (changed) navigate(`${location.pathname}?${urlParams.toString()}`, { replace: true });
  }, [timePeriod, startDate, endDate, tagLogic, selectedTags, location.pathname, location.search, navigate, setSelectedTags, skipUrlSync]);

  // Clear all filters and URL params
  const clearFilters = () => {
    setTimePeriod('all');
    setStartDate('');
    setEndDate('');
    setSelectedTags([]);
    setTagLogic('AND');
    setSearchQuery('');
    setSearchScope(['title']);
    if (setSelectedTiers) {
      setSelectedTiers(constants.STANDARD_TIERS);
    }
    setSortOrder('default');
    setSearchChanged(true);
    
    // Clear URL params
    const urlParams = new URLSearchParams(location.search);
    urlParams.delete('tags');
    urlParams.delete('tag');
    urlParams.delete('tagLogic');
    urlParams.delete('timePeriod');
    urlParams.delete('startDate');
    urlParams.delete('endDate');
    urlParams.delete('from');
    navigate(`${location.pathname}?${urlParams.toString()}`, { replace: true });
  };

  // Toggle tag logic between AND and OR
  const toggleLogic = () => {
    const newLogic = tagLogic === 'AND' ? 'OR' : 'AND';
    setTagLogic(newLogic);
    setSearchChanged(true);
  };

  return (
    <>
      <div className='row g-1 g-md-2 mb-2 mb-md-3' style={{flexWrap: 'nowrap'}}>
        <div className='col-4'>
          <TimeFilter 
            timePeriod={timePeriod} 
            setTimePeriod={setTimePeriod} 
            setSearchChanged={setSearchChanged}
          />
        </div>
        <div className='col-4 text-center'>
          <SearchBar 
            mediaType={mediaType} 
            allMedia={filteredData} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            setSearchChanged={setSearchChanged} 
            basePath={basePath}
          />
          <button 
            className="btn btn-link btn-sm text-warning p-0" 
            onClick={() => setShowExtraFilters(!showExtraFilters)} 
            style={{ fontSize: '0.7rem', textDecoration: 'none' }}
          >
            {showExtraFilters ? 'Hide Advanced' : 'More Filters...'}
          </button>
        </div>
        <div className='col-4'>
          <TagFilter 
            suggestedTags={suggestedTags} 
            selected={selectedTags} 
            setSelected={setSelectedTags} 
            setSearchChanged={setSearchChanged} 
            tagLogic={tagLogic} 
            setTagLogic={setTagLogic} 
            placeholder={constants[mediaType]?.tags || constants['other'].tags}
          />
        </div>
      </div>

      {showExtraFilters && (
        <ExtraFilters 
          sortOrder={sortOrder} 
          setSortOrder={setSortOrder} 
          searchScope={searchScope} 
          setSearchScope={setSearchScope} 
          onClearFilters={clearFilters} 
          setSearchChanged={setSearchChanged} 
          timePeriod={timePeriod} 
          setTimePeriod={setTimePeriod} 
          startDate={startDate} 
          setStartDate={setStartDate} 
          endDate={endDate} 
          setEndDate={setEndDate} 
          tagLogic={tagLogic} 
          setTagLogic={setTagLogic} 
          onLogicToggle={toggleLogic} 
        />
      )}
    </>
  );
}

export default FiltersBar;
