import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import DeleteModal from "../components/modals/DeleteModal";
import TagMaker from "../components/TagMaker";
import useSwipe from "../hooks/useSwipe.tsx";
import DuplicateModal from "../components/modals/DuplicateModal";
import { toCapitalNotation } from "../helpers";
const constants = require('../constants');
const theme = require('../../styling/theme');

function ShowMediaDetails({
  user, 
  newType, 
  filteredData,
  dataSource = 'api',
  basePath = '',
  onGetMediaById,
  onUpdateMedia,
  onDeleteMedia,
  onDuplicateMedia,
  mediaTypeLoc: propMediaTypeLoc,
  mediaList: propMediaList
}) {
  const [media, setMedia] = useState({});
  const { mediaType, group } = useParams();
  const [loaded, setLoaded] = useState(false)
  const [curIndex, setCurIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFields, setEditingFields] = useState(new Set());
  const [tempMedia, setTempMedia] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const mediaTypeLoc = propMediaTypeLoc || (user ? (newType ? user.newTypes[mediaType] : user[mediaType]) : null);
  
  // Function to build back URL with preserved query parameters
  const buildBackUrl = () => {
    const baseUrl = `${basePath}/${mediaType}/${media.toDo === true ? 'to-do' : 'collection'}`;
    const currentSearch = location.search;
    
    // If there are query parameters (like tags), preserve them
    if (currentSearch) {
      return `${baseUrl}${currentSearch}`;
    }
    
    return baseUrl;
  };
  
  // Build mediaList from filteredData (app mode) or prop (demo mode)
  const mediaList = useMemo(() => {
    if (dataSource === 'demo' && propMediaList) {
      // Demo mode: use provided mediaList
      return propMediaList;
    }
    // App mode: build from filteredData
    return filteredData ? Object.values(filteredData).reduce((acc, val) => acc.concat(val), []) : [];
  }, [filteredData, dataSource, propMediaList]);
  
  useEffect(() => {
    if(!loaded) {
      if (dataSource === 'demo' && onGetMediaById) {
        // Demo mode: use callback
        const foundMedia = onGetMediaById(group);
        if (!foundMedia) {
          navigate('/404');
        } else {
          setMedia(foundMedia);
          setTempMedia(foundMedia);
          // Find current media index - demo mode uses ID matching
          // This will be handled by parent component providing mediaList
          setLoaded(true);
        }
      } else if (dataSource === 'api') {
        // API mode: use axios
        axios
        .get(constants['SERVER_URL'] + `/api/media/${mediaType}/${group}`)
        .then((res) => {
          if(!res.data) {
            navigate('/404')
          } else {
            console.log("Details GET /api/media/type/id", res.data)
            setMedia(res.data);
            setTempMedia(res.data); // Initialize temp media for editing
            
            // Find current media index in the mediaList
            for(let i = 0; i < mediaList.length; i++) {
              if(mediaList[i].title === res.data.title) {
                setCurIndex(i);
                break;
              }
            }
            setLoaded(true);
          }
        })
        .catch((err) => {
          console.log('Error from ShowMediaDetails');
        });
      }
    }
  }, [loaded, mediaType, group, navigate, mediaList, dataSource, onGetMediaById, propMediaList]);

  // Editing functions
  const startEditing = (field) => {
    setIsEditing(true);
    setEditingFields(prev => new Set([...prev, field]));
  };

  // const stopEditing = (field) => {
  //   setEditingFields(prev => {
  //     const newSet = new Set(prev);
  //     newSet.delete(field);
  //     return newSet;
  //   });
  //   
  //   // If no fields are being edited, exit editing mode
  //   if (editingFields.size === 1) {
  //     setIsEditing(false);
  //   }
  // };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingFields(new Set());
    setTempMedia(media); // Reset to original values
  };

  const handleFieldChange = (field, value) => {
    setTempMedia(prev => ({
      ...prev,
      [field]: field === 'toDo' ? value === 'true' : value
    }));
  };

  const saveChanges = () => {
    const data = {
      title: tempMedia.title,
      tier: tempMedia.tier,
      toDo: tempMedia.toDo,
      year: tempMedia.year,
      tags: tempMedia.tags,
      description: tempMedia.description
    };

    if (onUpdateMedia) {
      const success = onUpdateMedia(group, data);
      if (success) {
        setMedia(tempMedia);
        setIsEditing(false);
        setEditingFields(new Set());
      } else {
        setTempMedia(media);
      }
      return;
    }

    axios
      .put(constants['SERVER_URL'] + `/api/media/${mediaType}/${group}`, data)
      .then((res) => {
        setMedia(tempMedia);
        setIsEditing(false);
        setEditingFields(new Set());
      })
      .catch((err) => {
        setTempMedia(media);
      });
  };

  function onDeleteClick() {
    if (dataSource === 'demo' && onDeleteMedia) {
      // Demo mode: use callback
      const success = onDeleteMedia(group);
      if (success) {
        const groupStr = media.toDo === true ? 'to-do' : 'collection';
        const backUrl = `${basePath}/${mediaType}/${groupStr}`;
        const currentSearch = location.search;
        const finalUrl = currentSearch ? `${backUrl}${currentSearch}` : backUrl;
        navigate(finalUrl);
      }
    } else if (dataSource === 'api') {
      // API mode: use axios
      axios
        .delete(constants['SERVER_URL'] + `/api/media/${mediaType}/${group}`)
        .then((res) => {
          // Use the media object's toDo property as fallback if res.data.toDo is undefined
          const groupStr = (res.data && res.data.toDo === true) || media.toDo === true ? 'to-do' : 'collection';
          const backUrl = `${basePath}/${mediaType}/${groupStr}`;
          const currentSearch = location.search;
          
          // Preserve query parameters when navigating back after delete
          const finalUrl = currentSearch ? `${backUrl}${currentSearch}` : backUrl;
          navigate(finalUrl);
        })
        .catch((err) => {
          console.log('Error from ShowMediaDetails_deleteClick:', err);
        });
    }
  };

  function onDuplicateClick() {
    if (!media.title) {
      console.log('Media not loaded yet');
      return;
    }
    // Show confirmation modal first
    setShowDuplicateConfirmation(true);
  }

  function handleConfirmDuplicate() {
    if (!media.title) {
      console.log('Media not loaded yet');
      return;
    }

    setShowDuplicateConfirmation(false);

    const duplicateData = {
      media: {
        mediaType: media.mediaType,
        title: media.title,
        tier: media.tier,
        toDo: media.toDo,
        year: media.year,
        tags: media.tags || [],
        description: media.description || ''
      },
      newType: newType
    };

    if (onDuplicateMedia) {
      // Demo mode: use callback, then show success modal
      const created = onDuplicateMedia(duplicateData);
      if (created && created.ID) {
        setDuplicateId(created.ID);
        setShowDuplicateModal(true);
      } else {
        window.alert('Failed to duplicate media');
      }
      return;
    }

    axios
      .post(constants['SERVER_URL'] + '/api/media', duplicateData)
      .then((res) => {
        console.log('Media duplicated successfully:', res.data);
        setDuplicateId(res.data.ID);
        setShowDuplicateModal(true);
      })
      .catch((err) => {
        console.log('Error from ShowMediaDetails_duplicateClick:', err);
        window.alert('Failed to duplicate media');
      });
  }

  function handleCancelDuplicate() {
    setShowDuplicateConfirmation(false);
  }

  function handleGoToCopy() {
    if (!duplicateId) return;
    const newUrl = `${basePath}/${mediaType}/${duplicateId}`;
    const currentSearch = location.search;
    const finalUrl = currentSearch ? `${newUrl}${currentSearch}` : newUrl;
    // Reset loaded state so the new media loads
    setLoaded(false);
    setShowDuplicateModal(false);
    navigate(finalUrl);
  }

  function handleDone() {
    setShowDuplicateModal(false);
    setDuplicateId(null);
  }

  function onSwipeLeft() {
    if (mediaList.length === 0) {
      return;
    }
    
    // Go to next media (forward)
    var nextIndex = curIndex + 1;
    if(nextIndex === mediaList.length){
      nextIndex = 0;
    }
    
    const nextMedia = mediaList[nextIndex];
    if (!nextMedia || !nextMedia.ID) {
      return;
    }
    
    setCurIndex(nextIndex);
    const nextId = nextMedia.ID.toString();
    
    // Preserve query parameters when navigating to next media
    const nextUrl = `/${mediaType}/${nextId}`;
    const currentSearch = location.search;
    const finalNextUrl = currentSearch ? `${nextUrl}${currentSearch}` : nextUrl;
    
    navigate(finalNextUrl);
    setLoaded(false);
  }
  
  function onSwipeRight() {
    if (mediaList.length === 0) {
      return;
    }
    
    // Go to previous media (backward)
    var prevIndex = curIndex - 1;
    if(prevIndex === -1){
      prevIndex = mediaList.length - 1;
    }
    
    const prevMedia = mediaList[prevIndex];
    if (!prevMedia || !prevMedia.ID) {
      return;
    }
    
    setCurIndex(prevIndex);
    const prevId = prevMedia.ID.toString();
    
    // Preserve query parameters when navigating to previous media
    const prevUrl = `/${mediaType}/${prevId}`;
    const currentSearch = location.search;
    const finalPrevUrl = currentSearch ? `${prevUrl}${currentSearch}` : prevUrl;
    
    navigate(finalPrevUrl);
    setLoaded(false);
  }
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDuplicateConfirmation, setShowDuplicateConfirmation] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateId, setDuplicateId] = useState(null);
  const [tierSelectWidth, setTierSelectWidth] = useState('auto');
  const tierTextMeasureRef = useRef(null);
  const tierSelectRef = useRef(null);
  const tierCellRef = useRef(null);
  
  const swipeHandlers = useSwipe({ 
    onSwipedLeft: onSwipeLeft, 
    onSwipedRight: onSwipeRight,
    disabled: isModalOpen || isEditing // Disable swipe when modal is open or editing
  });
  
  // Handle modal state changes
  const handleModalOpen = () => {
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  
  const tiersVariable = (tempMedia.toDo !== undefined ? tempMedia.toDo : media.toDo) ? 'todoTiers' : 'collectionTiers';
  
  // Calculate tier select width based on tier title length
  useEffect(() => {
    if (editingFields.has('tier')) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (tierTextMeasureRef.current && tierSelectRef.current && tierCellRef.current) {
          const currentTier = tempMedia.tier || media.tier;
          const tierTitle = mediaTypeLoc && mediaTypeLoc[tiersVariable] && mediaTypeLoc[tiersVariable][currentTier] 
            ? mediaTypeLoc[tiersVariable][currentTier] 
            : currentTier;
          
          // Update the hidden span with the tier title
          tierTextMeasureRef.current.textContent = tierTitle;
          
          // Measure the text width
          const textWidth = tierTextMeasureRef.current.offsetWidth;
          
          // Get the available width in the table cell (accounting for padding)
          const cellWidth = tierCellRef.current.offsetWidth;
          const cellPadding = 32; // px-4 = 1rem = 16px on each side
          const maxAvailableWidth = cellWidth - cellPadding;
          
          // Set width to text width + some padding for the select dropdown arrow, but not exceeding cell width
          const selectPadding = 56; // Space for dropdown arrow and some padding (wider on mobile so arrow doesn't overlap text)
          const calculatedWidth = Math.min(textWidth + selectPadding, maxAvailableWidth);
          
          setTierSelectWidth(`${Math.max(calculatedWidth, 60)}px`); // Minimum 60px
        }
      });
    } else {
      // Reset width when not editing
      setTierSelectWidth('auto');
    }
  }, [editingFields, tempMedia.tier, media.tier, mediaTypeLoc, tiersVariable]);
  
  // Redirect to login if user is not authenticated (only for API mode)
  if (dataSource === 'api' && !user) {
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
  
  // Helper function to render editable fields
  const renderEditableField = (field, value, type = 'text') => {
    if (editingFields.has(field)) {
      switch (type) {
        case 'select':
          if (field === 'year') {
            return (
              <input 
                type='date'
                className='form-control form-control-sm' 
                value={tempMedia[field] ? (typeof tempMedia[field] === 'string' ? tempMedia[field].split('T')[0] : new Date(tempMedia[field]).toISOString().split('T')[0]) : ''} 
                onChange={(e) => handleFieldChange(field, e.target.value)}
                style={{ width: 'auto', minWidth: '150px', textAlign: 'left' }}
              />
            );
          } else if (field === 'tier') {
            return (
              <>
                <span
                  ref={tierTextMeasureRef}
                  style={{
                    position: 'absolute',
                    visibility: 'hidden',
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem', // form-select-sm font size
                    fontFamily: 'inherit',
                    fontWeight: 'inherit'
                  }}
                />
                <select 
                  ref={tierSelectRef}
                  className='form-select form-select-sm' 
                  value={tempMedia[field]} 
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  style={{ width: tierSelectWidth, minWidth: '60px', maxWidth: '100%' }}
                >
                  {constants.STANDARD_TIERS.map((tier) => (
                    <option key={tier} value={tier}>{mediaTypeLoc && mediaTypeLoc[tiersVariable] ? mediaTypeLoc[tiersVariable][tier] : tier}</option>
                  ))}
                </select>
              </>
            );
          } else if (field === 'toDo') {
            return (
              <select 
                className='form-select form-select-sm' 
                value={tempMedia[field] ? 'true' : 'false'} 
                onChange={(e) => handleFieldChange(field, e.target.value)}
                style={{ width: 'auto', minWidth: '170px' }}
              >
                <option value='true'>To-Do List</option>
                <option value='false'>My Collection</option>
              </select>
            );
          }
          break;
        case 'tags':
          return (
            <TagMaker 
              mediaType={mediaType} 
              toDo={tempMedia.toDo} 
              media={tempMedia} 
              setMedia={setTempMedia} 
              alreadySelected={tempMedia.tags ? tempMedia.tags.map(tag => ({ label: tag, value: tag })) : []} 
              placeholder={constants[mediaType] && constants[mediaType]?.tags ? constants[mediaType].tags : constants['other'].tags}
              hideLabel={true}
              size="extra-small"
              dataSource={dataSource}
            />
          );
        default:
          const isDescription = field === 'description';
          const isTitle = field === 'title';
          if (isDescription) {
            return (
              <textarea
                className='form-control form-control-sm'
                value={tempMedia[field] || ''}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                rows={3}
                style={{ 
                  width: '100%',
                  maxWidth: '100%',
                  resize: 'vertical',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}
              />
            );
          }
          if (isTitle) {
            return (
              <textarea
                className='form-control form-control-sm'
                value={tempMedia[field] || ''}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                rows={2}
                style={{ 
                  width: '100%',
                  maxWidth: '100%',
                  resize: 'vertical',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  minWidth: 0
                }}
              />
            );
          }
          return (
            <input
              type='text'
              className='form-control form-control-sm'
              value={tempMedia[field]}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              style={{ 
                width: 'auto', 
                minWidth: '100px',
                maxWidth: '300px',
                resize: 'horizontal'
              }}
              size={Math.max(tempMedia[field]?.length || 0, 10)}
            />
          );
      }
    } else {
      return (
        <span 
          style={{ 
            cursor: 'pointer', 
            color: '#ffffff',
            ...((field === 'description' || field === 'title') ? { 
              display: 'block',
              maxWidth: '100%',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
              wordBreak: 'normal'
            } : {})
          }}
          onDoubleClick={() => startEditing(field)}
          title="Double-click to edit"
        >
          {field === 'tier' ? 
            (mediaTypeLoc && mediaTypeLoc[tiersVariable] ? mediaTypeLoc[tiersVariable][tempMedia[field] || media[field]] : tempMedia[field] || media[field]) :
            field === 'tags' ?
              ((tempMedia[field] || media[field]) && (tempMedia[field] || media[field]).length > 0 ? (tempMedia[field] || media[field]).join(', ') : '-') :
              field === 'toDo' ?
                ((tempMedia[field] !== undefined ? tempMedia[field] : media[field]) ? 'To-Do List' : 'My Collection') :
                field === 'year' ?
                  (tempMedia[field] || media[field] ? new Date(tempMedia[field] || media[field]).toISOString().split('T')[0] : '-') :
                  (tempMedia[field] || value)
          }
        </span>
      );
    }
  };
  
  return (
    <div className='ShowMediaDetails min-vh-100' style={{backgroundColor: theme.colors.background.primary, color: 'white'}} {...swipeHandlers}>
      <style>{`
        @media (min-width: 768px) {
          .ShowMediaDetails table {
            table-layout: auto;
          }
          .ShowMediaDetails .description-cell {
            max-width: 70ch !important;
            width: 70ch !important;
            overflow-wrap: break-word !important;
            word-wrap: break-word !important;
          }
          .ShowMediaDetails .description-cell > span {
            max-width: 100% !important;
            display: block !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            white-space: normal !important;
            word-break: normal !important;
          }
        }
        @media (max-width: 767.98px) {
          .ShowMediaDetails table tbody tr td:nth-child(2) {
            width: 25% !important;
            min-width: 80px;
            padding-left: 0.75rem !important;
            padding-right: 0.5rem !important;
          }
          .ShowMediaDetails table tbody tr td:nth-child(3) {
            width: 75% !important;
            min-width: 0 !important;
            overflow-wrap: break-word !important;
            padding-left: 0.5rem !important;
            padding-right: 0.75rem !important;
          }
        }
      `}</style>
      <div className='py-3' style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
        {/* Mobile layout - single row */}
        <div className='mb-4 d-md-none' style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className='d-flex align-items-center'>
            <div style={{ flex: '0 0 auto' }}>
              <Link to={buildBackUrl()} className='btn btn-outline-warning btn-sm' title="Go Back">
                <i className="fas fa-arrow-left"></i>
              </Link>
            </div>
            <div style={{ flex: '1', textAlign: 'center', padding: '0 0.5rem', minWidth: 0 }}>
              <h1 className='fw-bold text-white mb-1' style={{fontSize: '1.1rem', lineHeight: '1.3'}}>{toCapitalNotation(mediaType)} Record</h1>
              <div className="border-bottom border-2 border-warning mx-auto" style={{width: '60%'}}></div>
            </div>
            <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={onDuplicateClick}
                className='btn btn-success btn-sm'
                title="Duplicate"
                style={{ fontSize: '1rem', padding: '0.4rem 0.5rem' }}
              >
                <i className="fas fa-copy" style={{ fontSize: '1rem' }}></i>
              </button>
              <DeleteModal 
                onDeleteClick={onDeleteClick} 
                type='media'
                onModalOpen={handleModalOpen}
                onModalClose={handleModalClose}
                buttonStyle={{ fontSize: '1rem', padding: '0.4rem 0.5rem' }}
                iconStyle={{ fontSize: '1rem' }}
              ></DeleteModal>
            </div>
          </div>
        </div>

        {/* Desktop layout - hidden on mobile */}
        <div className='row mb-4 d-none d-md-flex align-items-center'>
          <div className='col-md-2 d-flex justify-content-start'>
            <Link to={buildBackUrl()} className='btn btn-outline-warning btn-lg'>
              <i className="fas fa-arrow-left me-2"></i>Go Back
            </Link>
          </div>
          <div className='col-md-8 text-center'>
            <h1 className='display-4 fw-bold text-white mb-0'>{toCapitalNotation(mediaType)} Record</h1>
            <div className="border-bottom border-3 border-warning w-25 mx-auto"></div>
          </div>
          <div className='col-md-2 d-flex justify-content-end gap-2'>
            <button
              onClick={onDuplicateClick}
              className='btn btn-success btn-lg'
              title="Duplicate"
            >
              <i className="fas fa-copy me-2"></i>Duplicate
            </button>
            <DeleteModal 
              onDeleteClick={onDeleteClick} 
              type='media'
              onModalOpen={handleModalOpen}
              onModalClose={handleModalClose}
            ></DeleteModal>
          </div>
        </div>
        
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="card shadow-soft border-0" style={{backgroundColor: theme.colors.background.dark}}>
              <div className="card-body p-0" style={{backgroundColor: theme.colors.background.dark}}>
                <div className="table-responsive">
                  <table className='table table-hover mb-0 text-white' style={{backgroundColor: theme.colors.background.dark}}>
                    <tbody style={{backgroundColor: theme.colors.background.dark}}>
                      <tr style={{backgroundColor: theme.colors.background.dark}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>1</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Title</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: theme.colors.background.dark}}>
                          {renderEditableField('title', media.title)}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: theme.colors.background.dark}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>2</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Date</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: theme.colors.background.dark}}>
                          {renderEditableField('year', media.year, 'select')}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: theme.colors.background.dark}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>3</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Tier</td>
                        <td ref={tierCellRef} className='px-4 py-3 text-white' style={{backgroundColor: theme.colors.background.dark}}>
                          {renderEditableField('tier', mediaTypeLoc && mediaTypeLoc[tiersVariable] ? mediaTypeLoc[tiersVariable][media.tier] : media.tier, 'select')}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: theme.colors.background.dark}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>4</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Tags</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: theme.colors.background.dark, overflow: 'visible', position: 'relative', zIndex: 999}}>
                          {renderEditableField('tags', media.tags && media.tags[0] ? media.tags.join(', ') : '-', 'tags')}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: theme.colors.background.dark}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>5</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Description</td>
                        <td className='px-4 py-3 text-white description-cell' style={{backgroundColor: theme.colors.background.dark, wordWrap: 'break-word', overflowWrap: 'break-word'}}>
                          {renderEditableField('description', media.description ? media.description : '-')}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: theme.colors.background.dark}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>6</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>List Type</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: theme.colors.background.dark}}>
                          {renderEditableField('toDo', media.toDo, 'select')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        
        <div className='mt-4' style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          {isEditing ? (
            <div className='d-flex gap-2 justify-content-center'>
              <button 
                onClick={saveChanges}
                className='btn btn-warning btn-lg'
              >
                <i className="fas fa-save me-2"></i>Update Media
              </button>
              <button 
                onClick={cancelEditing}
                className='btn btn-secondary btn-lg'
              >
                <i className="fas fa-times me-2"></i>Cancel
              </button>
            </div>
          ) : (
            <div className='text-warning'>
              <small><strong>Double-click any field value to edit</strong></small>
            </div>
          )}
        </div>
      </div>
      
      {/* Duplicate Confirmation Modal */}
      {showDuplicateConfirmation && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1" onClick={handleCancelDuplicate}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow-strong">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-semibold text-dark">Duplicate Confirmation</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCancelDuplicate}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-dark mb-3">Are you sure you want to duplicate this record?</p>
                <div className="d-flex gap-2 justify-content-end">
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={handleCancelDuplicate}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success btn-sm"
                    onClick={handleConfirmDuplicate}
                  >
                    Duplicate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Success Modal */}
      <DuplicateModal
        show={showDuplicateModal}
        onDone={handleDone}
        onGoToCopy={handleGoToCopy}
      />
    </div>
  );
}

export default ShowMediaDetails;