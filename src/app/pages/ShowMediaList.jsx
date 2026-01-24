import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';

import TimeFilter from "../components/TimeFilter";
import ExtraFilters from "../components/ExtraFilters";
import CardsContainer from "../components/CardsContainer";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, KeyboardSensor, DragOverlay } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import TierTitle from "../components/TierTitle";
import TagFilter from "../components/TagFilter";
import SearchBar from "../components/SearchBar";
import useSwipe from "../hooks/useSwipe.tsx";
import ShareLinkModal from "../components/ShareLinkModal";

const constants = require('../constants');
const theme = require('../../styling/theme');

function filterData(tierData, timePeriod, startDate, endDate, allTags, selectedTags, tagLogic, setSuggestedTags, setSearchChanged, searchQuery, searchScope, selectedTiers, sortOrder) {
  var data = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
  };

  if (!tierData) return data;

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

  const filteredArray = [];
  for(const tier of Object.keys(tierData)) {
    if (selectedTiers && !selectedTiers.includes(tier)) continue;

    for(const m of tierData[tier]) {
      if(searchQuery !== '') {
        const query = searchQuery.toLowerCase();
        let match = false;
        if (searchScope.includes('title') && m.title.toLowerCase().includes(query)) match = true;
        if (!match && searchScope.includes('description') && m.description && m.description.toLowerCase().includes(query)) match = true;
        if (!match && searchScope.includes('tags') && m.tags && m.tags.some(t => t.toLowerCase().includes(query))) match = true;
        if(!match) continue;
      }

      if(selectedTags && selectedTags.length > 0) {
        if(!m.tags || m.tags.length === 0) continue;
        const tagLabels = selectedTags.map(t => t.label);
        if (tagLogic === 'AND') {
          if (!tagLabels.every(label => m.tags.includes(label))) continue;
        } else {
          if (!tagLabels.some(label => m.tags.includes(label))) continue;
        }
      }

      if (!isInDateRange(m.year)) continue;
      filteredArray.push(m);
    }
  }

  filteredArray.forEach(m => {
    data[m.tier].push(m);
  });

  Object.keys(data).forEach(tier => {
    data[tier].sort((a, b) => {
      if (sortOrder === 'dateNewest') return new Date(b.year) - new Date(a.year);
      if (sortOrder === 'dateOldest') return new Date(a.year) - new Date(b.year);
      if (sortOrder === 'titleAZ') return a.title.localeCompare(b.title);
      const ai = (typeof a.orderIndex === 'number') ? a.orderIndex : Number.MAX_SAFE_INTEGER;
      const bi = (typeof b.orderIndex === 'number') ? b.orderIndex : Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      return (a.title || '').localeCompare(b.title || '');
    });
  });

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

