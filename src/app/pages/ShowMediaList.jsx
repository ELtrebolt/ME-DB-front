import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';

import CardsContainer from "../components/CardsContainer";
import FiltersBar from "../components/filters/FiltersBar";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, KeyboardSensor, DragOverlay } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import TierTitle from "../components/TierTitle";
import useSwipe from "../hooks/useSwipe.tsx";
import ShareLinkModal from "../components/modals/ShareLinkModal";
import EditListModal from "../components/modals/EditListModal";
import Modal from "../components/modals/Modal";
import { filterData, toCapitalNotation, getTruncatedTitle, calculateDropdownWidth, createEmptyTiersObject } from "../helpers";
import { useMediaData } from "../hooks/useMediaData";

const constants = require('../constants');
const theme = require('../../styling/theme');

/**
 * Renders description text; if it matches "text = url", the url is shown as a blue clickable link.
 * @param {string} description - Full description (e.g. "Top 30 from IMDB = imdb.com/chart/top/")
 * @param {number} [maxLen] - Optional max length; if exceeded, description is truncated with "..."
 * @returns {React.ReactNode} - Plain string or fragment with text + link
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

function ShowMediaList({
  user, 
  setUserChanged, 
  toDo, 
  newType, 
  selectedTags, 
  setSelectedTags, 
  filteredData, 
  setFilteredData,
  dataSource = 'api',
  basePath = '',
  onGetMediaByTier,
  onReorderInTier,
  onMoveToTier,
  tierTitleOverrides = {},
  onTierTitleSave = undefined,
  onDescriptionSave = undefined,
  descriptionOverride = undefined
}) {
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
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [existingShareData, setExistingShareData] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const [timePeriod, setTimePeriod] = useState(() => new URLSearchParams(location.search).get('timePeriod') || 'all');
  const [startDate, setStartDate] = useState(() => new URLSearchParams(location.search).get('startDate') || '');
  const [endDate, setEndDate] = useState(() => new URLSearchParams(location.search).get('endDate') || '');
  const [tagLogic, setTagLogic] = useState(() => new URLSearchParams(location.search).get('tagLogic') || 'AND');
  const [searchScope, setSearchScope] = useState(['title']);
  const [selectedTiers, setSelectedTiers] = useState(constants.STANDARD_TIERS);
  const [sortOrder, setSortOrder] = useState('default');
  const [allTags, setAllTags] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [searchChanged, setSearchChanged] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExtraFilters, setShowExtraFilters] = useState(false);

  const tiers = constants.STANDARD_TIERS;
  const mediaTypeLoc = user ? (newType ? user.newTypes[mediaType] : user[mediaType]) : null;
  
  // Use useMediaData for tags in demo mode
  const { uniqueTags: demoUniqueTags } = useMediaData(mediaType, dataSource);

  useEffect(() => {
    const options = [{ text: 'Edit List', hasIcon: false }, { text: 'Download CSV', hasIcon: true }, { text: 'Delete Type', hasIcon: false }];
    const mobileWidth = calculateDropdownWidth(options, { variant: 'mobile', minWidth: 100, iconWidth: 30 });
    const desktopWidth = calculateDropdownWidth(options, { variant: 'desktop', minWidth: 120, iconWidth: 30 });
    document.documentElement.style.setProperty('--mobile-settings-dropdown-width', `${mobileWidth}px`);
    document.documentElement.style.setProperty('--desktop-settings-dropdown-width', `${desktopWidth}px`);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 15 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if(firstLoad) {
      if (dataSource === 'demo' && onGetMediaByTier) {
        // Demo mode: use callback
        const tiersObj = onGetMediaByTier(toDoState);
        setAllTags(demoUniqueTags.map((t, i) => ({ value: i, label: t })));
        setTierData(tiersObj);
        setSearchQuery('');
        setFirstLoad(false);
        setSearchChanged(true);
      } else if (dataSource === 'api') {
        // API mode: use axios
        axios.get(constants['SERVER_URL'] + '/api/media/' + mediaType + '/' + toDoString)
        .then((res) => {
          const tiersObj = createEmptyTiersObject();
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
    }
  }, [firstLoad, mediaType, toDoString, navigate, dataSource, onGetMediaByTier, toDoState, demoUniqueTags]);

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
    let newUrl = `${basePath}/${mediaType}/${newToDoString}`;
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

  function handleEditListSave({ description, setAsHome }) {
    if (dataSource === 'demo' && onDescriptionSave) {
      // Demo mode: use callback
      onDescriptionSave(description);
    } else if (dataSource === 'api') {
      const requests = [];
      const currentHomePage = `${mediaType}/${toDoString}`;
      const isCurrentlyHomePage = user?.customizations?.homePage === currentHomePage;
      
      // Save description
      requests.push(
        axios.put(constants['SERVER_URL'] + '/api/user/customizations', {
          description,
          mediaType,
          listType: toDoString,
          isNewType: newType
        })
      );
      
      // Set or clear home page based on checkbox state
      if (setAsHome && !isCurrentlyHomePage) {
        // Set as home page
        requests.push(
          axios.put(constants['SERVER_URL'] + '/api/user/customizations', { homePage: currentHomePage })
        );
      } else if (!setAsHome && isCurrentlyHomePage) {
        // Clear home page
        requests.push(
          axios.put(constants['SERVER_URL'] + '/api/user/customizations', { homePage: '' })
        );
      }
      
      Promise.all(requests)
        .then(() => setUserChanged(true))
        .catch(err => console.error('Error saving list settings:', err));
    }
  }

  // Get current description from user object or override (for demo)
  function getCurrentDescription() {
    // Check for demo override first
    if (descriptionOverride !== undefined) {
      return descriptionOverride;
    }
    if (!user) return '';
    const descriptionField = toDoString === 'to-do' ? 'todoDescription' : 'collectionDescription';
    if (newType && user.newTypes && user.newTypes[mediaType]) {
      return user.newTypes[mediaType][descriptionField] || '';
    }
    if (user[mediaType]) {
      return user[mediaType][descriptionField] || '';
    }
    return '';
  }

  function onDeleteClick() {
    if (dataSource === 'api') {
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
        if (dataSource === 'demo' && onMoveToTier) {
          onMoveToTier(activeId, targetTier, updatedTargetTier.length - 1);
        } else if (dataSource === 'api') {
          axios.put(constants['SERVER_URL'] + `/api/media/${mediaType}/${activeId}`, { tier: targetTier }).catch(err => console.log(err));
        }
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
      if (dataSource === 'demo' && onReorderInTier) {
        onReorderInTier(sourceTier, toDoState, updatedList.map(m => m.ID));
      } else if (dataSource === 'api') {
        axios.put(constants['SERVER_URL'] + `/api/media/${mediaType}/${toDoString}/${sourceTier}/reorder`, { orderedIds: updatedList.map(m => m.ID) }).catch(err => console.log(err));
      }
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
      if (dataSource === 'demo' && onMoveToTier) {
        onMoveToTier(activeId, destTier, destIndex);
      } else if (dataSource === 'api') {
        axios.put(constants['SERVER_URL'] + `/api/media/${mediaType}/${activeId}`, { tier: destTier, orderIndex: destIndex }).catch(err => console.log(err));
      }
    }
  };

  useEffect(() => {
    if (dataSource === 'api' && user && mediaType) {
      axios.get(constants['SERVER_URL'] + `/api/share/status/${mediaType}`)
        .then(res => setExistingShareData(res.data.exists ? res.data : null))
        .catch(err => console.error(err));
    }
  }, [user, mediaType, showShareModal, toDoString, dataSource]);

  if (dataSource === 'api' && !user) {
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
              {getCurrentDescription() && (
                <p className='text-white-50 mb-0 mt-1' style={{ fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {renderDescriptionWithLink(getCurrentDescription(), 36)}
                </p>
              )}
            </div>
            <div className='col-auto px-1'>
              <div className="dropdown">
                <button className="btn btn-warning btn-xs dropdown-toggle" data-bs-toggle="dropdown">Settings</button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><button className="dropdown-item py-1" style={{fontSize: '0.75rem'}} onClick={() => setShowEditListModal(true)}>Edit List</button></li>
                  {dataSource === 'api' && <li><button className="dropdown-item py-1" style={{fontSize: '0.75rem'}} onClick={() => setShowShareModal(true)}>{existingShareData ? 'Unshare / Edit' : 'Share List'}</button></li>}
                  <li><button className="dropdown-item py-1" style={{fontSize: '0.75rem'}} onClick={exportToCsv}>Download CSV</button></li>
                  {dataSource === 'api' && newType && <li><button className="dropdown-item py-1 text-danger" style={{fontSize: '0.75rem'}} onClick={() => setShowDeleteModal(true)}>Delete Type</button></li>}
                </ul>
              </div>
            </div>
          </div>

          <div className='row align-items-center mb-3 d-none d-md-flex'>
            <div className='col-md-2 text-center'><button className='btn btn-warning btn-lg' onClick={switchToDo}><i className="fas fa-exchange-alt me-2"></i>{toDoState ? toCapitalNotation('collection') : 'To-Do'}</button></div>
            <div className='col-md-8 text-center'>
              <h1 className='fw-light text-white mb-0' style={{ fontSize: 'clamp(28px, 4.5vw, 52px)' }}>{getTruncatedTitle(mediaType, toDoString)}</h1>
              {getCurrentDescription() && (
                <p className='text-white-50 mb-0 mt-1' style={{ fontSize: '0.85rem' }}>
                  {renderDescriptionWithLink(getCurrentDescription(), 120)}
                </p>
              )}
            </div>
            <div className='col-md-2 text-center'>
              <div className="dropdown">
                <button className="btn btn-warning btn-lg dropdown-toggle" data-bs-toggle="dropdown">Settings</button>
                <ul className="dropdown-menu">
                  <li><button className="dropdown-item py-1" onClick={() => setShowEditListModal(true)}>Edit List</button></li>
                  {dataSource === 'api' && <li><button className="dropdown-item py-1" onClick={() => setShowShareModal(true)}>{existingShareData ? 'Unshare / Edit' : 'Share List'}</button></li>}
                  <li><button className="dropdown-item py-1" onClick={exportToCsv}>Download CSV</button></li>
                  {dataSource === 'api' && newType && <li><button className="dropdown-item py-1 text-danger" onClick={() => setShowDeleteModal(true)}>Delete Type</button></li>}
                </ul>
              </div>
            </div>
          </div>

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
            skipUrlSync={firstLoad}
          />
        </div>

        <hr />

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          {tiers.map((item, index) => {
            // Determine the title: use override (if provided), custom from user (api), or default
            const overrideKey = `${mediaType}-${toDoString}-${item}`;
            let tierTitle = item; // Default to just the tier letter
            if (tierTitleOverrides && tierTitleOverrides[overrideKey]) {
              tierTitle = tierTitleOverrides[overrideKey];
            } else if (mediaTypeLoc && mediaTypeLoc[tierVariable] && mediaTypeLoc[tierVariable][item]) {
              tierTitle = mediaTypeLoc[tierVariable][item];
            } else if (dataSource === 'demo') {
              tierTitle = `${item} - Double Click to Edit`;
            }
            const handleTierTitleSave = onTierTitleSave
              ? (newTitle) => onTierTitleSave(item, newTitle)
              : undefined;

            return (
              <div className='tier-container' key={item} id={`tier-${item}`}>
                <TierTitle 
                  title={tierTitle} 
                  mediaType={mediaType} 
                  group={toDoString} 
                  tier={item} 
                  setUserChanged={setUserChanged} 
                  newType={newType}
                  basePath={basePath}
                  onSave={handleTierTitleSave}
                />
                <CardsContainer tier={item} items={(localByTier && localByTier[item]) ? localByTier[item] : filteredData[item]} basePath={basePath}/>
                {index < tiers.length - 1 && <hr />}
              </div>
            );
          })}
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

      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Confirmation"
        alignTop={true}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => { onDeleteClick(); setShowDeleteModal(false); }}>Yes, Delete Everything</button>
          </>
        }
      >
        <p>Are you sure you want to delete all records of {mediaType}?</p>
      </Modal>

      {dataSource === 'api' && <ShareLinkModal show={showShareModal} onClose={() => setShowShareModal(false)} mediaType={mediaType} toDoState={toDoString === 'to-do'} username={user?.username} onUpdate={() => axios.get(constants['SERVER_URL'] + `/api/share/status/${mediaType}`).then(res => setExistingShareData(res.data.exists ? res.data : null))}/>}

      <EditListModal
        show={showEditListModal}
        setShow={setShowEditListModal}
        currentDescription={getCurrentDescription()}
        isHomePage={user?.customizations?.homePage === `${mediaType}/${toDoString}`}
        showHomePageOption={dataSource === 'api'}
        onSave={handleEditListSave}
      />
    </>
  );
}

export default ShowMediaList;
