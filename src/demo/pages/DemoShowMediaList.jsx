import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import TimeFilter from "../../app/components/TimeFilter";
import ExtraFilters from "../../app/components/ExtraFilters";
import CardsContainer from "../../app/components/CardsContainer";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, KeyboardSensor, DragOverlay } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import DemoTierTitle from "../components/DemoTierTitle";
import TagFilter from "../../app/components/TagFilter";
import DemoSearchBar from "../components/DemoSearchBar";
import useSwipe from "../../app/hooks/useSwipe.tsx";
import { useDemoData } from "../hooks/useDemoData";

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

function DemoShowMediaList({ toDo }) {
  const { mediaType } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Use demo data hook
  const { 
    data, 
    loading, 
    uniqueTags, 
    getMediaByTier,
    reorderInTier, 
    moveToTier 
  } = useDemoData(mediaType);

  // Download as CSV function (same as normal app)
  const exportToCsv = () => {
    if (!filteredData) return;
    
    const rows = [['Tier', 'Title', 'Year', 'Tags', 'Description']];
    
    Object.keys(filteredData).forEach(tier => {
      filteredData[tier].forEach(item => {
        rows.push([
          tier,
          item.title || '',
          item.year ? new Date(item.year).getFullYear() : '',
          (item.tags || []).join('; '),
          (item.description || '').replace(/"/g, '""')
        ]);
      });
    });
    
    const csvContent = rows.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${mediaType}_${toDoString}_tierlist.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const [tierData, setTierData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const [toDoState, setToDoState] = useState(toDo);
  const [toDoString, setToDoString] = useState(toDo ? 'to-do' : 'collection');
  const [localByTier, setLocalByTier] = useState(null);
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
  const [selectedTags, setSelectedTags] = useState([]);

  const tiers = ["S", "A", "B", "C", "D", "F"];

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

  // URL params sync effect
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
        if (pathParts.length >= 4) urlParams.set('from', pathParts[3]);
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

  // Load data from localStorage hook
  useEffect(() => {
    if (!loading && data && firstLoad) {
      const tiersObj = getMediaByTier(toDoState);
      setAllTags(uniqueTags.map((t, i) => ({ value: i, label: t })));
      setTierData(tiersObj);
      setSearchQuery('');
      setFirstLoad(false);
      setSearchChanged(true);
    }
  }, [loading, data, firstLoad, toDoState, getMediaByTier, uniqueTags]);

  // Reset when media type changes
  useEffect(() => {
    setFirstLoad(true);
    setTierData(null);
    setFilteredData(null);
  }, [mediaType]);

  // Apply filters
  useEffect(() => {
    if(tierData && (searchChanged === undefined || searchChanged === true)) {
      const filteredResult = filterData(tierData, timePeriod, startDate, endDate, allTags, selectedTags, tagLogic, setSuggestedTags, setSearchChanged, searchQuery, searchScope, selectedTiers, sortOrder);
      setFilteredData(filteredResult);
      setLocalByTier(filteredResult);
    }
  }, [tierData, searchChanged, timePeriod, startDate, endDate, allTags, selectedTags, tagLogic, searchQuery, searchScope, selectedTiers, sortOrder]);

  function switchToDo() {
    const newToDoState = !toDoState;
    const newToDoString = newToDoState ? 'to-do' : 'collection';
    setToDoState(newToDoState);
    setToDoString(newToDoString);
    setFirstLoad(true);
    let newUrl = `/demo/${mediaType}/${newToDoString}`;
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.toString()) newUrl += `?${urlParams.toString()}`;
    navigate(newUrl);
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
    const activeIdValue = active.id;
    const overId = over.id;

    if (overId && typeof overId === 'string' && (overId.includes('-top') || overId.includes('-bottom'))) {
      const targetTier = overId.split('-')[1];
      let sourceTier = null, sourceIndex = -1;
      for (const tier of Object.keys(localByTier)) {
        const idx = localByTier[tier].findIndex(item => item.ID === activeIdValue);
        if (idx !== -1) { sourceTier = tier; sourceIndex = idx; break; }
      }
      if (sourceTier && sourceTier !== targetTier) {
        const updatedSourceTier = [...localByTier[sourceTier]];
        const [movedItem] = updatedSourceTier.splice(sourceIndex, 1);
        if (movedItem.toDo !== (toDoString === 'to-do')) return;
        const updatedTargetTier = [...(localByTier[targetTier] || [])];
        updatedTargetTier.push({ ...movedItem, tier: targetTier });
        setLocalByTier({ ...localByTier, [sourceTier]: updatedSourceTier, [targetTier]: updatedTargetTier });
        // Save to localStorage
        moveToTier(activeIdValue, targetTier, updatedTargetTier.length - 1);
      }
      return;
    }

    let sourceTier = null, sourceIndex = -1;
    for (const t of Object.keys(localByTier)) {
      const idx = localByTier[t].findIndex(x => x.ID === activeIdValue);
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
      // Save reorder to localStorage
      reorderInTier(sourceTier, toDoState, updatedList.map(m => m.ID));
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
      // Save to localStorage
      moveToTier(activeIdValue, destTier, destIndex);
    }
  };

  // Handle card click to navigate to detail page
  const handleCardClick = useCallback((media) => {
    navigate(`/demo/${mediaType}/${media.ID}`);
  }, [navigate, mediaType]);

  if (loading || firstLoad || !filteredData) {
    return <div className="text-center p-5 text-white">Loading...</div>;
  }

  return (
    <>
      <div className='ShowMediaList' style={{backgroundColor: theme.colors.background.primary}} {...swipeHandlers} onTouchStart={swipeHandlers.onTouchStart} onMouseDown={swipeHandlers.onMouseDown}>
        <div className='container pt-4'>
          <div className='row d-md-none mb-3 align-items-center' style={{ margin: '0 -8px' }}>
            <div className='col-auto px-1'>
              <button className='btn btn-warning btn-xs' onClick={switchToDo} style={{ whiteSpace: 'nowrap' }}>
                <i className="fas fa-exchange-alt me-1"></i>{toDoState ? 'Collection' : 'To-Do'}
              </button>
            </div>
            <div className='col text-center px-1'>
              <h1 className='fw-light text-white mb-0' style={{ fontSize: 'clamp(16px, 4.5vw, 24px)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {getTruncatedTitle(mediaType, toDoString)}
              </h1>
            </div>
            <div className='col-auto px-1'>
              <div className="dropdown">
                <button className="btn btn-warning btn-xs dropdown-toggle" data-bs-toggle="dropdown">Settings</button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><button className="dropdown-item py-1" style={{fontSize: '0.75rem'}} onClick={exportToCsv}>Download CSV</button></li>
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
                  <li><button className="dropdown-item py-1" onClick={exportToCsv}>Download CSV</button></li>
                </ul>
              </div>
            </div>
          </div>

          <div className='row g-1 g-md-2 mb-2 mb-md-3' style={{flexWrap: 'nowrap'}}>
            <div className='col-4'><TimeFilter timePeriod={timePeriod} setTimePeriod={setTimePeriod} setSearchChanged={setSearchChanged}/></div>
            <div className='col-4 text-center'>
              <DemoSearchBar mediaType={mediaType} allMedia={filteredData} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setSearchChanged={setSearchChanged}/>
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
              <DemoTierTitle mediaType={mediaType} group={toDoString} tier={item}/>
              <CardsContainer tier={item} items={(localByTier && localByTier[item]) ? localByTier[item] : filteredData[item]} onCardClick={handleCardClick}/>
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
    </>
  );
}

export default DemoShowMediaList;
