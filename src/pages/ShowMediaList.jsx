import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';

import YearFilter from "../components/YearFilter";
import CardsContainer from "../components/CardsContainer";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, KeyboardSensor, DragOverlay } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import TierTitle from "../components/TierTitle";
import TagFilter from "../components/TagFilter";
import SearchBar from "../components/SearchBar";
import useSwipe from "../useSwipe.tsx";
import ShareLinkModal from "../components/ShareLinkModal";

const constants = require('../constants');
const theme = require('../theme');

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

  // Sort each tier by orderIndex to maintain reordering
  Object.keys(data).forEach(tier => {
    data[tier].sort((a, b) => {
      const ai = (typeof a.orderIndex === 'number') ? a.orderIndex : Number.MAX_SAFE_INTEGER;
      const bi = (typeof b.orderIndex === 'number') ? b.orderIndex : Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      // Fallback to title if orderIndex is the same
      const at = a.title || '';
      const bt = b.title || '';
      return at.localeCompare(bt);
    });
  });

  // Change TagsList Dynamically
  var tags_list = []
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
  setSearchChanged(false);
  return data;
}

function toCapitalNotation(inputString) {
  return inputString
    .split(' ') // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
}

function getTruncatedTitle(mediaType, toDoString) {
  // Handle special case for "to-do" to display as "To-Do"
  const displayToDoString = toDoString === 'to-do' ? 'To-Do' : toCapitalNotation(toDoString);
  
  const fullTitle = `${toCapitalNotation(mediaType)} ${displayToDoString} Tier List`;
  const shortTitle = `${toCapitalNotation(mediaType)} ${displayToDoString}`;
  
  // If the full title is longer than 20 characters, use the short version
  if (fullTitle.length > 20) {
    return shortTitle;
  }
  
  return fullTitle;
}

