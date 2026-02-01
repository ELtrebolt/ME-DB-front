import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

import CardsContainer from "../components/CardsContainer";
import FiltersBar from "../components/filters/FiltersBar";
import useSwipe from "../hooks/useSwipe.tsx";
import { toCapitalNotation, filterData, createEmptyTiersObject } from "../helpers";
import TierTitle from "../components/TierTitle";

const constants = require('../constants');
const theme = require('../../styling/theme');

/**
 * Renders description text; if it matches "text = url", the url is shown as a blue clickable link.
 */
function renderDescriptionWithLink(description, maxLen) {
  if (!description) return null;
  const truncated = maxLen && description.length > maxLen
    ? description.substring(0, maxLen) + '...'
    : description;
  const eqIndex = truncated.indexOf(' = ');
  if (eqIndex !== -1) {
    const afterEq = truncated.slice(eqIndex + 3);
    if (afterEq.length > 0 && !afterEq.includes('...')) {
      const text = truncated.slice(0, eqIndex);
      const href = afterEq.startsWith('http') ? afterEq : 'https://' + afterEq;
      return (
        <>
          {text}{' '}
          <a href={href} className="text-warning text-decoration-underline fw-semibold" target="_blank" rel="noopener noreferrer">
            {afterEq}
          </a>
        </>
      );
    }
  }
  return truncated;
}

