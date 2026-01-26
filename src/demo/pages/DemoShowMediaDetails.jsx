import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import useSwipe from "../../app/hooks/useSwipe.tsx";
import { useDemoData } from "../hooks/useDemoData";
import DemoTagMaker from "../components/DemoTagMaker";

const theme = require('../../styling/theme');

const constants = {
  anime: { tags: 'e.g., Action, Adventure' },
  tv: { tags: 'e.g., Drama, Crime' },
  movies: { tags: 'e.g., Sci-Fi, Thriller' },
  games: { tags: 'e.g., Action, Adventure' },
  other: { tags: 'Add tags...' }
};

function toCapitalNotation(inputString) {
  return inputString
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function DemoShowMediaDetails() {
  const { mediaType, group } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    data, 
    loading, 
    getMediaById, 
    updateMedia, 
    deleteMedia,
    createMedia
  } = useDemoData(mediaType);

  const [media, setMedia] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [curIndex, setCurIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFields, setEditingFields] = useState(new Set());
  const [tempMedia, setTempMedia] = useState({});
  const [isModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDuplicateConfirmation, setShowDuplicateConfirmation] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateId, setDuplicateId] = useState(null);

  // Build media list from all data
  const mediaList = useMemo(() => {
    if (!data) return [];
    return data;
  }, [data]);

  // Build back URL with preserved query parameters
  const buildBackUrl = () => {
    const baseUrl = `/demo/${mediaType}/${media.toDo === true ? 'to-do' : 'collection'}`;
    const currentSearch = location.search;
    if (currentSearch) {
      return `${baseUrl}${currentSearch}`;
    }
    return baseUrl;
  };

  // Load media from localStorage
  useEffect(() => {
    if (!loading && data && !loaded) {
      const foundMedia = getMediaById(group);
      if (!foundMedia) {
        navigate('/404');
      } else {
        setMedia(foundMedia);
        setTempMedia(foundMedia);
        
        // Find current media index in the list
        for (let i = 0; i < mediaList.length; i++) {
          if (mediaList[i].ID === foundMedia.ID) {
            setCurIndex(i);
            break;
          }
        }
        setLoaded(true);
      }
    }
  }, [loading, data, loaded, group, navigate, mediaList, getMediaById]);

  // Editing functions
  const startEditing = (field) => {
    setIsEditing(true);
    setEditingFields(prev => new Set([...prev, field]));
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingFields(new Set());
    setTempMedia(media);
  };

  const handleFieldChange = (field, value) => {
    setTempMedia(prev => ({
      ...prev,
      [field]: field === 'toDo' ? value === 'true' : value
    }));
  };

  const saveChanges = () => {
    const updatedData = {
      title: tempMedia.title,
      tier: tempMedia.tier,
      toDo: tempMedia.toDo,
      year: tempMedia.year,
      tags: tempMedia.tags,
      description: tempMedia.description
    };

    // Save to localStorage
    const success = updateMedia(group, updatedData);
    if (success) {
      setMedia({ ...media, ...updatedData });
      setIsEditing(false);
      setEditingFields(new Set());
    }
  };

  function onDeleteClick() {
    const success = deleteMedia(group);
    if (success) {
      const groupStr = media.toDo === true ? 'to-do' : 'collection';
      const backUrl = `/demo/${mediaType}/${groupStr}`;
      const currentSearch = location.search;
      const finalUrl = currentSearch ? `${backUrl}${currentSearch}` : backUrl;
      navigate(finalUrl);
    }
    setShowDeleteModal(false);
  }

  function onDuplicateClick() {
    if (!media.title) return;
    setShowDuplicateConfirmation(true);
  }

  function handleConfirmDuplicate() {
    if (!media.title) return;
    setShowDuplicateConfirmation(false);

    const duplicateData = {
      title: media.title,
      tier: media.tier,
      toDo: media.toDo,
      year: media.year,
      tags: media.tags || [],
      description: media.description || ''
    };

    const newMedia = createMedia(duplicateData);
    if (newMedia) {
      setDuplicateId(newMedia.ID);
      setShowDuplicateModal(true);
    }
  }

  function handleCancelDuplicate() {
    setShowDuplicateConfirmation(false);
  }

  function handleGoToCopy() {
    if (!duplicateId) return;
    const newUrl = `/demo/${mediaType}/${duplicateId}`;
    const currentSearch = location.search;
    const finalUrl = currentSearch ? `${newUrl}${currentSearch}` : newUrl;
    setLoaded(false);
    setShowDuplicateModal(false);
    navigate(finalUrl);
  }

  function handleDone() {
    setShowDuplicateModal(false);
    setDuplicateId(null);
  }

  function onSwipeLeft() {
    if (mediaList.length === 0) return;
    
    var nextIndex = curIndex + 1;
    if (nextIndex === mediaList.length) {
      nextIndex = 0;
    }
    
    const nextMedia = mediaList[nextIndex];
    if (!nextMedia || !nextMedia.ID) return;
    
    setCurIndex(nextIndex);
    const nextId = nextMedia.ID.toString();
    
    const nextUrl = `/demo/${mediaType}/${nextId}`;
    const currentSearch = location.search;
    const finalNextUrl = currentSearch ? `${nextUrl}${currentSearch}` : nextUrl;
    
    navigate(finalNextUrl);
    setLoaded(false);
  }
  
  function onSwipeRight() {
    if (mediaList.length === 0) return;
    
    var prevIndex = curIndex - 1;
    if (prevIndex === -1) {
      prevIndex = mediaList.length - 1;
    }
    
    const prevMedia = mediaList[prevIndex];
    if (!prevMedia || !prevMedia.ID) return;
    
    setCurIndex(prevIndex);
    const prevId = prevMedia.ID.toString();
    
    const prevUrl = `/demo/${mediaType}/${prevId}`;
    const currentSearch = location.search;
    const finalPrevUrl = currentSearch ? `${prevUrl}${currentSearch}` : prevUrl;
    
    navigate(finalPrevUrl);
    setLoaded(false);
  }

  const swipeHandlers = useSwipe({ 
    onSwipedLeft: onSwipeLeft, 
    onSwipedRight: onSwipeRight,
    disabled: isModalOpen
  });

  const tiers = ['S', 'A', 'B', 'C', 'D', 'F'];

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
                style={{ width: 'auto', minWidth: '150px' }}
              />
            );
          } else if (field === 'tier') {
            return (
              <select 
                className='form-select form-select-sm' 
                value={tempMedia[field]} 
                onChange={(e) => handleFieldChange(field, e.target.value)}
                style={{ width: 'auto', minWidth: '60px' }}
              >
                {tiers.map((tier) => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            );
          } else if (field === 'toDo') {
            return (
              <select 
                className='form-select form-select-sm' 
                value={tempMedia[field] ? 'true' : 'false'} 
                onChange={(e) => handleFieldChange(field, e.target.value)}
                style={{ width: 'auto', minWidth: '120px' }}
              >
                <option value='true'>To-Do List</option>
                <option value='false'>My Collection</option>
              </select>
            );
          }
          break;
        case 'tags':
          return (
            <DemoTagMaker 
              mediaType={mediaType} 
              media={tempMedia} 
              setMedia={setTempMedia} 
              alreadySelected={tempMedia.tags ? tempMedia.tags.map(tag => ({ label: tag, value: tag })) : []} 
              placeholder={constants[mediaType]?.tags || constants.other.tags}
              hideLabel={true}
              size="extra-small"
            />
          );
        default:
          const isDescription = field === 'description';
          if (isDescription) {
            return (
              <textarea
                className='form-control form-control-sm'
                value={tempMedia[field] || ''}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                rows={3}
                style={{ width: '100%', maxWidth: '100%', resize: 'vertical' }}
              />
            );
          }
          return (
            <input
              type='text'
              className='form-control form-control-sm'
              value={tempMedia[field] || ''}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              style={{ width: 'auto', minWidth: '100px', maxWidth: '300px' }}
            />
          );
      }
    } else {
      return (
        <span 
          style={{ cursor: 'pointer', color: '#ffffff' }}
          onDoubleClick={() => startEditing(field)}
          title="Double-click to edit"
        >
          {field === 'tier' ? (tempMedia[field] || media[field]) :
            field === 'tags' ?
              ((tempMedia[field] || media[field]) && (tempMedia[field] || media[field]).length > 0 ? (tempMedia[field] || media[field]).join(', ') : '-') :
              field === 'toDo' ?
                ((tempMedia[field] !== undefined ? tempMedia[field] : media[field]) ? 'To-Do List' : 'My Collection') :
                field === 'year' ?
                  (tempMedia[field] || media[field] ? new Date(tempMedia[field] || media[field]).toISOString().split('T')[0] : '-') :
                  (tempMedia[field] || value || '-')
          }
        </span>
      );
    }
  };

  if (loading || !loaded) {
    return <div className="text-center p-5 text-white">Loading...</div>;
  }

  return (
    <div className='ShowMediaDetails min-vh-100' style={{backgroundColor: theme.colors.background.primary, color: 'white'}} {...swipeHandlers}>
      <div className='container-fluid px-2 py-3'>
        {/* Mobile layout */}
        <div className='row mb-4 d-md-none align-items-center'>
          <div className='col-3'>
            <Link to={buildBackUrl()} className='btn btn-outline-warning btn-sm w-100'>
              <i className="fas fa-arrow-left me-1"></i>Back
            </Link>
          </div>
          <div className='col-6 text-center'>
            <h1 className='fw-bold text-white mb-1' style={{fontSize: '1.2rem', lineHeight: '1.2'}}>{toCapitalNotation(mediaType)} Record</h1>
            <div className="border-bottom border-2 border-warning mx-auto" style={{width: '60%'}}></div>
          </div>
          <div className='col-3'>
            <div className='d-flex justify-content-end gap-2'>
              <button onClick={onDuplicateClick} className='btn btn-success btn-sm' title="Duplicate">
                <i className="fas fa-copy"></i>
              </button>
              <button onClick={() => setShowDeleteModal(true)} className='btn btn-danger btn-sm' title="Delete">
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop layout */}
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
            <button onClick={onDuplicateClick} className='btn btn-success btn-lg' title="Duplicate">
              <i className="fas fa-copy me-2"></i>Duplicate
            </button>
            <button onClick={() => setShowDeleteModal(true)} className='btn btn-danger btn-lg' title="Delete">
              <i className="fas fa-trash me-2"></i>Delete
            </button>
          </div>
        </div>
        
        <div className='row justify-content-center'>
          <div className='col-lg-10 col-md-12'>
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
                        <td className='px-4 py-3 text-white' style={{backgroundColor: theme.colors.background.dark}}>
                          {renderEditableField('tier', media.tier, 'select')}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: theme.colors.background.dark}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>4</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Tags</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: theme.colors.background.dark}}>
                          {renderEditableField('tags', media.tags && media.tags[0] ? media.tags.join(', ') : '-', 'tags')}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: theme.colors.background.dark}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>5</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Description</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: theme.colors.background.dark}}>
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
        </div>
        
        <div className='row mt-4'>
          <div className='col-md-4'></div>
          <div className='col-md-4 text-center'>
            {isEditing ? (
              <div className='d-flex gap-2 justify-content-center'>
                <button onClick={saveChanges} className='btn btn-warning btn-lg'>
                  <i className="fas fa-save me-2"></i>Update Media
                </button>
                <button onClick={cancelEditing} className='btn btn-secondary btn-lg'>
                  <i className="fas fa-times me-2"></i>Cancel
                </button>
              </div>
            ) : (
              <div className='text-warning'>
                <small><strong>Double-click any field value to edit</strong></small>
              </div>
            )}
          </div>
          <div className='col-md-4'></div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow-strong">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-semibold text-dark">Delete Confirmation</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p className="text-dark mb-3">Are you sure you want to delete this record?</p>
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={onDeleteClick}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Duplicate Confirmation Modal */}
      {showDuplicateConfirmation && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1" onClick={handleCancelDuplicate}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow-strong">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-semibold text-dark">Duplicate Confirmation</h5>
                <button type="button" className="btn-close" onClick={handleCancelDuplicate} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p className="text-dark mb-3">Are you sure you want to duplicate this record?</p>
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary" onClick={handleCancelDuplicate}>Cancel</button>
                <button type="button" className="btn btn-success" onClick={handleConfirmDuplicate}>Duplicate</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Success Modal */}
      {showDuplicateModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1" onClick={handleDone}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow-strong">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-semibold text-dark">Duplicate Created</h5>
                <button type="button" className="btn-close" onClick={handleDone} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p className="text-dark mb-3">A copy of this record has been created successfully!</p>
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary" onClick={handleDone}>Done</button>
                <button type="button" className="btn btn-primary" onClick={handleGoToCopy}>Go to Copy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DemoShowMediaDetails;
