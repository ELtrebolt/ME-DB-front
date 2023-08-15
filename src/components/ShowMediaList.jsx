import React, { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import MediaCard from './MediaCard';

function toCapitalNotation(inputString) {
  return inputString
    .split(' ') // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
}

function ShowMediaList({user, toDo}) {
  const [media, setMedia] = useState([]);
  const { mediaType } = useParams();
  const toDoString = toDo ? 'To-Do' : 'Collection'

  useEffect(() => {
    const headers = {
      'userID':user.ID,
      'toDo':toDo.toString(),
      'mediaType':mediaType
    }

    axios
      .get('http://localhost:8082/api/media', {headers})
      .then((res) => {
        setMedia(res.data);
      })
      .catch((err) => {
        console.log('Error from ShowMediaList');
      });
  }, [mediaType, user.ID, toDo]);

  const tiers = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
  };

  media.forEach(m => {
    tiers[m.tier].push(<MediaCard m={m}/>);
  });

  // const SList =
  //   media.length === 0
  //     ? 'there is no media record!'
  //     : media.map((m, k) => <MediaCard m={m} key={k} />);

  return (
    <div className='ShowMediaList'>
      <div className='container'>
        <br></br>
        <div className='row'>
          
          { toDo ? 
            <div className='col-md-2 mt-auto'>
            <Link
              to={`/${mediaType}/collection`}
              className='btn btn-outline-warning float-left'
              >
              My Collection
            </Link>
            </div>
          :
            <div className='col-md-2 mt-auto'>
            <Link
            to={`/${mediaType}/to-do`}
            className='btn btn-outline-warning float-left'
            >
            To Do
            </Link>
            </div>
          }

          <div className='col-md-8'>
          <h3 className='display-4 text-center'>{toCapitalNotation(mediaType)} {toDoString} Tier List</h3>
          </div>
          
          { toDo ? 
          <div className='col-md-2 mt-auto'>
            <Link
              to={`/${mediaType}/to-do/create`}
              className='btn btn-outline-warning float-left'
            >
              + Add New
            </Link>
          </div>
          :
          <div className='col-md-2 mt-auto'>
            <Link
              to={`/${mediaType}/collection/create`}
              className='btn btn-outline-warning float-right'
            >
              + Add New
            </Link>
          </div>
          }
          
        </div>
      </div>

      <hr />

      <div className='tier-container'>
        <h2 className='display-8 text-center'>{user.anime.collectionTiers.S}</h2>
        <div className='cards-container'>
          {tiers['S'].map((item, index) => (
              <div key={index}>
                {item}
              </div>
            ))}
        </div>
        <hr />
      </div>

      <div className='tier-container'>
        <h2 className='display-8 text-center'>{user.anime.collectionTiers.A}</h2>
        <div className='cards-container'>
          {tiers['A'].map((item, index) => (
              <div key={index}>
                {item}
              </div>
            ))}
        </div>
        <hr />
      </div>

      <div className='tier-container'>
        <h2 className='display-8 text-center'>{user.anime.collectionTiers.B}</h2>
        <div className='cards-container'>
        {tiers['B'].map((item, index) => (
              <div key={index}>
                {item}
              </div>
            ))}
        </div>
        <hr />
      </div>

      <div className='tier-container'>
        <h2 className='display-8 text-center'>{user.anime.collectionTiers.C}</h2>
        <div className='cards-container'>
        {tiers['C'].map((item, index) => (
              <div key={index}>
                {item}
              </div>
            ))}
        </div>
        <hr />
      </div>

      <div className='tier-container'>
        <h2 className='display-8 text-center'>{user.anime.collectionTiers.D}</h2>
        <div className='cards-container'>
        {tiers['D'].map((item, index) => (
              <div key={index}>
                {item}
              </div>
            ))}
        </div>
        <hr />
      </div>

      <div className='tier-container'>
        <h2 className='display-8 text-center'>{user.anime.collectionTiers.F}</h2>
        <div className='cards-container'>
        {tiers['F'].map((item, index) => (
              <div key={index}>
                {item}
              </div>
            ))}
        </div>
        <hr />
      </div>
    </div>
  );
}

export default ShowMediaList;