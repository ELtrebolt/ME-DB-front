import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

function toCapitalNotation(inputString) {
  return inputString
    .split(' ') // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
}

const CreateMedia = ({user, toDo}) => {
  // Define the state with useState hook
  const navigate = useNavigate();
  const { mediaType } = useParams();
  const [media, setMedia] = useState({
    userID: user.ID,
    mediaType: mediaType,
    title: '',
    tier: 'S',
    toDo: toDo.toString(),
    year: 2023,
  });

  const onChange = (e) => {
    setMedia({ ...media, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Attempt to Create:", media)
    axios
      .post('http://localhost:8082/api/media', media)
      .then((res) => {
        console.log("Create Media success!")
        setMedia({
          title: '',
          toDo: '',
        });
        
        // Push to /
        navigate('/');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1969 }, (_, index) => currentYear - index);
  return (
    <div className='CreateMedia'>
      <div className='container'>
        <br></br>
        <div className='row'>
          <div className='col-md-2 m-auto'>
            { toDo ? 
            <Link to={`/${mediaType}/to-do`} className='btn btn-outline-warning float-left'>
              Go Back
            </Link>
            :
            <Link to={`/${mediaType}/collection`} className='btn btn-outline-warning float-left'>
              Go Back
            </Link>
            }
          </div>
          <div className='col-md-8 m-auto'>
            <h1 className='display-4 text-center'>Add {toCapitalNotation(mediaType)}</h1>
            <hr />
          </div>
          <div className='col-md-2 m-auto'></div>
        </div>
        <div className='row'>
          <div className='col-md-2 m-auto'></div>
          <div className='col-md-8 m-auto'>
          <form noValidate onSubmit={onSubmit}>
              <label htmlFor='title'>Title</label>
              <div className='form-group'>
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
                  placeholder='S'
                  name='tier'
                  className='form-control'
                  value={media.tier}
                  onChange={onChange}
                >
                  <option value='S'>S - {user.anime.collectionTiers.S}</option>
                  <option value='A'>A - {user.anime.collectionTiers.A}</option>
                  <option value='B'>B - {user.anime.collectionTiers.B}</option>
                  <option value='C'>C - {user.anime.collectionTiers.C}</option>
                  <option value='D'>D - {user.anime.collectionTiers.D}</option>
                  <option value='F'>F - {user.anime.collectionTiers.F}</option>
                </select>
              </div>

              <input
                type='submit'
                className='btn btn-outline-warning btn-block mt-4'
              />
            </form>
          </div>
            <div className='col-md-2 m-auto'></div>
        </div>
      </div>
    </div>
  );
};

export default CreateMedia;