function toCapitalNotation(inputString) {
  return inputString.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

function getTruncatedTitle(mediaType, toDoString) {
  const displayToDoString = toDoString === 'to-do' ? 'To-Do' : toCapitalNotation(toDoString);
  const fullTitle = `${toCapitalNotation(mediaType)} ${displayToDoString} Tier List`;
  return fullTitle.length > 20 ? `${toCapitalNotation(mediaType)} ${displayToDoString}` : fullTitle;
}

function ShowMediaList({user, setUserChanged, toDo, newType, selectedTags, setSelectedTags, filteredData, setFilteredData}) {
  const { mediaType } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [tierData, setTierData] = useState(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const [toDoState, setToDoState] = useState(toDo);
  const [toDoString, setToDoString] = useState(toDo ? 'to-do' : 'collection');
  const [tierVariable, setTierVariable] = useState(toDo ? 'todoTiers' : 'collectionTiers');
  const [localByTier, setLocalByTier] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [existingShareData, setExistingShareData] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const [timePeriod, setTimePeriod] = useState(() => new URLSearchParams(location.search).get('timePeriod') || 'all');
  const [startDate, setStartDate] = useState(() => new URLSearchParams(location.search).get('startDate') || '');
  const [endDate, setEndDate] = useState(() => new URLSearchParams(location.search).get('endDate') || '');
  const [tagLogic, setTagLogic] = useState(() => new URLSearchParams(location.search).get('tagLogic') || 'AND');
  const [searchScope, setSearchScope] = useState(['title']);
  const [selectedTiers, setSelectedTiers] = useState(["S", "A", "B", "C", "D", "F"]);
  const [sortOrder, setSortOrder] = useState('default');
  const [allTags, setAllTags] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [searchChanged, setSearchChanged] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExtraFilters, setShowExtraFilters] = useState(false);

  const tiers = ["S", "A", "B", "C", "D", "F"];
  const mediaTypeLoc = user ? (newType ? user.newTypes[mediaType] : user[mediaType]) : null;

  const calculateMobileSettingsDropdownWidth = () => {
    const options = [{ text: 'Download CSV', hasIcon: true }, { text: 'Delete Type', hasIcon: false }, { text: 'Set As Home Page', hasIcon: true }];
    const widths = options.map(o => (o.text.length * 6 + 24) + (o.hasIcon ? 30 : 0));
    return Math.max(Math.max(...widths), 100);
  };

  const calculateDesktopSettingsDropdownWidth = () => {
    const options = [{ text: 'Download CSV', hasIcon: true }, { text: 'Delete Type', hasIcon: false }, { text: 'Set As Home Page', hasIcon: true }];
    const widths = options.map(o => (o.text.length * 7 + 32) + (o.hasIcon ? 30 : 0));
    return Math.max(Math.max(...widths), 120);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--mobile-settings-dropdown-width', `${calculateMobileSettingsDropdownWidth()}px`);
    document.documentElement.style.setProperty('--desktop-settings-dropdown-width', `${calculateDesktopSettingsDropdownWidth()}px`);
  }, []);

  useEffect(() => {
    if (timePeriod === 'custom') setShowExtraFilters(true);
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
    const urlParams = new URLSearchParams(location.search);
    urlParams.delete('tags');
    urlParams.delete('tagLogic');
    urlParams.delete('timePeriod');
    urlParams.delete('startDate');
    urlParams.delete('endDate');
    urlParams.delete('from');
    navigate(`${location.pathname}?${urlParams.toString()}`, { replace: true });
  };

  const toggleLogic = () => {
    const newLogic = tagLogic === 'AND' ? 'OR' : 'AND';
    setTagLogic(newLogic);
    setSearchChanged(true);
  };

  useEffect(() => {
    if (firstLoad) return;
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

    const currentTagsParam = urlParams.get('tags');
    if (selectedTags && selectedTags.length > 0) {
      const tagLabels = selectedTags.map(tag => tag.label).join(',');
      if (currentTagsParam !== tagLabels) {
        urlParams.set('tags', tagLabels);
        changed = true;
        const pathParts = location.pathname.split('/');
        if (pathParts.length >= 3) urlParams.set('from', pathParts[2]);
      }
    } else if (currentTagsParam) {
      urlParams.delete('tags');
      urlParams.delete('from');
      changed = true;
    }

    if (changed) navigate(`${location.pathname}?${urlParams.toString()}`, { replace: true });
  }, [timePeriod, startDate, endDate, tagLogic, selectedTags, location.pathname, location.search, navigate, firstLoad]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 15 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if(firstLoad) {
      axios.get(constants['SERVER_URL'] + '/api/media/' + mediaType + '/' + toDoString)
      .then((res) => {
        const tiersObj = { S: [], A: [], B: [], C: [], D: [], F: [] };
        res.data.media.forEach(m => { if(tiersObj[m.tier]) tiersObj[m.tier].push(m); });
        setAllTags(res.data.uniqueTags.map((t, i) => ({ value: i, label: t })));
        setTierData(tiersObj);
        setSearchQuery('');
        setFirstLoad(false);
        setSearchChanged(true);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) navigate('/');
      });
    }
  }, [firstLoad, mediaType, toDoString, navigate]);

  useEffect(() => {
    setFirstLoad(true);
    setTierData(null);
    setFilteredData(null);
  }, [mediaType, setFilteredData]);

  useEffect(() => {
    if(tierData && (searchChanged === undefined || searchChanged === true)) {
      const data = filterData(tierData, timePeriod, startDate, endDate, allTags, selectedTags, tagLogic, setSuggestedTags, setSearchChanged, searchQuery, searchScope, selectedTiers, sortOrder);
      setFilteredData(data);
      setLocalByTier(data);
    }
  }, [tierData, searchChanged, timePeriod, startDate, endDate, allTags, selectedTags, tagLogic, searchQuery, searchScope, selectedTiers, sortOrder, setFilteredData]);

  function switchToDo() {
    const newToDoState = !toDoState;
    const newToDoString = newToDoState ? 'to-do' : 'collection';
    setToDoState(newToDoState);
    setToDoString(newToDoString);
    setTierVariable(newToDoState ? 'todoTiers' : 'collectionTiers');
    setFirstLoad(true);
    let newUrl = `/${mediaType}/${newToDoString}`;
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.toString()) newUrl += `?${urlParams.toString()}`;
    navigate(newUrl);
  }

  function exportToCsv() {
    const flatListData = filteredData ? Object.values(filteredData).flat() : [];
    const csvHeader = "Title,Year,Tier,Tags,Description,ToDo,Type\n";
    const escapeCsv = (f) => (f === null || f === undefined) ? '' : (String(f).match(/[,"\n]/) ? `"${String(f).replace(/"/g, '""')}"` : String(f));
    const csvRows = flatListData.map(obj => [obj.title, obj.year ? new Date(obj.year).toISOString().split('T')[0] : '', obj.tier, Array.isArray(obj.tags) ? obj.tags.join('|') : obj.tags, obj.description, obj.toDo, obj.mediaType].map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${mediaType}-${toDoString}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function setAsHomePage() {
    const newHomePage = `${mediaType}/${toDoString}`;
    axios.put(constants['SERVER_URL'] + '/api/user/customizations', { homePage: newHomePage })
      .then(() => setUserChanged(true))
      .catch(err => console.error('Error setting home page:', err));
  }

  function onDeleteClick() {
    axios.delete(constants['SERVER_URL'] + `/api/media/${mediaType}`)
      .then(() => {
        setUserChanged(true);
        navigate('/');
      })
      .catch(err => {
        window.alert('Error deleting media type');
        console.error(err);
      });
  }

  const swipeHandlers = useSwipe({ 
    onSwipedLeft: () => { if(toDoString === 'collection') switchToDo(); }, 
    onSwipedRight: () => { if(toDoString === 'to-do') switchToDo(); },
    disabled: activeId !== null 
  });

  const onDragStart = (e) => setActiveId(e.active.id);
  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over || !localByTier) return;
    setActiveId(null);
    const activeId = active.id;
    const overId = over.id;

    if (overId && typeof overId === 'string' && (overId.includes('-top') || overId.includes('-bottom'))) {
      const targetTier = overId.split('-')[1];
      let sourceTier = null, sourceIndex = -1;
      for (const tier of Object.keys(localByTier)) {
        const idx = localByTier[tier].findIndex(item => item.ID === activeId);
        if (idx !== -1) { sourceTier = tier; sourceIndex = idx; break; }
      }
      if (sourceTier && sourceTier !== targetTier) {
        const updatedSourceTier = [...localByTier[sourceTier]];
        const [movedItem] = updatedSourceTier.splice(sourceIndex, 1);
        if (movedItem.toDo !== (toDoString === 'to-do')) return;
        const updatedTargetTier = [...(localByTier[targetTier] || [])];
        updatedTargetTier.push({ ...movedItem, tier: targetTier });
        setLocalByTier({ ...localByTier, [sourceTier]: updatedSourceTier, [targetTier]: updatedTargetTier });
        axios.put(constants['SERVER_URL'] + `/api/media/${mediaType}/${activeId}`, { tier: targetTier }).catch(err => console.log(err));
      }
      return;
    }

    let sourceTier = null, sourceIndex = -1;
    for (const t of Object.keys(localByTier)) {
      const idx = localByTier[t].findIndex(x => x.ID === activeId);
      if (idx !== -1) { sourceTier = t; sourceIndex = idx; break; }
    }
    if (!sourceTier) return;

    let destTier = null, destIndex = -1;
    if (overId && typeof overId === 'string' && overId.startsWith('tier:')) {
      destTier = overId.split(':')[1];
      destIndex = (localByTier[destTier] || []).length;
    } else {
      for (const t of Object.keys(localByTier)) {
        const idx = localByTier[t].findIndex(x => x.ID === overId);
        if (idx !== -1) { destTier = t; destIndex = idx; break; }
      }
    }
    if (!destTier) return;

    if (sourceTier === destTier) {
      const updatedList = arrayMove(localByTier[sourceTier] || [], sourceIndex, destIndex);
      setLocalByTier({ ...localByTier, [sourceTier]: updatedList });
      axios.put(constants['SERVER_URL'] + `/api/media/${mediaType}/${toDoString}/${sourceTier}/reorder`, { orderedIds: updatedList.map(m => m.ID) }).catch(err => console.log(err));
    } else {
      const fromList = [...(localByTier[sourceTier] || [])];
      const toList = [...(localByTier[destTier] || [])];
      const [dragged] = fromList.splice(sourceIndex, 1);
      if (dragged.toDo !== (toDoString === 'to-do')) return;
      const updatedDragged = { ...dragged, tier: destTier };
      toList.splice(Math.max(0, Math.min(destIndex, toList.length)), 0, updatedDragged);
      const updated = { ...localByTier, [sourceTier]: fromList, [destTier]: toList };
      setLocalByTier(updated);
      setFilteredData(updated);
      axios.put(constants['SERVER_URL'] + `/api/media/${mediaType}/${activeId}`, { tier: destTier, orderIndex: destIndex }).catch(err => console.log(err));
    }
  };

  useEffect(() => {
    if (user && mediaType) {
      axios.get(constants['SERVER_URL'] + `/api/share/status/${mediaType}`)
        .then(res => setExistingShareData(res.data.exists ? res.data : null))
        .catch(err => console.error(err));
    }
  }, [user, mediaType, showShareModal, toDoString]);

  if (!user) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center">
        <div className="container text-center">
          <div className="card shadow-soft border-0 p-5">
            <h3 className="text-danger mb-3">Session Expired</h3>
            <p className="text-muted mb-4">Your session has expired. Please log in again.</p>
            <Link to="/" className="btn btn-primary px-4">Go to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  if (firstLoad || !filteredData) return <div className="text-center p-5 text-white">Loading...</div>;

  return (
    <>
      <div className='ShowMediaList' style={{backgroundColor: theme.colors.background.primary}} {...swipeHandlers} onTouchStart={swipeHandlers.onTouchStart} onMouseDown={swipeHandlers.onMouseDown}>
        <div className='container pt-4'>
          <div className='row d-md-none mb-3 align-items-center'>
            <div className='col-3'><button className='btn btn-warning btn-xs w-100' onClick={switchToDo}><i className="fas fa-exchange-alt me-1"></i>{toDoState ? toCapitalNotation('collection') : 'To-Do'}</button></div>
            <div className='col-6 text-center'><h1 className='fw-light text-white mb-0' style={{ fontSize: 'clamp(18px, 5vw, 28px)' }}>{getTruncatedTitle(mediaType, toDoString)}</h1></div>
            <div className='col-3 text-end'>
              <div className="dropdown">
                <button className="btn btn-warning btn-xs dropdown-toggle" data-bs-toggle="dropdown">Settings</button>
                <ul className="dropdown-menu">
                  <li><button className="dropdown-item py-1" style={{fontSize: '0.75rem'}} onClick={() => setShowShareModal(true)}>{existingShareData ? 'Unshare / Edit' : 'Share List'}</button></li>
                  <li><button className="dropdown-item py-1" style={{fontSize: '0.75rem'}} onClick={exportToCsv}>Download CSV</button></li>
                  <li><button className="dropdown-item py-1" onClick={setAsHomePage} disabled={user?.customizations?.homePage === `${mediaType}/${toDoString}`}>Set As Home Page</button></li>
                  {newType && <li><button className="dropdown-item py-1 text-danger" onClick={() => setShowDeleteModal(true)}>Delete Type</button></li>}
                </ul>
              </div>
            </div>
          </div>

          <div className='row align-items-center mb-3 d-none d-md-flex'>
            <div className='col-md-2 text-center'><button className='btn btn-warning btn-lg' onClick={switchToDo}><i className="fas fa-exchange-alt me-2"></i>{toDoState ? toCapitalNotation('collection') : 'To-Do'}</button></div>
            <div className='col-md-8 text-center'><h1 className='fw-light text-white mb-0' style={{ fontSize: 'clamp(28px, 4.5vw, 52px)' }}>{getTruncatedTitle(mediaType, toDoString)}</h1></div>
            <div className='col-md-2 text-center'>
              <div className="dropdown">
                <button className="btn btn-warning btn-lg dropdown-toggle" data-bs-toggle="dropdown">Settings</button>
                <ul className="dropdown-menu">
                  <li><button className="dropdown-item py-1" onClick={() => setShowShareModal(true)}>{existingShareData ? 'Unshare / Edit' : 'Share List'}</button></li>
                  <li><button className="dropdown-item py-1" onClick={exportToCsv}>Download CSV</button></li>
                  <li><button className="dropdown-item py-1" onClick={setAsHomePage} disabled={user?.customizations?.homePage === `${mediaType}/${toDoString}`}>Set As Home Page</button></li>
                  {newType && <li><button className="dropdown-item py-1 text-danger" onClick={() => setShowDeleteModal(true)}>Delete Type</button></li>}
                </ul>
              </div>
            </div>
          </div>

          <div className='row g-1 g-md-2 mb-2 mb-md-3' style={{flexWrap: 'nowrap'}}>
            <div className='col-4'><TimeFilter timePeriod={timePeriod} setTimePeriod={setTimePeriod} setSearchChanged={setSearchChanged}/></div>
            <div className='col-4 text-center'>
              <SearchBar mediaType={mediaType} allMedia={filteredData} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setSearchChanged={setSearchChanged}/>
              <button className="btn btn-link btn-sm text-warning p-0" onClick={() => setShowExtraFilters(!showExtraFilters)} style={{ fontSize: '0.7rem', textDecoration: 'none' }}>{showExtraFilters ? 'Hide Advanced' : 'More Filters...'}</button>
            </div>
            <div className='col-4'><TagFilter suggestedTags={suggestedTags} selected={selectedTags} setSelected={setSelectedTags} setSearchChanged={setSearchChanged} tagLogic={tagLogic} setTagLogic={setTagLogic}/></div>
          </div>

          {showExtraFilters && (
            <ExtraFilters sortOrder={sortOrder} setSortOrder={setSortOrder} searchScope={searchScope} setSearchScope={setSearchScope} onClearFilters={clearFilters} setSearchChanged={setSearchChanged} timePeriod={timePeriod} setTimePeriod={setTimePeriod} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} tagLogic={tagLogic} setTagLogic={setTagLogic} onLogicToggle={toggleLogic} />
          )}
        </div>

        <hr />

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          {tiers.map((item, index) => (
            <div className='tier-container' key={item} id={`tier-${item}`}>
              <TierTitle title={mediaTypeLoc && mediaTypeLoc[tierVariable] ? mediaTypeLoc[tierVariable][item] : item} mediaType={mediaType} group={toDoString} tier={item} setUserChanged={setUserChanged} newType={newType}/>
              <CardsContainer tier={item} items={(localByTier && localByTier[item]) ? localByTier[item] : filteredData[item]}/>
              {index < tiers.length - 1 && <hr />}
            </div>
          ))}
          <DragOverlay>
            {activeId && (() => {
              for (const t of Object.keys(filteredData)) {
                const item = filteredData[t].find(i => i.ID === activeId);
                if (item) return <div className="text-center p-2 bg-primary-transparent border-dashed rounded text-white" style={{transform: 'rotate(5deg)', opacity: 0.8, minWidth: '140px'}}><div className="fw-semibold">{item.title}</div><div style={{fontSize: '12px'}}>{item.year ? new Date(item.year).getFullYear() : '-'}</div></div>;
              }
              return null;
            })()}
          </DragOverlay>
        </DndContext>

        <div className='container py-4 text-center'><button className='btn btn-outline-warning btn-lg' onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><i className="fas fa-arrow-up me-2"></i>Back to Top</button></div>
      </div>

      {showDeleteModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog" style={{marginTop: '5vh'}}>
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Delete Confirmation</h5><button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button></div>
              <div className="modal-body"><p>Are you sure you want to delete all records of {mediaType}?</p></div>
              <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button><button className="btn btn-danger" onClick={() => { onDeleteClick(); setShowDeleteModal(false); }}>Yes, Delete Everything</button></div>
            </div>
          </div>
        </div>
      )}

      <ShareLinkModal show={showShareModal} onClose={() => setShowShareModal(false)} mediaType={mediaType} toDoState={toDoString === 'to-do'} username={user?.username} onUpdate={() => axios.get(constants['SERVER_URL'] + `/api/share/status/${mediaType}`).then(res => setExistingShareData(res.data.exists ? res.data : null))}/>
    </>
  );
}

export default ShowMediaList;