function ShowMediaList({user, setUserChanged, toDo, newType, selectedTags, setSelectedTags, filteredData, setFilteredData}) {
  
  const location = useLocation();

  // Calculate dynamic width for mobile settings dropdown
  const calculateMobileSettingsDropdownWidth = () => {
    // Calculate width for each option, accounting for icons
    const options = [
      { text: 'Bullets By Tier', hasIcon: false },
      { text: 'Bullets By Year', hasIcon: false },
      { text: 'Download CSV', hasIcon: true },
      { text: 'Delete Type', hasIcon: false },
      { text: 'Set As Home Page', hasIcon: true }
    ];
    
    // Find the option that would take the most space
    const widths = options.map(option => {
      let width = option.text.length * 6 + 24; // base text width + padding
      if (option.hasIcon) {
        width += 30; // add space for icon (emoji is wider than single char)
      }
      return width;
    });
    
    const maxWidth = Math.max(...widths);
    
    // Add small buffer and ensure minimum width
    return Math.max(maxWidth, 100);
  };

  // Calculate dynamic width for desktop settings dropdown
  const calculateDesktopSettingsDropdownWidth = () => {
    // Calculate width for each option, accounting for icons
    const options = [
      { text: 'Bullets By Tier', hasIcon: false },
      { text: 'Bullets By Year', hasIcon: false },
      { text: 'Download CSV', hasIcon: true },
      { text: 'Delete Type', hasIcon: false },
      { text: 'Set As Home Page', hasIcon: true }
    ];
    
    // Find the option that would take the most space
    const widths = options.map(option => {
      let width = option.text.length * 7 + 32; // base text width + padding
      if (option.hasIcon) {
        width += 30; // add space for icon (emoji is wider than single char)
      }
      return width;
    });
    
    const maxWidth = Math.max(...widths);
    
    // Add small buffer and ensure minimum width
    return Math.max(maxWidth, 120);
  };
  
  // Set CSS custom properties for dynamic settings dropdown widths
  useEffect(() => {
    const mobileSettingsDropdownWidth = calculateMobileSettingsDropdownWidth();
    const desktopSettingsDropdownWidth = calculateDesktopSettingsDropdownWidth();
    
    document.documentElement.style.setProperty('--mobile-settings-dropdown-width', `${mobileSettingsDropdownWidth}px`);
    document.documentElement.style.setProperty('--desktop-settings-dropdown-width', `${desktopSettingsDropdownWidth}px`);
  }, []);

  // Read tags from URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tagsParam = urlParams.get('tags');
    
    if (tagsParam) {
      // Parse tags from URL and convert to tag objects
      const tagLabels = tagsParam.split(',');
      const urlTags = tagLabels.map(label => ({ label, value: label }));
      setSelectedTags(urlTags);
      

    } else if (selectedTags.length > 0) {
      // Clear tags if no URL params but we have selected tags
      setSelectedTags([]);
    }
  }, [location.search, selectedTags.length, setSelectedTags]);

  // Data
  const [tierData, setTierData] = useState();
  const { mediaType } = useParams();
  const tiers = ["S", "A", "B", "C", "D", "F"];
  const mediaTypeLoc = user ? (newType ? user.newTypes[mediaType] : user[mediaType]) : null;
  
  // Clear tags when media type changes (navigating to different media type)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tagsParam = urlParams.get('tags');
    
    if (tagsParam) {
    }
  }, [mediaType, location.search]); // This will run when mediaType changes

  // Filters = also includes selectedTags param
  const [firstYear, setFirstYear] = useState('');
  const [lastYear, setLastYear] = useState('');
  const [possibleYears, setPossibleYears] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [searchChanged, setSearchChanged] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  // Modes
  const [firstLoad, setFirstLoad] = useState(true);
  const [exportMode, setExportMode] = useState(false);
  const [dataByYear, setDataByYear] = useState({});
  const [toDoState, setToDoState] = useState(toDo);
  const [toDoString, setToDoString] = useState(toDo ? 'to-do' : 'collection');
  const [tierVariable, setTierVariable] = useState(toDo ? 'todoTiers' : 'collectionTiers')
  const navigate = useNavigate();

  // Local ordering state mirrors filteredData for reorders
  const [localByTier, setLocalByTier] = useState();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [existingShareData, setExistingShareData] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15, // Require 15px movement before drag starts (increased for better click handling)
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if(firstLoad)
    {
      // console.log('firstloading')
      axios
      .get(constants['SERVER_URL'] + '/api/media/' + mediaType + '/' + toDoString)
      .then((res) => {
        // console.log("GET /api/media/type/" + toDoString, res)
        setFirstYear('');
        setLastYear('');
        var tiers = {
          S: [],
          A: [],
          B: [],
          C: [],
          D: [],
          F: [],
        };
        var possible_years = new Set();
        var all_tags = [];
        // iterate through all Data
        res.data.media.forEach(m => {
          tiers[m.tier].push(m);
          possible_years.add(m.year);
        });
        res.data.uniqueTags.forEach((t, index) => {
          all_tags.push({value:index, label:t});
        });
        setAllTags(all_tags);
        setTierData(tiers);
        setPossibleYears(Array.from(possible_years).sort((a, b) => a - b));
        setSearchQuery('');
        setFirstLoad(false);
        setSearchChanged(true);
      })
      .catch((err) => {
        console.log(err);
        // If authentication fails, redirect to login
        if (err.response && err.response.status === 401) {
          navigate('/');
        }
      });
    }
  }, [firstLoad, mediaType, toDoString, navigate]);

  // Reset firstLoad when mediaType changes
  useEffect(() => {
    setFirstLoad(true);
    setTierData(null); // Clear previous data
    setFilteredData(null);
  }, [mediaType, setFilteredData]);

  // Filtering - wrapped in useEffect to avoid setState during render
  useEffect(() => {
    if(tierData && (searchChanged === undefined || searchChanged === true)) {
      const data = filterData(tierData, firstYear, lastYear, allTags, selectedTags, setSuggestedTags, setSearchChanged, searchQuery);
      setFilteredData(data);
      setLocalByTier(data);
    }
  }, [tierData, searchChanged, firstYear, lastYear, allTags, selectedTags, searchQuery, setFilteredData]);

  function switchToDo() {
    const newToDoState = !toDoState;
    setToDoState(newToDoState);
    const newToDoString = newToDoState ? 'to-do' : 'collection';
    setToDoString(newToDoString);
    setTierVariable(newToDoState ? 'todoTiers' : 'collectionTiers')
    setFirstLoad(true);
    
    // Preserve selected tags when switching lists
    let newUrl = `/${mediaType}/${newToDoString}`;
    if (selectedTags && selectedTags.length > 0) {
      const tagLabels = selectedTags.map(tag => tag.label).join(',');
      newUrl += `?tags=${tagLabels}`;
    }
    
    navigate(newUrl);
  }
  function exportByYear() {
    var temp = {};
    Object.keys(filteredData).forEach(tier => {
      filteredData[tier].forEach(item => {
        if (temp[item.year]) {
          temp[item.year].push(item);
        } else {
          temp[item.year] = [item];
        }
      })
    });
    setDataByYear(temp);
    setExportMode("By-Year");
  }
  function onDeleteClick() {
    axios
      .delete(constants['SERVER_URL'] + `/api/media/${mediaType}`)
      .then((res) => {
        console.log('Deleted all records of', mediaType);
        setUserChanged(true);
        navigate(`/`);
      })
      .catch((err) => {
        window.alert('Error form ShowMediaList_deleteClick')
        console.log(err);
      });
  };

  function handleDeleteConfirm() {
    onDeleteClick();
    setShowDeleteModal(false);
  };
  function exportToCsv() {
    const flatListData = filteredData ? Object.values(filteredData).reduce((acc, val) => acc.concat(val), []) : [];
    
    // Create CSV content with proper escaping
    const csvHeader = "Title,Year,Tier,Tags,Description,ToDo,Type\n";
    const csvRows = flatListData.map(obj => {
      // Helper to escape CSV fields (wrap in quotes if contains comma, quote, or newline)
      const escapeCsvField = (field) => {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };

      const tagsString = Array.isArray(obj.tags) ? obj.tags.join('|') : obj.tags;
      
      return [
        obj.title,
        obj.year,
        obj.tier,
        tagsString,
        obj.description,
        obj.toDo,
        obj.mediaType
      ].map(escapeCsvField).join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${mediaType}-${toDoString}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const currentHomePage = user?.customizations?.homePage;
  const isCurrentHomePage = currentHomePage === `${mediaType}/${toDoString}`;
  
  function setAsHomePage() {
    if (isCurrentHomePage) return;
    const newHomePage = `${mediaType}/${toDoString}`;
    axios.put(constants['SERVER_URL'] + '/api/user/customizations', { homePage: newHomePage })
      .then(res => {
          setUserChanged(true); 
      })
      .catch(err => {
          console.error(err);
          window.alert('Error setting home page');
      });
  }

  function onSwipeLeft() {
    if(toDo) {
      switchToDo();
    }
  }
  
  function onSwipeRight() {
    if(!toDo) {
      switchToDo();
    }
  }

  // removed unused helper

  const [activeId, setActiveId] = useState(null);
  
  const swipeHandlers = useSwipe({ 
    onSwipedLeft: onSwipeLeft, 
    onSwipedRight: onSwipeRight,
    disabled: activeId !== null // Re-enable the disabled check to prevent swipes during drag
  });

  function onDragStart(event) {
    setActiveId(event.active.id);
  }



  function onDragEnd(event) {
    const { active, over } = event;
    if (!active || !over || !localByTier) return;
    
    setActiveId(null);
    
    const activeId = active.id;
    const overId = over.id;

    // Check if dropping on an edge (moving between tiers)
    if (overId && typeof overId === 'string' && (overId.includes('-top') || overId.includes('-bottom'))) {
      const targetTier = overId.split('-')[1]; // Extract tier from "tier-X-top" or "tier-X-bottom"
      
      // Find source tier
      let sourceTier = null;
      let sourceIndex = -1;
      
      for (const tier of Object.keys(localByTier)) {
        const index = localByTier[tier].findIndex(item => item.ID === activeId);
        if (index !== -1) {
          sourceTier = tier;
          sourceIndex = index;
          break;
        }
      }
      
      if (sourceTier && sourceTier !== targetTier) {
        // Remove from source tier
        const updatedSourceTier = [...localByTier[sourceTier]];
        const [movedItem] = updatedSourceTier.splice(sourceIndex, 1);
        
        console.log('Moving card between tiers (edge drop):', { 
          from: sourceTier, 
          to: targetTier, 
          cardTitle: movedItem.title,
          cardId: activeId 
        });
        
        // Check if the moved item belongs to the current list type
        const itemToDo = movedItem.toDo === true;
        const currentListToDo = toDoState === true;
        
        if (itemToDo !== currentListToDo) {
          console.log('Preventing cross-list edge drop:', { 
            itemToDo, 
            currentListToDo, 
            itemTitle: movedItem.title 
          });
          // Don't allow moving items between to-do and collection lists
          return;
        }
        
        // Add to target tier
        const updatedTargetTier = [...(localByTier[targetTier] || [])];
        updatedTargetTier.push(movedItem);
        
        // Update local state
        const newLocalByTier = {
          ...localByTier,
          [sourceTier]: updatedSourceTier,
          [targetTier]: updatedTargetTier
        };
        
        setLocalByTier(newLocalByTier);
        
        // Update backend
        axios
          .put(constants['SERVER_URL'] + `/api/media/${mediaType}/${activeId}`, { 
            tier: targetTier
          })
          .catch((err) => console.log('Error updating tier via edge drop:', err));
      }
      
      return; // Exit early for edge drops
    }

    // Find source tier and index
    let sourceTier = null;
    let sourceIndex = -1;
    for (const t of Object.keys(localByTier)) {
      const idx = (localByTier[t] || []).findIndex(x => x.ID === activeId);
      if (idx !== -1) { sourceTier = t; sourceIndex = idx; break; }
    }
    if (!sourceTier) return;

    // Determine destination tier and index
    let destTier = null;
    let destIndex = -1;

    // Check if dropping on a tier container
    if (overId && typeof overId === 'string' && overId.startsWith('tier:')) {
      destTier = overId.split(':')[1];
      
      // Default to end of tier for edge drops
      destIndex = (localByTier[destTier] || []).length;
    } else {
      // Check if dropping on a card
      for (const t of Object.keys(localByTier)) {
        const idx = (localByTier[t] || []).findIndex(x => x.ID === overId);
        if (idx !== -1) { 
          destTier = t; 
          destIndex = idx; 
          break; 
        }
      }
    }

    // If no destination found, keep item in place
    if (!destTier) return;

    // Same tier reordering
    if (sourceTier === destTier) {
      const updatedList = arrayMove(localByTier[sourceTier] || [], sourceIndex, destIndex);
      const updated = { ...localByTier, [sourceTier]: updatedList };
      setLocalByTier(updated);
      
      // Persist intra-tier ordering
      const orderedIds = updatedList.map(m => m.ID);
      axios
        .put(constants['SERVER_URL'] + `/api/media/${mediaType}/${toDoString}/${sourceTier}/reorder`, { orderedIds })
        .catch(err => console.log('Error persisting intra-tier order:', err));
      return;
    }

    // Cross-tier move - but only within the same list type (to-do vs collection)
    const fromList = [...(localByTier[sourceTier] || [])];
    const toList = [...(localByTier[destTier] || [])];
    const [dragged] = fromList.splice(sourceIndex, 1);
    
    // Check if the dragged item belongs to the current list type
    const itemToDo = dragged.toDo === true;
    const currentListToDo = toDoState === true;
    
    if (itemToDo !== currentListToDo) {
      console.log('Preventing cross-list move:', { 
        itemToDo, 
        currentListToDo, 
        itemTitle: dragged.title 
      });
      // Don't allow moving items between to-do and collection lists
      return;
    }
    
    console.log('Moving card between tiers:', { 
      from: sourceTier, 
      to: destTier, 
      cardTitle: dragged.title,
      cardId: activeId 
    });
    
    const updatedDragged = { ...dragged, tier: destTier };
    const clamped = Math.max(0, Math.min(destIndex, toList.length));
    toList.splice(clamped, 0, updatedDragged);
    
    const updated = { 
      ...localByTier, 
      [sourceTier]: fromList, 
      [destTier]: toList 
    };
    
    setLocalByTier(updated);
    setFilteredData(updated);
    
    // Update backend
    axios
      .put(constants['SERVER_URL'] + `/api/media/${mediaType}/${activeId}`, { 
        tier: destTier, 
        tags: updatedDragged.tags || [], 
        orderIndex: clamped 
      })
      .catch((err) => console.log('Error updating tier via drag:', err));
  }

  // Check for existing share link when modal opens or mediaType changes
  useEffect(() => {
    if (user && mediaType) {
      axios.get(constants['SERVER_URL'] + `/api/share/status/${mediaType}`)
        .then(res => {
          if (res.data.exists) {
            setExistingShareData(res.data);
          } else {
            setExistingShareData(null);
          }
        })
        .catch(err => console.error('Error checking share status:', err));
    }
  }, [user, mediaType, showShareModal, toDoState]);

  // Redirect to login if user is not authenticated
  if (!user) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 text-center">
              <div className="card shadow-soft border-0">
                <div className="card-body p-5">
                  <h3 className="text-danger mb-3">Session Expired</h3>
                  <p className="text-muted mb-4">Your session has expired. Please log in again to continue.</p>
                  <Link to="/" className="btn btn-primary px-4 py-2">Go to Login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if(exportMode) {
    return (
      <div className='container'>
        <div className='pt-4'>
          <div className='row'>
          
          <div className='col-md-2'></div>
          <div className='col-md-8'>
            <h1 className='display-4 fw-bold text-center text-white mb-4'>
              {getTruncatedTitle(mediaType, toDoString)}
            </h1>
          </div>
          <div className='col-md-2 d-flex justify-content-center align-items-center'>     
            <button
              onClick={setExportMode.bind(null, false)}
              className='btn btn-outline-primary btn-lg'
              >
              Go Back
            </button>
          </div>
        </div>
        <hr className='border-white opacity-25 my-4'></hr>
        <div className='row'>
          <div className='col-md-2'></div>
          <div className='col-md-10'>
            <div className='fw-semibold fs-5 mb-4'>Filters</div>
            <div className='mb-3'>
              <div className='mb-2'>Start Year = {firstYear ? firstYear : possibleYears[0]}</div>
              <div className='mb-2'>End Year = {lastYear}</div>
              <div className='mb-2'>Tags = {selectedTags && selectedTags[0] ? selectedTags.map((item) => item['label']).join(', ') : 'No Tags Selected'}</div>
            </div>
            <div className='mt-4'>

            {exportMode === 'By-Tier' && (
              Object.keys(filteredData).map((tier) => {
                return <ul key={tier}><b>{mediaTypeLoc && mediaTypeLoc[tierVariable] ? mediaTypeLoc[tierVariable][tier] : tier}</b>
                  {filteredData[tier].map((item) => (
                    <li key={item.ID}>{item.title}, {item.year}</li>
                  ))}
                </ul>;
              })
            )}

            {exportMode === 'By-Year' && (
              Object.keys(dataByYear).map((year) => {
                return <ul key={year}><b>{year}</b>
                  {dataByYear[year].map((item) => (
                    <li key={item.ID}>{item.title}, {item.tier}</li>
                  ))}
                </ul>;
              })
            )}
            </div>
          </div>
        </div>
        </div>
      </div>
    )
  } else if(user && !firstLoad && filteredData) {
  return (
    <>
    <div 
      className='ShowMediaList'
      style={{backgroundColor: theme.colors.background.primary}}
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
          {/* Mobile buttons row with title - only visible on mobile */}
          <div className='row d-md-none mb-3 align-items-center'>
            <div className='col-3 d-flex justify-content-start'>
              <button 
                className='btn btn-warning btn-xs'
                onClick={switchToDo}
                style={{ 
                  whiteSpace: 'nowrap', 
                  fontSize: '0.65rem', 
                  padding: '0.3rem 0.4rem',
                  minWidth: 'fit-content',
                  width: '100%',
                  maxWidth: '100%'
                }}
                >
                <i className="fas fa-exchange-alt me-1"></i>{toDoState ? toCapitalNotation('collection') : 'To-Do'}
              </button>
            </div>
            <div className='col-6 text-center'>
              <h1 className='fw-light text-white mb-0' style={{ 
                fontFamily: 'Roboto, sans-serif', 
                fontSize: 'clamp(18px, 5vw, 28px)',
                minFontSize: '18px',
                whiteSpace: 'nowrap'
              }}>
                {getTruncatedTitle(mediaType, toDoString)}
              </h1>
            </div>
            <div className='col-3 d-flex justify-content-end'>
              <div className="dropdown">
                <button className="btn btn-warning btn-xs dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ 
                  fontSize: '0.65rem', 
                  padding: '0.3rem 0.4rem',
                  minWidth: 'fit-content',
                  width: '100%',
                  maxWidth: '100%'
                }}>
                  Settings
                </button>
                <ul className="dropdown-menu mobile-settings-dropdown" style={{ minWidth: `${calculateMobileSettingsDropdownWidth()}px`, width: `${calculateMobileSettingsDropdownWidth()}px` }}>
                  <li><button className="dropdown-item py-1" style={{fontSize: '0.75rem'}} onClick={() => { setShowShareModal(true); }}>
                      {existingShareData ? 'Unshare / Edit Link' : 'Share List'} <i className={`fas ${existingShareData ? 'fa-pen' : 'fa-share-alt'}`}></i>
                  </button></li>
                  <li><button className="dropdown-item py-1" style={{fontSize: '0.75rem'}} onClick={() => setExportMode('By-Tier')}>Bullets By Tier</button></li>
                  <li><button className="dropdown-item py-1" style={{fontSize: '0.75rem'}} onClick={() => exportByYear()}>Bullets By Year</button></li>
                  <li><button className="dropdown-item py-1" style={{fontSize: '0.75rem'}} onClick={() => exportToCsv()}>Download CSV <i className="fa-solid fa-download"></i></button></li>
                  <li>
                    <button 
                      className={`dropdown-item py-1 ${isCurrentHomePage ? 'text-success' : ''}`} 
                      style={{fontSize: '0.75rem'}} 
                      onClick={() => setAsHomePage()}
                      disabled={isCurrentHomePage}
                    >
                      {isCurrentHomePage ? 'Current Home Page' : 'Set As Home Page'} 
                      {isCurrentHomePage && <i className="fas fa-check ms-1"></i>}
                    </button>
                  </li>
                  {newType && (
                    <li><button className="dropdown-item py-1 text-danger" style={{fontSize: '0.75rem'}} onClick={() => setShowDeleteModal(true)}>
                      <i className="fas fa-trash me-1"></i>Delete Type
                    </button></li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Desktop layout - hidden on mobile */}
          <div className='row align-items-center mb-3 d-none d-md-flex'>
            <div className='col-md-2 text-center'>
              <button 
                className='btn btn-warning btn-lg'
                onClick={switchToDo}
                style={{ whiteSpace: 'nowrap' }}
                >
                <i className="fas fa-exchange-alt me-2"></i>{toDoState ? toCapitalNotation('collection') : 'To-Do'}
              </button>
            </div>
            <div className='col-md-8 text-center'>
              <h1 className='fw-light text-white mb-0' style={{ 
                fontFamily: 'Roboto, sans-serif', 
                fontSize: 'clamp(28px, 4.5vw, 52px)',
                minFontSize: '28px'
              }}>
                {getTruncatedTitle(mediaType, toDoString)}
              </h1>
            </div>
            <div className='col-md-2 text-center'>
              <div className="dropdown">
                <button className="btn btn-warning btn-lg dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Settings
                </button>
                <ul className="dropdown-menu desktop-settings-dropdown" style={{ minWidth: `${calculateDesktopSettingsDropdownWidth()}px` }}>
                  <li><button className="dropdown-item py-1" style={{fontSize: '1rem'}} onClick={() => { setShowShareModal(true); }}>
                      {existingShareData ? 'Unshare / Edit Link' : 'Share List'} <i className={`fas ${existingShareData ? 'fa-pen' : 'fa-share-alt'}`}></i>
                  </button></li>
                  <li><button className="dropdown-item py-1" style={{fontSize: '1rem'}} onClick={() => setExportMode('By-Tier')}>Bullets By Tier</button></li>
                  <li><button className="dropdown-item py-1" style={{fontSize: '1rem'}} onClick={() => exportByYear()}>Bullets By Year</button></li>
                  <li><button className="dropdown-item py-1" style={{fontSize: '1rem'}} onClick={() => exportToCsv()}>Download CSV <i className="fa-solid fa-download"></i></button></li>
                  <li>
                    <button 
                      className={`dropdown-item py-1 ${isCurrentHomePage ? 'text-success' : ''}`} 
                      style={{fontSize: '1rem'}} 
                      onClick={() => setAsHomePage()}
                      disabled={isCurrentHomePage}
                    >
                      {isCurrentHomePage ? 'Current Home Page' : 'Set As Home Page'} 
                      {isCurrentHomePage && <i className="fas fa-check ms-1"></i>}
                    </button>
                  </li>
                  {newType && (
                    <li><button className="dropdown-item py-1 text-danger" style={{fontSize: '1rem'}} onClick={() => setShowDeleteModal(true)}>
                      <i className="fas fa-trash me-1"></i>Delete Type
                    </button></li>
                  )}
                </ul>
              </div>
            </div>
          </div>




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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        disabled={false}
      >
        {tiers.map((item, index) => (
          <div className='tier-container' key={item} id={`tier-${item}`}>
            <TierTitle title={mediaTypeLoc && mediaTypeLoc[tierVariable] ? mediaTypeLoc[tierVariable][item] : item} mediaType={mediaType} group={toDoString} tier={item} setUserChanged={setUserChanged} newType={newType}></TierTitle>
            <CardsContainer
              tier={item}
              items={(localByTier && localByTier[item]) ? localByTier[item] : filteredData[item]}
            />
            {index < tiers.length - 1 && <hr />}
          </div>
        ))}
        
        <DragOverlay>
          {activeId ? (
            <div style={{
              transform: 'rotate(5deg)',
              opacity: 0.8,
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              border: '2px dashed rgba(59, 130, 246, 0.8)',
              borderRadius: '8px',
              padding: '8px',
              minWidth: '140px',
              maxWidth: '150px'
            }}>
              {(() => {
                // Find the active item from all tiers
                for (const tier of Object.keys(filteredData)) {
                  const item = filteredData[tier].find(item => item.ID === activeId);
                  if (item) {
                    return (
                      <div className="text-center">
                        <div className="title-clamp fw-semibold text-white mb-1" style={{ fontSize: '14px' }}>
                          {item.title}
                        </div>
                        <div className="text-muted" style={{ fontSize: '12px' }}>
                          {item.year}
                        </div>
                      </div>
                    );
                  }
                }
                return null;
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
        
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog" style={{
            marginTop: '5vh',
            marginBottom: 'auto'
          }}>
            <div className="modal-content shadow-strong">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-semibold text-dark">Delete Confirmation</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p className="fw-semibold text-dark">
                  Are you sure you want to delete the entirety of your To-Do List & Collection from ~{mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}~?
                </p>
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary btn-sm d-md-none" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="btn btn-danger btn-sm d-md-none" onClick={handleDeleteConfirm}>Yes, Delete Everything</button>
                <button type="button" className="btn btn-secondary btn-lg d-none d-md-inline-block" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="btn btn-danger btn-lg d-none d-md-inline-block" onClick={handleDeleteConfirm}>Yes, Delete Everything</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareLinkModal
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        mediaType={mediaType}
        toDoState={toDoState}
        onUpdate={() => {
          // Refresh existing share data when modal updates
          if (user && mediaType) {
            axios.get(constants['SERVER_URL'] + `/api/share/status/${mediaType}`)
              .then(res => {
                if (res.data.exists) {
                  setExistingShareData(res.data);
                } else {
                  setExistingShareData(null);
                }
              })
              .catch(err => console.error('Error checking share status:', err));
          }
        }}
      />
    </>

  );
  }
}

export default ShowMediaList;