import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import DeleteModal from "../components/DeleteModal";
import TagMaker from "../components/TagMaker";
import useSwipe from "../useSwipe.tsx";
const constants = require('../constants');
const theme = require('../theme');

function toCapitalNotation(inputString) {
  return inputString
    .split(' ') // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
}

function ShowMediaDetails({user, newType, filteredData}) {
  const [media, setMedia] = useState({});
  const { mediaType, group } = useParams();
  const [loaded, setLoaded] = useState(false)
  const [curIndex, setCurIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFields, setEditingFields] = useState(new Set());
  const [tempMedia, setTempMedia] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const mediaTypeLoc = user ? (newType ? user.newTypes[mediaType] : user[mediaType]) : null;
  
  // Function to build back URL with preserved query parameters
  const buildBackUrl = () => {
    const baseUrl = `/${mediaType}/${media.toDo === true ? 'to-do' : 'collection'}`;
    const currentSearch = location.search;
    
    // If there are query parameters (like tags), preserve them
    if (currentSearch) {
      return `${baseUrl}${currentSearch}`;
    }
    
    return baseUrl;
  };
  
  // Build mediaList from filteredData (clean React approach)
  const mediaList = useMemo(() => {
    return filteredData ? Object.values(filteredData).reduce((acc, val) => acc.concat(val), []) : [];
  }, [filteredData]);
  
  useEffect(() => {
    if(!loaded) {
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
  }, [loaded, mediaType, group, navigate, mediaList]);

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
      [field]: field === 'toDo' ? value === 'true' : 
               field === 'year' ? parseInt(value) : value
    }));
  };

  const saveChanges = () => {
    console.log("=== SAVE CHANGES DEBUG ===");
    console.log("Current tempMedia state:", tempMedia);
    console.log("Original media state:", media);
    
    const data = {
      title: tempMedia.title,
      tier: tempMedia.tier,
      toDo: tempMedia.toDo,
      year: tempMedia.year,
      tags: tempMedia.tags,
      description: tempMedia.description
    };

    console.log("Data being sent to backend:", data);
    console.log("API endpoint:", constants['SERVER_URL'] + `/api/media/${mediaType}/${group}`);

    axios
      .put(constants['SERVER_URL'] + `/api/media/${mediaType}/${group}`, data)
      .then((res) => {
        console.log("PUT /api/media/type/id success:", res.data);
        console.log("Updated media data:", tempMedia);
        setMedia(tempMedia);
        setIsEditing(false);
        setEditingFields(new Set());
      })
      .catch((err) => {
        console.log("PUT /api/media/type/id error:", err);
        console.log("Error details:", err.response?.data || err.message);
        // Reset on error
        setTempMedia(media);
      });
  };

  function onDeleteClick() {
    axios
      .delete(constants['SERVER_URL'] + `/api/media/${mediaType}/${group}`)
      .then((res) => {
        // Use the media object's toDo property as fallback if res.data.toDo is undefined
        const groupStr = (res.data && res.data.toDo === true) || media.toDo === true ? 'to-do' : 'collection';
        const backUrl = `/${mediaType}/${groupStr}`;
        const currentSearch = location.search;
        
        // Preserve query parameters when navigating back after delete
        const finalUrl = currentSearch ? `${backUrl}${currentSearch}` : backUrl;
        navigate(finalUrl);
      })
      .catch((err) => {
        console.log('Error from ShowMediaDetails_deleteClick:', err);
      });
  };

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
  
  const swipeHandlers = useSwipe({ 
    onSwipedLeft: onSwipeLeft, 
    onSwipedRight: onSwipeRight,
    disabled: isModalOpen // Disable swipe when modal is open
  });
  
  // Handle modal state changes
  const handleModalOpen = () => {
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  
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
  
  const tiersVariable = (tempMedia.toDo !== undefined ? tempMedia.toDo : media.toDo) ? 'todoTiers' : 'collectionTiers';
  
  // Helper function to render editable fields
  const renderEditableField = (field, value, type = 'text') => {
    if (editingFields.has(field)) {
      switch (type) {
        case 'select':
          if (field === 'year') {
            const years = Array.from({ length: constants.currentYear - 1969 }, (_, index) => constants.currentYear - index);
            return (
              <select 
                className='form-select form-select-sm' 
                value={tempMedia[field]} 
                onChange={(e) => handleFieldChange(field, e.target.value)}
                style={{ width: 'auto', minWidth: '80px' }}
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            );
          } else if (field === 'tier') {
            const tiers = ['S', 'A', 'B', 'C', 'D', 'F'];
            return (
              <select 
                className='form-select form-select-sm' 
                value={tempMedia[field]} 
                onChange={(e) => handleFieldChange(field, e.target.value)}
                style={{ width: 'auto', minWidth: '60px' }}
              >
                {tiers.map((tier) => (
                  <option key={tier} value={tier}>{mediaTypeLoc && mediaTypeLoc[tiersVariable] ? mediaTypeLoc[tiersVariable][tier] : tier}</option>
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
            <TagMaker 
              mediaType={mediaType} 
              toDo={tempMedia.toDo} 
              media={tempMedia} 
              setMedia={setTempMedia} 
              alreadySelected={tempMedia.tags ? tempMedia.tags.map(tag => ({ label: tag, value: tag })) : []} 
              placeholder={constants[mediaType] && constants[mediaType]?.tags ? constants[mediaType].tags : constants['other'].tags}
              hideLabel={true}
              size="extra-small"
            />
          );
        default:
          const isDescription = field === 'description';
          return (
            <input
              type='text'
              className='form-control form-control-sm'
              value={tempMedia[field]}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              style={{ 
                width: 'auto', 
                minWidth: '100px',
                maxWidth: isDescription ? '500px' : '300px',
                resize: 'horizontal'
              }}
              size={Math.max(tempMedia[field]?.length || 0, isDescription ? 20 : 10)}
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
          {field === 'tier' ? 
            (mediaTypeLoc && mediaTypeLoc[tiersVariable] ? mediaTypeLoc[tiersVariable][tempMedia[field] || media[field]] : tempMedia[field] || media[field]) :
            field === 'tags' ?
              ((tempMedia[field] || media[field]) && (tempMedia[field] || media[field]).length > 0 ? (tempMedia[field] || media[field]).join(', ') : '-') :
              field === 'toDo' ?
                ((tempMedia[field] !== undefined ? tempMedia[field] : media[field]) ? 'To-Do List' : 'My Collection') :
                (tempMedia[field] || value)
          }
        </span>
      );
    }
  };
  
  return (
    <div className='ShowMediaDetails min-vh-100' style={{backgroundColor: theme.colors.background.primary, color: 'white'}} {...swipeHandlers}>
      <div className='container-fluid px-2 py-3'>
        {/* Mobile layout - single row */}
        <div className='row mb-4 d-md-none align-items-center'>
          <div className='col-3'>
            <Link to={buildBackUrl()} className='btn btn-outline-warning btn-sm w-100'>
              <i className="fas fa-arrow-left me-1"></i>Back
            </Link>
          </div>
          <div className='col-6 text-center'>
            <h1 className='fw-bold text-white mb-1' style={{fontSize: '1.2rem', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{toCapitalNotation(mediaType)} Record</h1>
            <div className="border-bottom border-2 border-warning mx-auto" style={{width: '60%'}}></div>
          </div>
          <div className='col-3'>
            <div className='d-flex justify-content-end'>
              <DeleteModal 
                onDeleteClick={onDeleteClick} 
                type='media'
                onModalOpen={handleModalOpen}
                onModalClose={handleModalClose}
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
          <div className='col-md-2 d-flex justify-content-end'>
            <DeleteModal 
              onDeleteClick={onDeleteClick} 
              type='media'
              onModalOpen={handleModalOpen}
              onModalClose={handleModalClose}
            ></DeleteModal>
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
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Year</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: theme.colors.background.dark}}>
                          {renderEditableField('year', media.year, 'select')}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: theme.colors.background.dark}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>3</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Tier</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: theme.colors.background.dark}}>
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
          <div className='col-md-4'></div>
        </div>
      </div>
    </div>
  );
}

export default ShowMediaDetails;