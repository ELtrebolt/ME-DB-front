import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import TagMaker from "../components/TagMaker";
const constants = require('../constants');

function toCapitalNotation(inputString) {
  return inputString
    .split(' ') // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
}

const CreateMedia = ({user, toDo, newType, selectedTags}) => {
  console.log('CreateMedia props:', { user, toDo, newType, selectedTags });
  
  const location = useLocation();
  console.log('CreateMedia: Current URL:', location.pathname + location.search);
  
  // Get selected tags from URL parameters
  const getTagsFromURL = () => {
    const urlParams = new URLSearchParams(location.search);
    const tagsParam = urlParams.get('tags');
    
    if (tagsParam) {
      const tagLabels = tagsParam.split(',');
      return tagLabels.map(label => ({ label, value: label }));
    }
    return [];
  };
  
  // Try to get selected tags from URL if props are empty
  const [effectiveSelectedTags, setEffectiveSelectedTags] = useState(() => {
    console.log('CreateMedia: Initializing effectiveSelectedTags');
    console.log('CreateMedia: selectedTags prop:', selectedTags);
    
    // First try URL parameters
    const urlTags = getTagsFromURL();
    if (urlTags.length > 0) {
      console.log('CreateMedia: Using tags from URL:', urlTags);
      return urlTags;
    }
    
    // Fall back to props
    if (selectedTags && selectedTags.length > 0) {
      console.log('CreateMedia: Using selectedTags prop:', selectedTags);
      return selectedTags;
    }
    
    console.log('CreateMedia: No tags found, returning empty array');
    return [];
  });
  
  console.log('CreateMedia: effectiveSelectedTags state:', effectiveSelectedTags);
  console.log('CreateMedia: Current URL:', location.pathname + location.search);
  
  // Define the state with useState hook
  const navigate = useNavigate();
  const { mediaType } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedTier = urlParams.get('tier');
  
  const [media, setMedia] = useState({
    mediaType: mediaType,
    title: '',
    tier: preselectedTier ? preselectedTier : 'S',
    toDo: toDo.toString(),
    year: constants.currentYear,
    tags: effectiveSelectedTags.map(item => item.label),
    description: ''
  });
  const [titleError, setTitleError] = useState(false);
  const [originalTags, setOriginalTags] = useState('');
  const mediaTypeLoc = user ? (newType ? user.newTypes[mediaType] : user[mediaType]) : null;

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
    console.log('CreateMedia: URL changed, location.search:', location.search);
    console.log('CreateMedia: getTagsFromURL result:', urlTags);
    
    // Store the original tags string for navigation
    const urlParams = new URLSearchParams(location.search);
    const tagsParam = urlParams.get('tags');
    console.log('CreateMedia: Raw tagsParam from URL:', tagsParam);
    
    if (tagsParam) {
      setOriginalTags(tagsParam);
      console.log('CreateMedia: Stored original tags:', tagsParam);
    } else {
      console.log('CreateMedia: No tags in URL');
    }
    
    if (urlTags.length > 0) {
      console.log('CreateMedia: URL changed, updating effectiveSelectedTags:', urlTags);
      setEffectiveSelectedTags(urlTags);
    }
  }, [location.search]);

  // Ensure tags are captured on initial mount
  useEffect(() => {
    console.log('CreateMedia: Component mounted, checking for tags in URL');
    const urlParams = new URLSearchParams(location.search);
    const tagsParam = urlParams.get('tags');
    console.log('CreateMedia: Initial mount - tagsParam:', tagsParam);
    
    if (tagsParam) {
      setOriginalTags(tagsParam);
      console.log('CreateMedia: Initial mount - stored original tags:', tagsParam);
    }
  }, []); // Empty dependency array = run only on mount

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
  const tiers = ['S', 'A', 'B', 'C', 'D', 'F']
  const tiersName = toDo ? "todoTiers" : "collectionTiers"
  const yearString = toDo ? "Year You First Wanted To Do" : "Year You First Experienced"
  return (
    <div className='CreateMedia' style={{backgroundColor: '#2c3e50', minHeight: '100vh', color: 'white'}}>
      <div className='container py-5'>
        <div className='row mb-4'>
          <div className='col-md-2 d-flex align-items-center'>
            <button 
              className='btn btn-outline-warning btn-lg'
              onClick={() => {
                // Get current tags and from parameter from URL
                const urlParams = new URLSearchParams(location.search);
                const currentTags = urlParams.get('tags');
                const fromParam = urlParams.get('from');
                
                // Build the target URL preserving tags and from parameter
                let targetURL = `/${mediaType}/${toDo ? 'to-do' : 'collection'}`;
                if (currentTags) {
                  targetURL += `?tags=${currentTags}`;
                  if (fromParam) {
                    targetURL += `&from=${fromParam}`;
                  }
                }
                
                console.log('=== Go Back Button Click ===');
                console.log('CreateMedia: Media type:', mediaType);
                console.log('CreateMedia: Current tags:', currentTags);
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
        
        <div className='row justify-content-center'>
          <div className='col-lg-8 col-md-10'>
            <div className="card shadow-soft border-0" style={{backgroundColor: constants.mainColors.table, border: '1px solid rgba(255,255,255,0.2)'}}>
              <div className="card-body p-5">
                <form noValidate onSubmit={onSubmit}>
                  <div className='mb-4'>
                    <label htmlFor='title' className='form-label fw-semibold text-white'>Title</label>
                    <input
                      type='text'
                      placeholder={constants[mediaType] && constants[mediaType]?.title ? constants[mediaType].title : constants['other'].title}
                      id='title'
                      className={`form-control form-control-lg ${titleError ? 'is-invalid border-danger' : ''}`}
                      value={media.title}
                      onChange={(e) => {
                        onChange(e);
                        // Clear error when user starts typing
                        if (titleError) {
                          setTitleError(false);
                        }
                      }}
                      style={titleError ? {borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'} : {}}
                    />
                    {titleError && (
                      <div className="invalid-feedback d-block text-danger fw-semibold">
                        Title is required!
                      </div>
                    )}
                  </div>

                  <div className='mb-4'>
                    <label htmlFor='year' className='form-label fw-semibold text-white'>{yearString}</label>
                    <select className='form-select form-select-lg' id='year' value={media.year} onChange={onChange}>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='mb-4'>
                    <label htmlFor='tier' className='form-label fw-semibold text-white'>Tier</label>
                    <select
                      placeholder='S'
                      id='tier'
                      className='form-select form-select-lg'
                      value={media.tier}
                      onChange={onChange}
                    >
                      {tiers.map((tier) => (
                        <option key={tier} value={tier}>{mediaTypeLoc && mediaTypeLoc[tiersName] ? mediaTypeLoc[tiersName][tier] : tier}</option>
                      ))}
                    </select>
                  </div>

                  <div className='mb-4'>
                    <TagMaker mediaType={mediaType} toDo={toDo} media={media} setMedia={setMedia} alreadySelected={effectiveSelectedTags} placeholder={constants[mediaType] && constants[mediaType]?.tags ? constants[mediaType].tags : constants['other'].tags}></TagMaker>
                  </div>
                   
                  <div className='mb-4'>
                    <label htmlFor='description' className='form-label text-white'>Description (Optional)</label>
                    <input
                      type='text'
                      placeholder={constants[mediaType] && constants[mediaType]?.description ? constants[mediaType].description : constants['other'].description}
                      id='description'
                      className='form-control form-control-lg'
                      value={media.description}
                      onChange={onChange}
                    />
                  </div>

                  <button 
                    type='submit' 
                    className='btn btn-warning btn-lg w-100'
                  >
                    <i className="fas fa-plus me-2"></i>Create Media
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMedia;