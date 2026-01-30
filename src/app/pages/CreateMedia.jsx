import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import TagMaker from "../components/TagMaker";
import { toCapitalNotation } from "../helpers";
const constants = require('../constants');
const theme = require('../../styling/theme');

const CreateMedia = ({user, toDo, newType, selectedTags, dataSource = 'api', basePath = '', onCreateMedia, mediaTypeLoc: propMediaTypeLoc, useYearSelect = false}) => {
  
  const location = useLocation();
  
  // Get selected tags from URL parameters
  const getTagsFromURL = useCallback(() => {
    const urlParams = new URLSearchParams(location.search);
    const tagsParam = urlParams.get('tags');
    
    if (tagsParam) {
      const tagLabels = tagsParam.split(',');
      return tagLabels.map(label => ({ label, value: label }));
    }
    return [];
  }, [location.search]);
  
  // Try to get selected tags from URL if props are empty
  const [effectiveSelectedTags, setEffectiveSelectedTags] = useState(() => {
    
    // First try URL parameters
    const urlTags = getTagsFromURL();
    if (urlTags.length > 0) {
      return urlTags;
    }
    
    // Fall back to props
    if (selectedTags && selectedTags.length > 0) {
      return selectedTags;
    }
    
    return [];
  });
  
  // Define the state with useState hook
  const navigate = useNavigate();
  const { mediaType } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedTier = urlParams.get('tier');
  
  // For demo mode with year select, use just the year; otherwise use full date
  const initialYear = useYearSelect 
    ? new Date().getFullYear().toString() 
    : new Date().toISOString().split('T')[0];
  
  const [media, setMedia] = useState({
    mediaType: mediaType,
    title: '',
    tier: preselectedTier ? preselectedTier : 'S',
    toDo: dataSource === 'demo' ? toDo : toDo.toString(),
    year: initialYear,
    tags: effectiveSelectedTags.map(item => item.label),
    description: ''
  });
  const [titleError, setTitleError] = useState(false);
  const mediaTypeLoc = propMediaTypeLoc || (user ? (newType ? user.newTypes[mediaType] : user[mediaType]) : null);

  // Update media tags when effectiveSelectedTags changes
  useEffect(() => {
    setMedia(prev => ({
      ...prev,
      tags: effectiveSelectedTags.map(item => item.label)
    }));
  }, [effectiveSelectedTags]);

  // Watch for URL changes and update effectiveSelectedTags
  useEffect(() => {
    const urlTags = getTagsFromURL();
    if (urlTags.length > 0) {
      setEffectiveSelectedTags(urlTags);
    }
  }, [location.search, getTagsFromURL]);

  // Ensure tags are captured on initial mount
  useEffect(() => {
    // This effect ensures the component re-renders when URL search params change
  }, [location.search]); // Include location.search dependency

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
  
  const onChange = (e) => {
    setMedia({ ...media, [e.target.id]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    // Validate title field
    if (!media.title.trim()) {
      console.log("Title is required!");
      setTitleError(true);
      
      // Focus on the title input
      document.getElementById('title').focus();
      
      // Scroll to the title label for better visibility
      const titleLabel = document.querySelector('label[for="title"]');
      if (titleLabel) {
        titleLabel.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
      
      return;
    }
    
    // Clear any previous title error
    setTitleError(false);
    
    // If custom onCreateMedia callback provided (for demo mode), use it
    if (onCreateMedia) {
      // Convert year to full date format if using year select (for demo data compatibility)
      const yearValue = useYearSelect && media.year.length === 4 
        ? `${media.year}-01-01` 
        : media.year;
      
      const newMedia = onCreateMedia({
        title: media.title,
        tier: media.tier,
        toDo: toDo,
        year: yearValue,
        tags: media.tags,
        description: media.description
      });
      
      if (newMedia) {
        // Navigate back to list
        const urlParams = new URLSearchParams(location.search);
        const currentTags = urlParams.get('tags');
        const fromParam = urlParams.get('from');
        
        let targetURL = `${basePath}/${mediaType}/${toDo ? 'to-do' : 'collection'}`;
        if (currentTags) {
          targetURL += `?tags=${currentTags}`;
          if (fromParam) {
            targetURL += `&from=${fromParam}`;
          }
        }
        navigate(targetURL);
      }
      return;
    }
    
    // Otherwise, use API (app mode)
    console.log("Attempt to Create:", media)
    axios
      .post(constants['SERVER_URL'] + '/api/media', {media: media, newType: newType})
      .then((res) => {
        console.log("Create Media success!")
        setMedia({
          title: '',
          toDo: '',
          tags: [],
          description: ''
        });
        
        navigate(-1);
      })
      .catch((err) => {
        console.log(err);
        window.alert("Create Failed :(")
      });
  };

  // console.log("Media", media);
  const years = Array.from({ length: constants.currentYear - 1969 }, (_, index) => constants.currentYear - index);
  const tiers = constants.STANDARD_TIERS;
  const tiersName = toDo ? "todoTiers" : "collectionTiers"
  const yearString = toDo ? "Date You First Wanted To Do" : "Date You First Experienced"
  
  // Determine container styling based on data source
  const containerClass = dataSource === 'demo' ? 'container py-2 py-md-3' : '';
  const containerStyle = dataSource === 'demo' ? {} : { maxWidth: '900px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' };
  const wrapperClass = dataSource === 'demo' ? 'row justify-content-center' : '';
  const cardClass = dataSource === 'demo' ? 'col-lg-10 col-md-12' : '';
  
  return (
    <div className='CreateMedia' style={{backgroundColor: theme.colors.background.primary, minHeight: '100vh', color: 'white'}}>
      <div className={containerClass || 'py-2 py-md-3'} style={containerStyle}>
        {/* Mobile layout - only visible on mobile */}
        <div className='row mb-2 d-md-none align-items-center'>
          <div className='col-3 d-flex justify-content-start'>
            <button 
              className='btn btn-outline-warning btn-xs'
              onClick={() => {
                const urlParams = new URLSearchParams(location.search);
                const currentTags = urlParams.get('tags');
                const fromParam = urlParams.get('from');
                
                let targetURL = `${basePath}/${mediaType}/${toDo ? 'to-do' : 'collection'}`;
                if (currentTags) {
                  targetURL += `?tags=${currentTags}`;
                  if (fromParam) {
                    targetURL += `&from=${fromParam}`;
                  }
                }
                navigate(targetURL);
              }}
              style={{ 
                whiteSpace: 'nowrap', 
                fontSize: '0.7rem', 
                padding: '0.5rem 0.6rem',
                minWidth: 'fit-content',
                width: '100%',
                maxWidth: '100%',
                height: 'auto',
                minHeight: '2.5rem'
              }}
            >
              <i className="fas fa-arrow-left me-1"></i>Back
            </button>
          </div>
          <div className='col-6 text-center'>
            <h1 className='fw-light text-white mb-0' style={{ 
              fontFamily: 'Roboto, sans-serif', 
              fontSize: 'clamp(18px, 5vw, 28px)',
              minFontSize: '18px',
              whiteSpace: 'nowrap'
            }}>
              { toDo ? `Add ${toCapitalNotation(mediaType)} to To-Do` : `Add ${toCapitalNotation(mediaType)} to Collection` }
            </h1>
          </div>
          <div className='col-3'></div>
        </div>

        {/* Desktop layout - hidden on mobile */}
        <div className='row mb-3 d-none d-md-flex'>
          <div className='col-md-2 d-flex align-items-center'>
            <button 
              className='btn btn-outline-warning btn-lg'
              onClick={() => {
                // Get current tags and from parameter from URL
                const urlParams = new URLSearchParams(location.search);
                const currentTags = urlParams.get('tags');
                const fromParam = urlParams.get('from');
                
                // Build the target URL preserving tags and from parameter
                let targetURL = `${basePath}/${mediaType}/${toDo ? 'to-do' : 'collection'}`;
                if (currentTags) {
                  targetURL += `?tags=${currentTags}`;
                  if (fromParam) {
                    targetURL += `&from=${fromParam}`;
                  }
                }
                
                console.log('=== Go Back Button Click ===');
                console.log('CreateMedia: Media type:', mediaType);
                console.log('CreateMedia: From parameter:', fromParam);
                console.log('CreateMedia: Going back to:', toDo ? 'to-do' : 'collection');
                console.log('CreateMedia: Target URL:', targetURL);
                navigate(targetURL);
              }}
            >
              <i className="fas fa-arrow-left me-2"></i>Go Back
            </button>
          </div>
          <div className='col-md-8 text-center'>
            { toDo ?
            <h1 className='display-4 fw-bold text-white'>Add {toCapitalNotation(mediaType)} to To-Do</h1>
            :
            <h1 className='display-4 fw-bold text-white'>Add {toCapitalNotation(mediaType)} to Collection</h1>
            }
            <div className="border-bottom border-3 border-warning w-25 mx-auto"></div>
          </div>
          <div className='col-md-2'></div>
        </div>
        
        <div className={wrapperClass}>
          <div className={cardClass}>
            <div className="card shadow-soft border-0" style={{backgroundColor: theme.colors.background.dark}}>
            <div className="card-body p-0" style={{backgroundColor: theme.colors.background.dark}}>
              <form noValidate onSubmit={onSubmit}>
                  <div className="table-responsive d-none d-md-block" style={{overflow: 'visible'}}>
                    <table className='table table-hover mb-0 text-white' style={{backgroundColor: theme.colors.background.dark, overflow: 'visible'}}>
                      <tbody style={{backgroundColor: theme.colors.background.dark}}>
                        <tr style={{backgroundColor: theme.colors.background.dark}}>
                          <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>1</th>
                          <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Title</td>
                          <td className='px-4 py-3' style={{backgroundColor: theme.colors.background.dark}}>
                            <input
                              type='text'
                              placeholder={constants[mediaType] && constants[mediaType]?.title ? constants[mediaType].title : constants['other'].title}
                              id='title'
                              className={`form-control form-control-sm ${titleError ? 'is-invalid border-danger' : ''}`}
                              value={media.title}
                              onChange={(e) => {
                                onChange(e);
                                if (titleError) {
                                  setTitleError(false);
                                }
                              }}
                              style={titleError ? {borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'} : {}}
                            />
                            {titleError && (
                              <div className="invalid-feedback d-block text-danger fw-semibold mt-1">
                                Title is required!
                              </div>
                            )}
                          </td>
                        </tr>
                        <tr style={{backgroundColor: theme.colors.background.dark}}>
                          <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>2</th>
                          <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>{yearString}</td>
                          <td className='px-4 py-3' style={{backgroundColor: theme.colors.background.dark}}>
                            {useYearSelect ? (
                              <select 
                                className='form-select form-select-sm' 
                                id='year' 
                                value={media.year.length === 4 ? media.year : media.year.split('-')[0]} 
                                onChange={onChange}
                              >
                                {years.map((year) => (
                                  <option key={year} value={year}>{year}</option>
                                ))}
                              </select>
                            ) : (
                              <input 
                                type='date'
                                className='form-control form-control-sm' 
                                id='year' 
                                value={media.year} 
                                onChange={onChange}
                                style={{ textAlign: 'left' }}
                              />
                            )}
                          </td>
                        </tr>
                        <tr style={{backgroundColor: theme.colors.background.dark}}>
                          <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>3</th>
                          <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Tier</td>
                          <td className='px-4 py-3' style={{backgroundColor: theme.colors.background.dark}}>
                            <select
                              id='tier'
                              className='form-select form-select-sm'
                              value={media.tier}
                              onChange={onChange}
                            >
                              {tiers.map((tier) => (
                                <option key={tier} value={tier}>{mediaTypeLoc && mediaTypeLoc[tiersName] ? mediaTypeLoc[tiersName][tier] : tier}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        <tr style={{backgroundColor: theme.colors.background.dark}}>
                          <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>4</th>
                          <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Tags (Optional)</td>
                          <td className='px-4 py-3' style={{backgroundColor: theme.colors.background.dark, overflow: 'visible'}}>
                            <TagMaker mediaType={mediaType} toDo={toDo} media={media} setMedia={setMedia} alreadySelected={effectiveSelectedTags} placeholder={constants[mediaType] && constants[mediaType]?.tags ? constants[mediaType].tags : constants['other'].tags} hideLabel={true} zIndex={10} dataSource={dataSource}></TagMaker>
                          </td>
                        </tr>
                        <tr style={{backgroundColor: theme.colors.background.dark}}>
                          <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>5</th>
                          <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Description (Optional)</td>
                          <td className='px-4 py-3' style={{backgroundColor: theme.colors.background.dark}}>
                            <input
                              type='text'
                              placeholder={constants[mediaType] && constants[mediaType]?.description ? constants[mediaType].description : constants['other'].description}
                              id='description'
                              className='form-control form-control-sm'
                              value={media.description}
                              onChange={onChange}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Mobile Form Layout */}
                  <div className="d-md-none p-1">
                    <div className="form-group mb-1">
                      <label className="form-label text-white fw-semibold mb-1" style={{fontSize: '0.75rem'}}><span className="text-warning">1.</span> Title</label>
                      <input
                        type='text'
                        placeholder={constants[mediaType] && constants[mediaType]?.title ? constants[mediaType].title : constants['other'].title}
                        id='title'
                        className={`form-control form-control-sm ${titleError ? 'is-invalid border-danger' : ''}`}
                        value={media.title}
                        onChange={(e) => {
                          onChange(e);
                          if (titleError) {
                            setTitleError(false);
                          }
                        }}
                        style={{
                          ...(titleError ? {borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'} : {}),
                          fontSize: '16px',
                          padding: '0.2rem 0.4rem',
                          height: 'auto',
                          minHeight: '28px'
                        }}
                      />
                      {titleError && (
                        <div className="invalid-feedback d-block text-danger fw-semibold mt-1" style={{fontSize: '0.65rem'}}>
                          Title is required!
                        </div>
                      )}
                    </div>
                    
                    <div className="form-group mb-1" style={{ textAlign: 'left' }}>
                      <label className="form-label text-white fw-semibold mb-1" style={{fontSize: '0.75rem'}}><span className="text-warning">2.</span> {yearString}</label>
                      {useYearSelect ? (
                        <select 
                          className='form-select form-select-sm' 
                          id='year' 
                          value={media.year.length === 4 ? media.year : media.year.split('-')[0]} 
                          onChange={onChange}
                          style={{
                            fontSize: '16px',
                            padding: '0.2rem 0.4rem',
                            height: 'auto',
                            minHeight: '28px'
                          }}
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type='date'
                          className='form-control form-control-sm' 
                          id='year' 
                          value={media.year} 
                          onChange={onChange}
                        style={{
                          fontSize: '16px',
                          padding: '0.2rem 0.4rem',
                          height: 'auto',
                          minHeight: '28px',
                          width: '100%',
                          textAlign: 'left'
                        }}
                        />
                      )}
                    </div>
                    
                    <div className="form-group mb-1">
                      <label className="form-label text-white fw-semibold mb-1" style={{fontSize: '0.75rem'}}><span className="text-warning">3.</span> Tier</label>
                      <select
                        id='tier'
                        className='form-select form-select-sm'
                        value={media.tier}
                        onChange={onChange}
                        style={{
                          fontSize: '16px',
                          padding: '0.2rem 0.4rem',
                          height: 'auto',
                          minHeight: '28px'
                        }}
                      >
                        {tiers.map((tier) => (
                          <option key={tier} value={tier}>
                            {mediaTypeLoc && mediaTypeLoc[tiersName] ? mediaTypeLoc[tiersName][tier] : tier}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group mb-1">
                      <label className="form-label text-white fw-semibold mb-1" style={{fontSize: '0.75rem'}}><span className="text-warning">4.</span> Tags (Optional)</label>
                      <div style={{fontSize: '0.75rem'}}>
                        <TagMaker mediaType={mediaType} toDo={toDo} media={media} setMedia={setMedia} alreadySelected={effectiveSelectedTags} placeholder={constants[mediaType] && constants[mediaType]?.tags ? constants[mediaType].tags : constants['other'].tags} hideLabel={true} zIndex={10} dataSource={dataSource}></TagMaker>
                      </div>
                    </div>
                    
                    <div className="form-group mb-1">
                      <label className="form-label text-white fw-semibold mb-1" style={{fontSize: '0.75rem'}}><span className="text-warning">5.</span> Description (Optional)</label>
                      <input
                        type='text'
                        placeholder={constants[mediaType] && constants[mediaType]?.description ? constants[mediaType].description : constants['other'].description}
                        id='description'
                        className='form-control form-control-sm'
                        value={media.description}
                        onChange={onChange}
                        style={{
                          fontSize: '16px',
                          padding: '0.2rem 0.4rem',
                          height: 'auto',
                          minHeight: '28px'
                        }}
                      />
                    </div>
                  </div>
              </form>
            </div>
          </div>
          </div>
        </div>
        
        <div className={dataSource === 'demo' ? 'row mt-2' : 'mt-2'} style={{ textAlign: 'center' }}>
          {dataSource === 'demo' && <div className='col-md-4'></div>}
          <div className={dataSource === 'demo' ? 'col-md-4 text-center' : ''}>
            <button 
              onClick={onSubmit}
              className='btn btn-warning btn-lg d-none d-md-inline-block'
            >
              <i className="fas fa-plus me-2"></i>Create Media
            </button>
            <button 
              onClick={onSubmit}
              className='btn btn-warning btn-sm d-md-none'
              style={{
                fontSize: '0.8rem',
                padding: '0.375rem 0.75rem'
              }}
            >
              <i className="fas fa-plus me-1"></i>Create Media
            </button>
          </div>
          {dataSource === 'demo' && <div className='col-md-4'></div>}
        </div>
      </div>
    </div>
  );
};

export default CreateMedia;