function SharedView() {
  const { token, username, mediaType: urlMediaType } = useParams();
  
  const [firstLoad, setFirstLoad] = useState(true);
  const [error, setError] = useState(null);
  
  // Data (matching ShowMediaList pattern)
  const [tierData, setTierData] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [allMedia, setAllMedia] = useState([]); // Keep raw media for switching collection/todo
  const [shareConfig, setShareConfig] = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [tierTitles, setTierTitles] = useState({});
  const [collectionTierTitles, setCollectionTierTitles] = useState({});
  const [todoTierTitles, setTodoTierTitles] = useState({});
  const [collectionDescription, setCollectionDescription] = useState('');
  const [todoDescription, setTodoDescription] = useState('');
  
  // View State
  const [toDoState, setToDoState] = useState(false);
  const [filteredData, setFilteredData] = useState(null);
  
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
  
  // Build the basePath for card navigation
  const basePath = username ? `/user/${username}` : '';

  const tiers = constants.STANDARD_TIERS;

  // Helper to process media into tier structure
  const processMediaIntoTiers = (media, forToDo) => {
    const currentList = media.filter(m => m.toDo === forToDo);
    const tiersObj = createEmptyTiersObject();
    const tags = new Set();
    
    currentList.forEach(m => {
      if (tiersObj[m.tier]) tiersObj[m.tier].push(m);
      if (m.tags) m.tags.forEach(t => tags.add(t));
    });
    
    return { tiersObj, tags: Array.from(tags).map((t, i) => ({ value: i, label: t })) };
  };

  // Fetch Data (matching ShowMediaList pattern)
  useEffect(() => {
    if (!firstLoad) return;
    
    const fetchUrl = (username && urlMediaType) 
      ? `${constants['SERVER_URL']}/api/share/user/${username}/${urlMediaType}`
      : `${constants['SERVER_URL']}/api/share/${token}`;

    axios.get(fetchUrl)
      .then(res => {
        if (res.data.success) {
          const config = res.data.shareConfig;
          const initialToDo = config.todo && !config.collection;
          
          // Store raw media for view switching
          setAllMedia(res.data.media);
          setShareConfig(config);
          setMediaType(res.data.mediaType);
          setOwnerName(res.data.ownerName || 'User');
          
          // Set tier titles
          const collTitles = res.data.collectionTierTitles && Object.keys(res.data.collectionTierTitles).length > 0
            ? res.data.collectionTierTitles
            : constants.DEFAULT_TIER_LABELS;
          const todoTitles = res.data.todoTierTitles && Object.keys(res.data.todoTierTitles).length > 0
            ? res.data.todoTierTitles
            : constants.DEFAULT_TIER_LABELS;
          
          setCollectionTierTitles(collTitles);
          setTodoTierTitles(todoTitles);
          setTierTitles(initialToDo ? todoTitles : collTitles);
          setToDoState(initialToDo);
          
          // Set descriptions if they exist
          setCollectionDescription(res.data.collectionDescription || '');
          setTodoDescription(res.data.todoDescription || '');
          
          // Process into tiers (like ShowMediaList does on fetch)
          const { tiersObj, tags } = processMediaIntoTiers(res.data.media, initialToDo);
          setTierData(tiersObj);
          setAllTags(tags);
          
          setFirstLoad(false);
          setSearchChanged(true);
          setError(null);
        }
      })
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.error || 'Link invalid or expired');
        setFirstLoad(false);
      });
  }, [firstLoad, token, username, urlMediaType]);

  // Apply filters when tierData or filter state changes (matching ShowMediaList)
  useEffect(() => {
    if (tierData && (searchChanged === undefined || searchChanged === true)) {
      const data = filterData(tierData, timePeriod, startDate, endDate, allTags, selectedTags, tagLogic, setSuggestedTags, setSearchChanged, searchQuery, searchScope, selectedTiers, sortOrder);
      setFilteredData(data);
    }
  }, [tierData, searchChanged, timePeriod, startDate, endDate, allTags, selectedTags, tagLogic, searchQuery, searchScope, selectedTiers, sortOrder]);


  function switchToDo() {
    if (shareConfig.collection && shareConfig.todo) {
        const newToDoState = !toDoState;
        setToDoState(newToDoState);
        setTierTitles(newToDoState ? todoTierTitles : collectionTierTitles);
        
        // Reprocess media for new view (like ShowMediaList re-fetches)
        const { tiersObj, tags } = processMediaIntoTiers(allMedia, newToDoState);
        setTierData(tiersObj);
        setAllTags(tags);
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

  if (firstLoad || !filteredData) return <div className="text-white text-center pt-5">Loading...</div>;
  if (error) return <div className="text-danger text-center pt-5"><h3>{error}</h3></div>;

  const showSwitch = shareConfig.collection && shareConfig.todo;
  const currentDescription = toDoState ? todoDescription : collectionDescription;

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
      <style>{`
        .profile-link {
          transition: all 0.3s ease;
          display: inline-block;
        }
        .profile-link:hover {
          transform: scale(1.05);
          text-shadow: 0 0 8px rgba(255, 193, 7, 0.5);
        }
        .profile-link:hover i {
          animation: pulse 0.5s ease-in-out;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
      <div className='container'>
        <div className='pt-4'>
            {/* Header - Mobile */}
            <div className='d-md-none mb-3'>
                {showSwitch && (
                    <div className='d-flex justify-content-center mb-2'>
                        <button 
                            className='btn btn-warning btn-sm'
                            onClick={switchToDo}
                        >
                             {toDoState ? <>View Collection<i className="fas fa-chevron-right ms-1"></i></> : <><i className="fas fa-chevron-left me-1"></i>View To-Do</>}
                        </button>
                    </div>
                )}
                <div className='text-center'>
                    <h1 className='fw-light text-white mb-0' style={{ 
                        fontFamily: 'Roboto, sans-serif', 
                        fontSize: 'clamp(18px, 5vw, 28px)',
                    }}>
                        <Link to={`/user/${username}`} className="profile-link" style={{color: theme.colors.primary, textDecoration: 'none'}}><i className="fas fa-user me-1" style={{fontSize: '0.8em'}}></i>{ownerName}</Link> - {toCapitalNotation(mediaType)} {toDoState ? 'To-Do' : 'Collection'}
                    </h1>
                    {currentDescription && (
                      <p className='text-white-50 mb-0 mt-1' style={{ fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {renderDescriptionWithLink(currentDescription, 40)}
                      </p>
                    )}
                </div>
            </div>

            {/* Header - Desktop */}
            <div className='row align-items-center mb-3 d-none d-md-flex'>
                <div className='col-3 d-flex justify-content-start'>
                    {showSwitch && (
                        <button 
                            className='btn btn-warning btn-sm'
                            onClick={switchToDo}
                        >
                             {toDoState ? <>View Collection<i className="fas fa-chevron-right ms-1"></i></> : <><i className="fas fa-chevron-left me-1"></i>View To-Do</>}
                        </button>
                    )}
                </div>
                <div className='col-6 text-center'>
                    <h1 className='fw-light text-white mb-0' style={{ 
                        fontFamily: 'Roboto, sans-serif', 
                        fontSize: 'clamp(18px, 5vw, 36px)',
                    }}>
                        <Link to={`/user/${username}`} className="profile-link" style={{color: theme.colors.primary, textDecoration: 'none'}}><i className="fas fa-user me-2"></i>{ownerName}</Link> - {toCapitalNotation(mediaType)} {toDoState ? 'To-Do' : 'Collection'}
                    </h1>
                    {currentDescription && (
                      <p className='text-white-50 mb-0 mt-1' style={{ fontSize: '0.85rem' }}>
                        {renderDescriptionWithLink(currentDescription, 120)}
                      </p>
                    )}
                </div>
                <div className='col-3 d-flex justify-content-end'>
                    {/* Placeholder for balance */}
                </div>
            </div>

            {/* Filters */}
            <FiltersBar
              mediaType={mediaType}
              basePath={basePath}
              filteredData={filteredData}
              suggestedTags={suggestedTags}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              setSearchChanged={setSearchChanged}
              timePeriod={timePeriod}
              setTimePeriod={setTimePeriod}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              tagLogic={tagLogic}
              setTagLogic={setTagLogic}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchScope={searchScope}
              setSearchScope={setSearchScope}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              showExtraFilters={showExtraFilters}
              setShowExtraFilters={setShowExtraFilters}
              setSelectedTiers={setSelectedTiers}
            />
        </div>
      </div>

      <hr />

      {/* Tiers */}
      <div className='container'>
      {tiers.map((item, index) => (
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
              basePath={basePath}
              readOnly={true}
            />
            {index < tiers.length - 1 && <hr />}
          </div>
        ))}
      </div>
      
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

