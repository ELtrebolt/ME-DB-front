import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
const constants = require('../constants');

function UpdateMediaInfo({user}) {
  const [media, setMedia] = useState({
    title: '',
    tier: '',
    toDo: '',
    year: '',
  });
  const { mediaType, group } = useParams();
  const navigate = useNavigate();
  const userID = user.group

  useEffect(() => {
    axios
      .get(constants['SERVER_URL'] + `/api/media/${mediaType}/${group}`)
      .then((res) => {
        console.log("/api/media/type/group", res);
        setMedia({
          title: res.data.title,
          tier: res.data.tier,
          toDo: res.data.toDo,
          year: res.data.year,
        });
      })
      .catch((err) => {
        console.log('Error from UpdateMediaInfo');
      });
  }, [mediaType, group]);
  // info

  const onChange = (e) => {
    setMedia({ ...media, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const data = {
      userID: userID,
      title: media.title,
      tier: media.tier,
      toDo: media.toDo,
      year: media.year,
    };

    axios
      .put(constants['SERVER_URL'] + `/api/media/${mediaType}/${group}`, data)
      .then((res) => {
        navigate(`/${mediaType}/${group}`);
      })
      .catch((err) => {
        console.log('Error in UpdateMediaInfo!');
      });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1969 }, (_, index) => currentYear - index);
  const tiers = ['S', 'A', 'B', 'C', 'D', 'F']
  const tiersName = media.toDo ? "todoTiers" : "collectionTiers"
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
                placeholder='Title'
                name='title'
                className='form-control'
                value={media.title}
                onChange={onChange}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='year'>Year</label>
                <select className='form-control' name='year' value={media.year} onChange={onChange}>
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
                  name='tier'
                  className='form-control'
                  value={media.tier}
                  onChange={onChange}
                >
                  {tiers.map((tier) => (
                    <option value={tier}>{user[mediaType][tiersName][tier]}</option>
                  ))}
                </select>
              </div>

              <div className='form-group'>
              <label htmlFor='toDo'>To Do</label>
                <select
                  placeholder={media.toDo}
                  name='toDo'
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

export default UpdateMediaInfo;