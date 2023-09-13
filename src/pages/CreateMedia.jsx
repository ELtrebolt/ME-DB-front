import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TagMaker from "../components/TagMaker";
const constants = require('../constants');

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
    mediaType: mediaType,
    title: '',
    tier: 'S',
    toDo: toDo.toString(),
    year: 2023,
    tags: []
  });

  const onChange = (e) => {
    setMedia({ ...media, [e.target.id]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Attempt to Create:", media)
    axios
      .post(constants['SERVER_URL'] + '/api/media', media)
      .then((res) => {
        console.log("Create Media success!")
        setMedia({
          title: '',
          toDo: '',
          tags: []
        });
        
        navigate(-1);
      })
      .catch((err) => {
        console.log(err);
        window.alert("Create Failed :(")
      });
  };

  // console.log("Media", media);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1969 }, (_, index) => currentYear - index);
  const tiers = ['S', 'A', 'B', 'C', 'D', 'F']
  const tiersName = toDo ? "todoTiers" : "collectionTiers"
  const yearString = toDo ? "Year You First Wanted To Do" : "Year You First Experienced"
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
            { toDo ?
            <h1 className='display-4 text-center'>Add {toCapitalNotation(mediaType)} to To-Do</h1>
            :
            <h1 className='display-4 text-center'>Add {toCapitalNotation(mediaType)} to Collection</h1>
            }
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
                  placeholder={constants.examples[mediaType]}
                  id='title'
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
                  placeholder='S'
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

              <TagMaker mediaType={mediaType} toDo={toDo} media={media} setMedia={setMedia} alreadySelected={null}></TagMaker>

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