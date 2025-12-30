import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import CardsContainer from "../components/CardsContainer";
import YearFilter from "../components/YearFilter";
import SearchBar from "../components/SearchBar";
import TagFilter from "../components/TagFilter";
import useSwipe from "../useSwipe.tsx";

import TierTitle from "../components/TierTitle";

const constants = require('../constants');

function toCapitalNotation(inputString) {
  if (!inputString) return '';
  return inputString
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function filterData(tierData, firstYear, lastYear, allTags, selectedTags, setSuggestedTags, setSearchChanged, searchQuery) {
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

  for(const tier of Object.keys(tierData)) {
    for(const m of tierData[tier]) {
      // Filter by SearchQuery
      if(searchQuery !== '') {
        if(!m.title.toLowerCase().includes(searchQuery)) {
          continue;
        }
      }
      // Filter by Tags
      if(selectedTags && selectedTags[0]) {
        if(m.tags) {
          for(const t of selectedTags) {
            if(!m.tags.includes(t['label'])) {
              break;
            }
            if(selectedTags[selectedTags.length-1] === t) {
              array.push(m);
            }
          }
        }
      } else {
        array.push(m);
      }
    }
  }
  // Filter by Years
  array.forEach(m => {
    if(firstYear && lastYear) {
      if(m.year >= firstYear && m.year <= lastYear) {
        data[m.tier].push(m);
      }
    } else if (firstYear && !lastYear) {
      if(m.year >= firstYear) {
        data[m.tier].push(m);
      }
    } else if (!firstYear && lastYear) {
      if(m.year <= lastYear) {
        data[m.tier].push(m);
      }
    } else {
      data[m.tier].push(m);
    }
  });

  // Sort each tier
  Object.keys(data).forEach(tier => {
    data[tier].sort((a, b) => {
      // Sort by orderIndex first, then title
      const ai = (typeof a.orderIndex === 'number') ? a.orderIndex : Number.MAX_SAFE_INTEGER;
      const bi = (typeof b.orderIndex === 'number') ? b.orderIndex : Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      const at = a.title || '';
      const bt = b.title || '';
      return at.localeCompare(bt);
    });
  });

  // Change TagsList Dynamically
  var tags_list = []
  if (allTags) {
      const allTagsList = allTags.map((item) => item['label']);
      var added_tags = new Set()
      Object.keys(data).forEach(tier => {
        data[tier].forEach(item => {
          if(item.tags) {
            item.tags.forEach(tag => {
              const foundIndex = allTagsList.indexOf(tag);
              const tagDict = { value: foundIndex, label: tag };
              if(foundIndex >= -1 && !added_tags.has(tag)) {
                tags_list.push(tagDict);
                added_tags.add(tag);
              }
            })
          }
        })
      })
      setSuggestedTags(tags_list);
  }
  setSearchChanged(false);
  return data;
}

function SharedView() {
  const { token } = useParams();
  
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
  const [firstYear, setFirstYear] = useState('');
  const [lastYear, setLastYear] = useState('');
  const [possibleYears, setPossibleYears] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchChanged, setSearchChanged] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal for card details
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const tiers = ["S", "A", "B", "C", "D", "F"];

  // Fetch Data
  useEffect(() => {
    axios.get(constants['SERVER_URL'] + `/api/share/${token}`)
      .then(res => {
        if (res.data.success) {
          console.log('Share data received:', res.data);
          setAllMedia(res.data.media);
          setShareConfig(res.data.shareConfig);
          setMediaType(res.data.mediaType);
          // Set only first name to be more privacy friendly
          const fullName = res.data.ownerName || 'User';
          setOwnerName(fullName.split(' ')[0]);
          
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
        }
      })
      .catch(err => {
        console.error(err);
        setError('Link invalid or expired');
        setIsLoading(false);
      });
  }, [token]);

  // Process Data into Tiers
  useEffect(() => {
    if (isLoading || !shareConfig) return;

    // 1. Filter by Collection vs Todo based on current view
    const currentList = allMedia.filter(m => m.toDo === toDoState);
    
    // 2. Extract filterable metadata (years, tags)
    var possible_years = new Set();
    var all_tags = new Set();
    
    currentList.forEach(m => {
      if (m.year) possible_years.add(m.year);
      if (m.tags) m.tags.forEach(t => all_tags.add(t));
    });

    setPossibleYears(Array.from(possible_years).sort((a, b) => a - b));

    // 3. Group by Tier
    var tierData = {
      S: [], A: [], B: [], C: [], D: [], F: []
    };
    currentList.forEach(m => {
        if(tierData[m.tier]) tierData[m.tier].push(m);
    });

    // 4. Apply Filters (Year, Tag, Search)
    if (searchChanged === undefined || searchChanged === true) {
        const data = filterData(tierData, firstYear, lastYear, Array.from(all_tags).map((t, i) => ({ value: i, label: t })), selectedTags, setSuggestedTags, setSearchChanged, searchQuery);
        setFilteredData(data);
    }
    
  }, [allMedia, toDoState, isLoading, shareConfig, searchChanged, firstYear, lastYear, selectedTags, searchQuery]);


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
  const listTitle = `${ownerName}'s ${toCapitalNotation(mediaType)} ${toDoState ? 'To-Do' : 'Collection'}`;

  return (
    <div 
      className='ShowMediaList' 
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
                        {listTitle}
                    </h1>
                </div>
                <div className='col-3 d-flex justify-content-end'>
                    {/* Placeholder for balance */}
                </div>
            </div>

            {/* Filters */}
            <div className='row g-1 g-md-2 mb-2 mb-md-3' style={{overflow: 'visible', position: 'relative', display: 'flex', flexWrap: 'nowrap'}}>
                <div className='col-lg-4 col-md-4 col-sm-4' style={{flex: '0 0 33.333333%', maxWidth: '33.333333%', overflow: 'visible', position: 'relative', paddingLeft: '0.25rem', paddingRight: '0.25rem'}}>
                    <YearFilter possible_years={possibleYears} firstYear={firstYear} lastYear={lastYear} setFirstYear={setFirstYear} setLastYear={setLastYear} setSearchChanged={setSearchChanged}/>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-4' style={{flex: '0 0 33.333333%', maxWidth: '33.333333%', overflow: 'visible', position: 'relative', paddingLeft: '0.25rem', paddingRight: '0.25rem'}}>
                    <SearchBar mediaType={mediaType} allMedia={filteredData} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setSearchChanged={setSearchChanged}></SearchBar>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-4' style={{overflow: 'visible', position: 'relative', flex: '0 0 33.333333%', maxWidth: '33.333333%', paddingLeft: '0.25rem', paddingRight: '0.25rem'}}>
                    <TagFilter suggestedTags={suggestedTags} selected={selectedTags} setSelected={setSelectedTags} setSearchChanged={setSearchChanged}></TagFilter>
                </div>
            </div>
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
                        <td className='fw-semibold py-2 shared-view-label'>Year</td>
                        <td className='py-2 fw-medium shared-view-value'>{selectedMedia.year || '-'}</td>
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

