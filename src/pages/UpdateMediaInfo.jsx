import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import TagMaker from "../components/TagMaker";
const constants = require('../constants');

function UpdateMediaInfo({user, newType}) {
  const [media, setMedia] = useState({
    title: '',
    tier: '',
    toDo: '',
    year: '',
    tags: '',
    description: ''
  });
  const { mediaType, group } = useParams();
  const [tiersName, setTiersName] = useState();
  const [yearString, setYearString] = useState();
  const navigate = useNavigate();
  const userID = user.group;
  const mediaTypeLoc = user ? (newType ? user.newTypes[mediaType] : user[mediaType]) : null;

  // Redirect to login if user is not authenticated
  if (!user) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <h3>Session Expired</h3>
            <p>Your session has expired. Please log in again to continue.</p>
            <Link to="/" className="btn btn-primary">Go to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if(!media.tier) {
      axios
      .get(constants['SERVER_URL'] + `/api/media/${mediaType}/${group}`)
      .then((res) => {
        console.log("Update GET /api/media/type/group", res.data);
        setMedia({
          title: res.data.title,
          tier: res.data.tier,
          toDo: res.data.toDo,
          year: res.data.year,
          tags: res.data.tags,
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
  });
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
      .put(constants['SERVER_URL'] + `/api/media/${mediaType}/${group}`, data)
      .then((res) => {
        console.log("PUT /api/media/type/group", data);
        navigate(`/${mediaType}/${group}`);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  console.log(tiersName);
  const years = Array.from({ length: constants.currentYear - 1969 }, (_, index) => constants.currentYear - index);
  const tiers = ['S', 'A', 'B', 'C', 'D', 'F'];
  const listType = media.toDo ? "To-Do List" : "My Collection";
  if(media.tags !== '') {
  return (
    <div className='UpdateMediaInfo'>
      <div className='container'>
        <br></br>
        <div className='row'>
          <div className='col-md-2 m-auto'>
            <Link to={`/${mediaType}/${group}`} className='btn btn-outline-warning float-left'>
              Go Back
            </Link>
          </div>
          <div className='col-md-8 m-auto'>
            <h1 className='display-4 text-center'>Edit Media</h1>
            <hr></hr>
          </div>
          <div className='col-md-2 m-auto'></div>
        </div>

        <div className='col-md-8 m-auto'>
          <form noValidate onSubmit={onSubmit}>
            <div className='form-group'>
              <label htmlFor='title'>Title</label>
              <input
                type='text'
                id='title'
                placeholder={constants[mediaType].title ? constants[mediaType].title : constants['other'].title}
                className='form-control'
                value={media.title}
                onChange={onChange}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='year'>{yearString}</label>
                <select className='form-control' id='year' value={media.year} onChange={onChange}>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

            <div className='form-group'>
              <label htmlFor='tier'>Tier</label>
                <select
                  placeholder={media.tier}
                  id='tier'
                  className='form-control'
                  value={media.tier}
                  onChange={onChange}
                >
                  {tiers.map((tier) => (
                    <option key={tier} value={tier}>{mediaTypeLoc && mediaTypeLoc[tiersName] ? mediaTypeLoc[tiersName][tier] : tier}</option>
                  ))}
                </select>
              </div>

              <div className='form-group'>
                <TagMaker mediaType={mediaType} toDo={media.toDo} media={media} setMedia={setMedia} alreadySelected={media.tags} placeholder={constants[mediaType].tags}></TagMaker>
              </div>

              <label htmlFor='description'>Description (Optional)</label>
              <div className='form-group'>
                <input
                  type='text'
                  placeholder={constants[mediaType].description}
                  id='description'
                  className='form-control'
                  value={media.description}
                  onChange={onChange}
                />
              </div>

              <div className='form-group'>
              <label htmlFor='toDo'>List Type</label>
                <select
                  placeholder={listType}
                  id='toDo'
                  className='form-control'
                  value={media.toDo}
                  onChange={onChange}
                >
                  <option value='true'>To-Do List</option>
                  <option value='false'>My Collection</option>
                </select>
              </div>

            <button
              type='submit'
              className='btn btn-outline-info btn-lg btn-block'
            >
              Update Media
            </button>
          </form>
        </div>
      </div>
    </div>
  );
  }
}

export default UpdateMediaInfo;