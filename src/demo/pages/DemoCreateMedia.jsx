import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDemoData } from "../hooks/useDemoData";
import DemoTagMaker from "../components/DemoTagMaker";

const constants = require('../../app/constants');
const theme = require('../../styling/theme');

function toCapitalNotation(inputString) {
  return inputString
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

const DemoCreateMedia = ({ toDo }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mediaType } = useParams();
  
  const { createMedia } = useDemoData(mediaType);
  
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
  
  const [effectiveSelectedTags, setEffectiveSelectedTags] = useState(() => {
    const urlTags = getTagsFromURL();
    return urlTags.length > 0 ? urlTags : [];
  });
  
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedTier = urlParams.get('tier');
  
  const [media, setMedia] = useState({
    mediaType: mediaType,
    title: '',
    tier: preselectedTier ? preselectedTier : 'S',
    toDo: toDo,
    year: new Date().toISOString().split('T')[0],
    tags: effectiveSelectedTags.map(item => item.label),
    description: ''
  });
  const [titleError, setTitleError] = useState(false);

  // Update media tags when effectiveSelectedTags changes
  useEffect(() => {
    setMedia(prev => ({
      ...prev,
      tags: effectiveSelectedTags.map(item => item.label)
    }));
  }, [effectiveSelectedTags]);

  // Watch for URL changes
  useEffect(() => {
    const urlTags = getTagsFromURL();
    if (urlTags.length > 0) {
      setEffectiveSelectedTags(urlTags);
    }
  }, [location.search, getTagsFromURL]);
  
  const onChange = (e) => {
    setMedia({ ...media, [e.target.id]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    // Validate title field
    if (!media.title.trim()) {
      setTitleError(true);
      document.getElementById('title').focus();
      return;
    }
    
    setTitleError(false);
    
    // Create media using the hook
    const newMedia = createMedia({
      title: media.title,
      tier: media.tier,
      toDo: toDo,
      year: media.year,
      tags: media.tags,
      description: media.description
    });
    
    if (newMedia) {
      // Navigate back to list
      const urlParams = new URLSearchParams(location.search);
      const currentTags = urlParams.get('tags');
      const fromParam = urlParams.get('from');
      
      let targetURL = `/demo/${mediaType}/${toDo ? 'to-do' : 'collection'}`;
      if (currentTags) {
        targetURL += `?tags=${currentTags}`;
        if (fromParam) {
          targetURL += `&from=${fromParam}`;
        }
      }
      navigate(targetURL);
    }
  };

  const years = Array.from({ length: constants.currentYear - 1969 }, (_, index) => constants.currentYear - index);
  const tiers = ['S', 'A', 'B', 'C', 'D', 'F'];
  const yearString = toDo ? "Date You First Wanted To Do" : "Date You First Experienced";
  
  return (
    <div className='CreateMedia' style={{backgroundColor: theme.colors.background.primary, minHeight: '100vh', color: 'white'}}>
      <div className='container py-2 py-md-3'>
        {/* Mobile layout */}
        <div className='row mb-2 d-md-none align-items-center'>
          <div className='col-3 d-flex justify-content-start'>
            <button 
              className='btn btn-outline-warning btn-xs'
              onClick={() => {
                const urlParams = new URLSearchParams(location.search);
                const currentTags = urlParams.get('tags');
                const fromParam = urlParams.get('from');
                
                let targetURL = `/demo/${mediaType}/${toDo ? 'to-do' : 'collection'}`;
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
                width: '100%'
              }}
            >
              <i className="fas fa-arrow-left me-1"></i>Back
            </button>
          </div>
          <div className='col-6 text-center'>
            <h1 className='fw-light text-white mb-0' style={{ 
              fontFamily: 'Roboto, sans-serif', 
              fontSize: 'clamp(18px, 5vw, 28px)',
              whiteSpace: 'nowrap'
            }}>
              { toDo ? `Add ${toCapitalNotation(mediaType)} to To-Do` : `Add ${toCapitalNotation(mediaType)} to Collection` }
            </h1>
          </div>
          <div className='col-3'></div>
        </div>

        {/* Desktop layout */}
        <div className='row mb-3 d-none d-md-flex'>
          <div className='col-md-2 d-flex align-items-center'>
            <button 
              className='btn btn-outline-warning btn-lg'
              onClick={() => {
                const urlParams = new URLSearchParams(location.search);
                const currentTags = urlParams.get('tags');
                const fromParam = urlParams.get('from');
                
                let targetURL = `/demo/${mediaType}/${toDo ? 'to-do' : 'collection'}`;
                if (currentTags) {
                  targetURL += `?tags=${currentTags}`;
                  if (fromParam) {
                    targetURL += `&from=${fromParam}`;
                  }
                }
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
        
        <div className='row justify-content-center'>
          <div className='col-lg-10 col-md-12'>
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
                                if (titleError) setTitleError(false);
                              }}
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
                            <input 
                              type='date'
                              className='form-control form-control-sm' 
                              id='year' 
                              value={media.year} 
                              onChange={onChange}
                            />
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
                                <option key={tier} value={tier}>{tier}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        <tr style={{backgroundColor: theme.colors.background.dark}}>
                          <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>4</th>
                          <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Tags (Optional)</td>
                          <td className='px-4 py-3' style={{backgroundColor: theme.colors.background.dark, overflow: 'visible'}}>
                            <DemoTagMaker 
                              mediaType={mediaType} 
                              media={media} 
                              setMedia={setMedia} 
                              alreadySelected={effectiveSelectedTags} 
                              placeholder={constants[mediaType] && constants[mediaType]?.tags ? constants[mediaType].tags : constants['other'].tags} 
                              hideLabel={true} 
                              zIndex={10}
                            />
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
                          if (titleError) setTitleError(false);
                        }}
                        style={{fontSize: '0.75rem', padding: '0.2rem 0.4rem'}}
                      />
                      {titleError && (
                        <div className="invalid-feedback d-block text-danger fw-semibold mt-1" style={{fontSize: '0.65rem'}}>
                          Title is required!
                        </div>
                      )}
                    </div>
                    
                    <div className="form-group mb-1">
                      <label className="form-label text-white fw-semibold mb-1" style={{fontSize: '0.75rem'}}><span className="text-warning">2.</span> {yearString}</label>
                      <select 
                        className='form-select form-select-sm' 
                        id='year' 
                        value={media.year} 
                        onChange={onChange}
                        style={{fontSize: '0.75rem', padding: '0.2rem 0.4rem'}}
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group mb-1">
                      <label className="form-label text-white fw-semibold mb-1" style={{fontSize: '0.75rem'}}><span className="text-warning">3.</span> Tier</label>
                      <select
                        id='tier'
                        className='form-select form-select-sm'
                        value={media.tier}
                        onChange={onChange}
                        style={{fontSize: '0.75rem', padding: '0.2rem 0.4rem'}}
                      >
                        {tiers.map((tier) => (
                          <option key={tier} value={tier}>{tier}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group mb-1">
                      <label className="form-label text-white fw-semibold mb-1" style={{fontSize: '0.75rem'}}><span className="text-warning">4.</span> Tags (Optional)</label>
                      <div style={{fontSize: '0.75rem'}}>
                        <DemoTagMaker 
                          mediaType={mediaType} 
                          media={media} 
                          setMedia={setMedia} 
                          alreadySelected={effectiveSelectedTags} 
                          placeholder={constants[mediaType] && constants[mediaType]?.tags ? constants[mediaType].tags : constants['other'].tags} 
                          hideLabel={true} 
                          zIndex={10}
                        />
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
                        style={{fontSize: '0.75rem', padding: '0.2rem 0.4rem'}}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        <div className='row mt-2'>
          <div className='col-md-4'></div>
          <div className='col-md-4 text-center'>
            <button 
              onClick={onSubmit}
              className='btn btn-warning btn-lg d-none d-md-inline-block'
            >
              <i className="fas fa-plus me-2"></i>Create Media
            </button>
            <button 
              onClick={onSubmit}
              className='btn btn-warning btn-sm d-md-none'
              style={{fontSize: '0.8rem', padding: '0.375rem 0.75rem'}}
            >
              <i className="fas fa-plus me-1"></i>Create Media
            </button>
          </div>
          <div className='col-md-4'></div>
        </div>
      </div>
    </div>
  );
};

export default DemoCreateMedia;
