import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import TagMaker from "../components/TagMaker";
const constants = require('../constants');

function UpdateMediaInfo({user}) {
  const [media, setMedia] = useState({
    title: '',
    tier: '',
    toDo: '',
    year: '',
    tags: ''
  });
  const { mediaType, group } = useParams();
  const [tiersName, setTiersName] = useState();
  const navigate = useNavigate();
  const userID = user.group;

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
          tags: res.data.tags
        });
        setTiersName(res.data.toDo ? "todoTiers" : "collectionTiers");
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
      tags: media.tags
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
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1969 }, (_, index) => currentYear - index);
  const tiers = ['S', 'A', 'B', 'C', 'D', 'F'];
  const yearString = media.toDo ? "Year You First Wanted To Do" : "Year You First Experienced";
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
                placeholder={constants.examples[mediaType]}
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
                    <option key={tier} value={tier}>{user[mediaType][tiersName][tier]}</option>
                  ))}
                </select>
              </div>

              <div className='form-group'>
              <TagMaker mediaType={mediaType} toDo={media.toDo} media={media} setMedia={setMedia} alreadySelected={media.tags}></TagMaker>
              </div>

              <div className='form-group'>
              <label htmlFor='toDo'>To Do</label>
                <select
                  placeholder={media.toDo.toString()}
                  id='toDo'
                  className='form-control'
                  value={media.toDo}
                  onChange={onChange}
                >
                  <option value='true'>true</option>
                  <option value='false'>false</option>
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