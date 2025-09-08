import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TagMaker from "../components/TagMaker";
const constants = require('../constants');

function UpdateMediaInfo({user, newType}) {
  const [media, setMedia] = useState({
    title: '',
    tier: '',
    toDo: '',
    year: '',
    tags: [],
    description: ''
  });
  const { mediaType, id } = useParams();
  const [tiersName, setTiersName] = useState();
  const [yearString, setYearString] = useState();
  const navigate = useNavigate();
  const userID = user.group;
  const mediaTypeLoc = user ? (newType ? user.newTypes[mediaType] : user[mediaType]) : null;

  useEffect(() => {
    if(!media.tier) {
      axios
      .get(constants['SERVER_URL'] + `/api/media/${mediaType}/${id}`)
      .then((res) => {
        console.log("Update GET /api/media/type/id", res.data);
        setMedia({
          title: res.data.title,
          tier: res.data.tier,
          toDo: res.data.toDo,
          year: res.data.year,
          tags: res.data.tags || [],
          description: res.data.description
        });
        setTiersName(res.data.toDo ? "todoTiers" : "collectionTiers");
        setYearString(res.data.toDo ? "Year You First Wanted To Do" : "Year You First Experienced");
        // if(res.data.tags && res.data.tags[0]) {
        //   setMedia({...media, tags: res.data.tags,})
        // }
      })
      .catch((err) => {
        console.log(err);
      });
    }
  }, [mediaType, id, media.tier]);
  // info

  const onChange = (e) => {
    setMedia({ ...media, [e.target.id]: e.target.value });
    if(e.target.id === 'toDo') {
      setTiersName(e.target.value === 'true' ? "todoTiers" : "collectionTiers");
      setYearString(e.target.value === 'true' ? "Year You First Wanted To Do" : "Year You First Experienced");
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const data = {
      userID: userID,
      title: media.title,
      tier: media.tier,
      toDo: media.toDo,
      year: media.year,
      tags: media.tags,
      description: media.description
    };

    axios
      .put(constants['SERVER_URL'] + `/api/media/${mediaType}/${id}`, data)
      .then((res) => {
        console.log("PUT /api/media/type/id", data);
        navigate(`/${mediaType}/${id}`);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  console.log(tiersName);
  const years = Array.from({ length: constants.currentYear - 1969 }, (_, index) => constants.currentYear - index);
  const tiers = ['S', 'A', 'B', 'C', 'D', 'F'];
  const listType = media.toDo ? "To-Do List" : "My Collection";
  
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
  
  if(media.tags !== null && media.tags !== undefined) {
  return (
    <div className='UpdateMediaInfo min-vh-100' style={{backgroundColor: constants.mainColors.background, color: 'white'}}>
      <div className='container py-5'>
        <div className='row mb-4'>
          <div className='col-md-2 d-flex align-items-center'>
            <Link to={`/${mediaType}/${id}`} className='btn btn-outline-warning btn-lg'>
              <i className="fas fa-arrow-left me-2"></i>Go Back
            </Link>
          </div>
          <div className='col-md-8 text-center'>
            <h1 className='display-4 fw-bold text-white'>Edit Media</h1>
            <div className="border-bottom border-3 border-warning w-25 mx-auto"></div>
          </div>
          <div className='col-md-2'></div>
        </div>

        <div className='row justify-content-center'>
          <div className='col-lg-8 col-md-10'>
            <div className="card shadow-soft border-0" style={{backgroundColor: constants.mainColors.table, border: '2px solid white'}}>
              <div className="card-body p-3">
                <form noValidate onSubmit={onSubmit}>
                  <div className='mb-3'>
                    <label htmlFor='title' className='form-label fw-semibold text-white'>Title</label>
                    <input
                      type='text'
                      id='title'
                      placeholder={constants[mediaType] && constants[mediaType]?.title ? constants[mediaType].title : constants['other'].title}
                      className='form-control form-control-md'
                      value={media.title}
                      onChange={onChange}
                    />
                  </div>

                  <div className='mb-3'>
                    <label htmlFor='year' className='form-label fw-semibold text-white'>{yearString}</label>
                    <select className='form-select form-select-md' id='year' value={media.year} onChange={onChange}>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='mb-3'>
                    <label htmlFor='tier' className='form-label fw-semibold text-white'>Tier</label>
                    <select
                      placeholder={media.tier}
                      id='tier'
                      className='form-select form-select-md'
                      value={media.tier}
                      onChange={onChange}
                    >
                      {tiers.map((tier) => (
                        <option key={tier} value={tier}>{mediaTypeLoc && mediaTypeLoc[tiersName] ? mediaTypeLoc[tiersName][tier] : tier}</option>
                      ))}
                    </select>
                  </div>

                  <div className='mb-3'>
                    <TagMaker 
                      mediaType={mediaType} 
                      toDo={media.toDo} 
                      media={media} 
                      setMedia={setMedia} 
                      alreadySelected={media.tags ? media.tags.map(tag => ({ label: tag, value: tag })) : []} 
                      placeholder={constants[mediaType] && constants[mediaType]?.tags ? constants[mediaType].tags : constants['other'].tags}
                    />
                  </div>

                  <div className='mb-3'>
                    <label htmlFor='description' className='form-label fw-semibold text-white'>Description (Optional)</label>
                    <input
                      type='text'
                      placeholder={constants[mediaType] && constants[mediaType]?.description ? constants[mediaType].description : constants['other'].description}
                      id='description'
                      className='form-control form-control-md'
                      value={media.description}
                      onChange={onChange}
                    />
                  </div>

                  <div className='mb-3'>
                    <label htmlFor='toDo' className='form-label fw-semibold text-white'>List Type</label>
                    <select
                      placeholder={listType}
                      id='toDo'
                      className='form-select form-select-md'
                      value={media.toDo}
                      onChange={onChange}
                    >
                      <option value='true'>To-Do List</option>
                      <option value='false'>My Collection</option>
                    </select>
                  </div>

                  <button 
                    type='submit' 
                    className='btn btn-warning btn-md w-100'
                  >
                    <i className="fas fa-save me-2"></i>Update Media
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  }
}

export default UpdateMediaInfo;