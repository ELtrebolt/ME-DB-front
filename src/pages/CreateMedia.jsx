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

const CreateMedia = ({user, toDo, newType, selectedTags}) => {
  // Define the state with useState hook
  const navigate = useNavigate();
  const { mediaType } = useParams();
  const [media, setMedia] = useState({
    mediaType: mediaType,
    title: '',
    tier: 'S',
    toDo: toDo.toString(),
    year: constants.currentYear,
    tags: selectedTags.map(item => item.label),
    description: ''
  });
  const mediaTypeLoc = newType ? user.newTypes[mediaType] : user[mediaType]
  
  const onChange = (e) => {
    setMedia({ ...media, [e.target.id]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
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
                  placeholder={constants[mediaType].title ? constants[mediaType].title : constants['other'].title}
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
                    <option key={tier} value={tier}>{mediaTypeLoc[tiersName][tier]}</option>
                  ))}
                </select>
              </div>

              <div className='form-group'>
                <TagMaker mediaType={mediaType} toDo={toDo} media={media} setMedia={setMedia} alreadySelected={selectedTags} placeholder={constants[mediaType].tags}></TagMaker>
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