import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import CardsContainer from "../components/CardsContainer";
import TimeFilter from "../components/TimeFilter";
import ExtraFilters from "../components/ExtraFilters";
import SearchBar from "../components/SearchBar";
import TagFilter from "../components/TagFilter";
import useSwipe from "../hooks/useSwipe.tsx";

import TierTitle from "../components/TierTitle";

const constants = require('../constants');
const theme = require('../../styling/theme');

function toCapitalNotation(inputString) {
  if (!inputString) return '';
  return inputString
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function filterData(tierData, timePeriod, startDate, endDate, allTags, selectedTags, tagLogic, setSuggestedTags, setSearchChanged, searchQuery, searchScope, selectedTiers, sortOrder) {
  var array = [];
  var data = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
  };
  
  if (!tierData) return data;

  // Helper to check if a date is within range
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

  for(const tier of Object.keys(tierData)) {
    // Filter by Tiers
    if (selectedTiers && !selectedTiers.includes(tier)) continue;

    for(const m of tierData[tier]) {
      // 1. Filter by SearchQuery and SearchScope
      if(searchQuery !== '') {
        const query = searchQuery.toLowerCase();
        let match = false;
        if (searchScope.includes('title') && m.title.toLowerCase().includes(query)) match = true;
        if (!match && searchScope.includes('description') && m.description && m.description.toLowerCase().includes(query)) match = true;
        if (!match && searchScope.includes('tags') && m.tags && m.tags.some(t => t.toLowerCase().includes(query))) match = true;
        
        if(!match) continue;
      }

      // 2. Filter by Tags and TagLogic
      if(selectedTags && selectedTags.length > 0) {
        if(!m.tags || m.tags.length === 0) continue;
        const tagLabels = selectedTags.map(t => t.label);
        if (tagLogic === 'AND') {
          if (!tagLabels.every(label => m.tags.includes(label))) continue;
        } else {
          if (!tagLabels.some(label => m.tags.includes(label))) continue;
        }
      }

      // 3. Filter by Time Period
      if (!isInDateRange(m.year)) continue;

      array.push(m);
    }
  }

  // Group back into tiers
  array.forEach(m => {
    data[m.tier].push(m);
  });

  // 4. Sort each tier
  Object.keys(data).forEach(tier => {
    data[tier].sort((a, b) => {
      if (sortOrder === 'dateNewest') {
        return new Date(b.year) - new Date(a.year);
      } else if (sortOrder === 'dateOldest') {
        return new Date(a.year) - new Date(b.year);
      } else if (sortOrder === 'titleAZ') {
        return a.title.localeCompare(b.title);
      } else {
        // Default: orderIndex then title
        const ai = (typeof a.orderIndex === 'number') ? a.orderIndex : Number.MAX_SAFE_INTEGER;
        const bi = (typeof b.orderIndex === 'number') ? b.orderIndex : Number.MAX_SAFE_INTEGER;
        if (ai !== bi) return ai - bi;
        const at = a.title || '';
        const bt = b.title || '';
        return at.localeCompare(bt);
      }
    });
  });

  // Change TagsList Dynamically
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

function SharedView() {
  const { token, username, mediaType: urlMediaType } = useParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data
  const [allMedia, setAllMedia] = useState([]);
  const [shareConfig, setShareConfig] = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [tierTitles, setTierTitles] = useState({});
  const [collectionTierTitles, setCollectionTierTitles] = useState({});
  const [todoTierTitles, setTodoTierTitles] = useState({});
  
  // View State
  const [toDoState, setToDoState] = useState(false); // default to collection unless only todo shared
  const [filteredData, setFilteredData] = useState({});
  
  // Filters
  const [timePeriod, setTimePeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tagLogic, setTagLogic] = useState('AND');
  const [searchScope, setSearchScope] = useState(['title']);
  const [selectedTiers, setSelectedTiers] = useState(["S", "A", "B", "C", "D", "F"]);
  const [sortOrder, setSortOrder] = useState('default');
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchChanged, setSearchChanged] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExtraFilters, setShowExtraFilters] = useState(false);

  // Automatically show extra filters when Custom Range is selected
  useEffect(() => {
    if (timePeriod === 'custom') {
      setShowExtraFilters(true);
    }
  }, [timePeriod]);

  const clearFilters = () => {
    setTimePeriod('all');
    setStartDate('');
    setEndDate('');
    setSelectedTags([]);
    setTagLogic('AND');
    setSearchQuery('');
    setSearchScope(['title']);
    setSelectedTiers(["S", "A", "B", "C", "D", "F"]);
    setSortOrder('default');
    setSearchChanged(true);
  };

  const toggleLogic = () => {
    const newLogic = tagLogic === 'AND' ? 'OR' : 'AND';
    setTagLogic(newLogic);
    setSearchChanged(true);
  };
  
  // Modal for card details
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const tiers = ["S", "A", "B", "C", "D", "F"];

  // Fetch Data
  useEffect(() => {
    const fetchUrl = (username && urlMediaType) 
      ? `${constants['SERVER_URL']}/api/share/user/${username}/${urlMediaType}`
      : `${constants['SERVER_URL']}/api/share/${token}`;

    axios.get(fetchUrl)
      .then(res => {
        if (res.data.success) {
          console.log('Share data received:', res.data);
          setAllMedia(res.data.media);
          setShareConfig(res.data.shareConfig);
          setMediaType(res.data.mediaType);
          // Set username (no need to split, backend returns username)
          setOwnerName(res.data.ownerName || 'User');
          
          // Set tier titles
          console.log('Tier titles from API:', res.data.tierTitles);
          console.log('Collection tier titles:', res.data.collectionTierTitles);
          console.log('Todo tier titles:', res.data.todoTierTitles);
          
          if(res.data.collectionTierTitles && Object.keys(res.data.collectionTierTitles).length > 0) {
            setCollectionTierTitles(res.data.collectionTierTitles);
          } else {
            setCollectionTierTitles({ S: 'S Tier', A: 'A Tier', B: 'B Tier', C: 'C Tier', D: 'D Tier', F: 'F Tier' });
          }
          
          if(res.data.todoTierTitles && Object.keys(res.data.todoTierTitles).length > 0) {
            setTodoTierTitles(res.data.todoTierTitles);
          } else {
            setTodoTierTitles({ S: 'S Tier', A: 'A Tier', B: 'B Tier', C: 'C Tier', D: 'D Tier', F: 'F Tier' });
          }
          
          // Set initial tier titles based on the initial view
          if (res.data.shareConfig.todo && !res.data.shareConfig.collection) {
            setTierTitles(res.data.todoTierTitles || { S: 'S Tier', A: 'A Tier', B: 'B Tier', C: 'C Tier', D: 'D Tier', F: 'F Tier' });
          } else {
            setTierTitles(res.data.collectionTierTitles || { S: 'S Tier', A: 'A Tier', B: 'B Tier', C: 'C Tier', D: 'D Tier', F: 'F Tier' });
          }
          
          // Determine initial view
          if (res.data.shareConfig.todo && !res.data.shareConfig.collection) {
            setToDoState(true);
          } else {
            setToDoState(false);
          }
          
          setIsLoading(false);
          setSearchChanged(true); // Trigger filter
          setError(null); // Clear any previous error
        }
      })
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.error || 'Link invalid or expired');
        setIsLoading(false);
      });
  }, [token, username, urlMediaType]);

  // Process Data into Tiers
  useEffect(() => {
    if (isLoading || !shareConfig) return;

    // 1. Filter by Collection vs Todo based on current view
    const currentList = allMedia.filter(m => m.toDo === toDoState);
    
    // 2. Extract filterable metadata (tags)
    var all_tags = new Set();
    
    currentList.forEach(m => {
      if (m.tags) m.tags.forEach(t => all_tags.add(t));
    });

    // 3. Group by Tier
    var tierData = {
      S: [], A: [], B: [], C: [], D: [], F: []
    };
    currentList.forEach(m => {
        if(tierData[m.tier]) tierData[m.tier].push(m);
    });

    // 4. Apply Filters (Year, Tag, Search)
    if (searchChanged === undefined || searchChanged === true) {
        const data = filterData(tierData, timePeriod, startDate, endDate, Array.from(all_tags).map((t, i) => ({ value: i, label: t })), selectedTags, tagLogic, setSuggestedTags, setSearchChanged, searchQuery, searchScope, selectedTiers, sortOrder);
        setFilteredData(data);
    }
    
  }, [allMedia, toDoState, isLoading, shareConfig, searchChanged, timePeriod, startDate, endDate, selectedTags, tagLogic, searchQuery, searchScope, selectedTiers, sortOrder]);


  function switchToDo() {
    if (shareConfig.collection && shareConfig.todo) {
        const newToDoState = !toDoState;
        setToDoState(newToDoState);
        
        // Update tier titles based on the new view
        if (newToDoState) {
          setTierTitles(todoTierTitles);
        } else {
          setTierTitles(collectionTierTitles);
        }
        
        setSearchChanged(true);
    }
  }

  // Swipe Handlers
  function onSwipeLeft() {
    if (toDoState === false && shareConfig.todo) {
      switchToDo();
    }
  }
  
  function onSwipeRight() {
    if (toDoState === true && shareConfig.collection) {
      switchToDo();
    }
  }

  const swipeHandlers = useSwipe({ 
    onSwipedLeft: onSwipeLeft, 
    onSwipedRight: onSwipeRight,
  });
  
  const handleCardClick = (media) => {
    setSelectedMedia(media);
    setShowDetailsModal(true);
  };

  if (isLoading) return <div className="text-white text-center pt-5">Loading...</div>;
  if (error) return <div className="text-danger text-center pt-5"><h3>{error}</h3></div>;

  const showSwitch = shareConfig.collection && shareConfig.todo;

  return (
    <div 
      className='ShowMediaList' 
      style={{backgroundColor: theme.colors.background.primary, minHeight: '100vh'}}
      {...swipeHandlers}
        onTouchStart={(e) => {
          if (swipeHandlers.onTouchStart) {
            swipeHandlers.onTouchStart(e);
          }
        }}
        onMouseDown={(e) => {
          if (swipeHandlers.onMouseDown) {
            swipeHandlers.onMouseDown(e);
          }
        }}
    >
      <div className='container'>
        <div className='pt-4'>
            {/* Header */}
            <div className='row align-items-center mb-3'>
                <div className='col-3 d-flex justify-content-start'>
                    {showSwitch && (
                        <button 
                            className='btn btn-warning btn-sm'
                            onClick={switchToDo}
                        >
                             <i className="fas fa-exchange-alt me-1"></i>
                             <span className="d-none d-md-inline">{toDoState ? 'View Collection' : 'View To-Do'}</span>
                             <span className="d-md-none">{toDoState ? 'Col' : 'To-Do'}</span>
                        </button>
                    )}
                </div>
                <div className='col-6 text-center'>
                    <h1 className='fw-light text-white mb-0' style={{ 
                        fontFamily: 'Roboto, sans-serif', 
                        fontSize: 'clamp(18px, 5vw, 36px)',
                    }}>
                        <span style={{color: theme.colors.primary}}>{ownerName}</span>'s {toCapitalNotation(mediaType)} {toDoState ? 'To-Do' : 'Collection'}
                    </h1>
                </div>
                <div className='col-3 d-flex justify-content-end'>
                    {/* Placeholder for balance */}
                </div>
            </div>

            {/* Filters */}
            <div className='row g-1 g-md-2 mb-2 mb-md-3' style={{overflow: 'visible', position: 'relative', display: 'flex', flexWrap: 'nowrap'}}>
                <div className='col-lg-4 col-md-4 col-sm-4' style={{flex: '0 0 33.333333%', maxWidth: '33.333333%', overflow: 'visible', position: 'relative', paddingLeft: '0.25rem', paddingRight: '0.25rem'}}>
                    <TimeFilter timePeriod={timePeriod} setTimePeriod={setTimePeriod} setSearchChanged={setSearchChanged}/>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-4' style={{flex: '0 0 33.333333%', maxWidth: '33.333333%', overflow: 'visible', position: 'relative', paddingLeft: '0.25rem', paddingRight: '0.25rem'}}>
                    <SearchBar mediaType={mediaType} allMedia={filteredData} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setSearchChanged={setSearchChanged}></SearchBar>
                    <div className="text-center mt-1">
                      <button 
                        className="btn btn-link btn-sm text-warning p-0" 
                        onClick={() => setShowExtraFilters(!showExtraFilters)}
                        style={{ fontSize: '0.7rem', textDecoration: 'none' }}
                      >
                        {showExtraFilters ? 'Hide Advanced' : 'More Filters...'}
                      </button>
                    </div>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-4' style={{overflow: 'visible', position: 'relative', flex: '0 0 33.333333%', maxWidth: '33.333333%', paddingLeft: '0.25rem', paddingRight: '0.25rem'}}>
                    <TagFilter suggestedTags={suggestedTags} selected={selectedTags} setSelected={setSelectedTags} setSearchChanged={setSearchChanged} tagLogic={tagLogic} setTagLogic={setTagLogic}></TagFilter>
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
        </div>
      </div>

      <hr />

      {/* Tiers */}
      <div className='container'>
      {tiers.map((item) => (
          <div className='tier-container' key={item}>
            <TierTitle 
                title={tierTitles[item] || item} 
                mediaType={mediaType} 
                group={toDoState ? 'to-do' : 'collection'} 
                tier={item} 
                setUserChanged={() => {}} // No-op
                newType={false}
                readOnly={true} // New prop for read-only mode
            />
            
            <CardsContainer
              tier={item}
              items={filteredData[item]}
              onCardClick={handleCardClick}
            />
          </div>
        ))}
      </div>
      
      {/* Details Modal */}
      {showDetailsModal && selectedMedia && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.7)'}} tabIndex="-1" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-dialog modal-dialog-centered modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shared-view-modal">
              <div className="modal-header shared-view-modal-header">
                <h5 className="modal-title fw-semibold text-dark">{selectedMedia.title}</h5>
                <button type="button" className="btn-close shared-view-close" onClick={() => setShowDetailsModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body shared-view-modal-body p-4">
                <div className="table-responsive">
                  <table className='table table-borderless mb-0'>
                    <tbody>
                      <tr>
                        <td className='fw-semibold py-2 shared-view-label'>Date</td>
                        <td className='py-2 fw-medium shared-view-value'>{selectedMedia.year ? new Date(selectedMedia.year).toISOString().split('T')[0] : '-'}</td>
                      </tr>
                      <tr>
                        <td className='fw-semibold py-2 shared-view-label'>Tier</td>
                        <td className='py-2 fw-medium shared-view-value'>{tierTitles[selectedMedia.tier] || selectedMedia.tier}</td>
                      </tr>
                      <tr>
                        <td className='fw-semibold py-2 shared-view-label'>Tags</td>
                        <td className='py-2 fw-medium shared-view-value'>{selectedMedia.tags && selectedMedia.tags.length > 0 ? selectedMedia.tags.join(', ') : '-'}</td>
                      </tr>
                      <tr>
                        <td className='fw-semibold py-2 shared-view-label'>Description</td>
                        <td className='py-2 fw-medium shared-view-value'>{selectedMedia.description || '-'}</td>
                      </tr>
                      <tr>
                        <td className='fw-semibold py-2 shared-view-label'>List Type</td>
                        <td className='py-2 fw-medium shared-view-value'>{selectedMedia.toDo ? 'To-Do List' : 'Collection'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
       {/* Back to Top Button */}
       <div className='container py-4 text-center'>
          <button 
            className='btn btn-outline-warning btn-lg'
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <i className="fas fa-arrow-up me-2"></i>Back to Top
          </button>
        </div>
    </div>
  );
}

export default SharedView;

