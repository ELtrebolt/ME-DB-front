import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import CardsContainer from "../components/CardsContainer";
import TimeFilter from "../components/TimeFilter";
import ExtraFilters from "../components/ExtraFilters";
import SearchBar from "../components/SearchBar";
import TagFilter from "../components/TagFilter";
import useSwipe from "../hooks/useSwipe.tsx";
import { toCapitalNotation, filterData } from "../helpers";

import TierTitle from "../components/TierTitle";

const constants = require('../constants');
const theme = require('../../styling/theme');

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
  const [selectedTiers, setSelectedTiers] = useState(constants.STANDARD_TIERS);
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
    setSelectedTiers(constants.STANDARD_TIERS);
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

  const tiers = constants.STANDARD_TIERS;

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
            setCollectionTierTitles(constants.DEFAULT_TIER_LABELS);
          }
          
          if(res.data.todoTierTitles && Object.keys(res.data.todoTierTitles).length > 0) {
            setTodoTierTitles(res.data.todoTierTitles);
          } else {
            setTodoTierTitles({ S: 'S Tier', A: 'A Tier', B: 'B Tier', C: 'C Tier', D: 'D Tier', F: 'F Tier' });
          }
          
          // Set initial tier titles based on the initial view
          if (res.data.shareConfig.todo && !res.data.shareConfig.collection) {
            setTierTitles(res.data.todoTierTitles || constants.DEFAULT_TIER_LABELS);
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
      ...constants.EMPTY_TIERS_OBJ
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

