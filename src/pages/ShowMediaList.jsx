import React, { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

import ViewByYear from "../components/ViewByYear";
import CardsContainer from "../components/CardsContainer";

const constants = require('../constants');

function toCapitalNotation(inputString) {
  return inputString
    .split(' ') // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
}

function ShowMediaList({user, toDo}) {
  const [media, setMedia] = useState([]);
  const { mediaType } = useParams();
  const [firstYear, setFirstYear] = useState();
  const current_year = new Date().getFullYear()
  const [lastYear, setLastYear] = useState(current_year);

  const toDoString = toDo ? 'To-Do' : 'Collection'

  const resetFilters = () => {
    setFirstYear();
    setLastYear(current_year)
  }

  useEffect(() => {
    const headers = {
      'userID':user.ID,
      'toDo':toDo.toString(),
      'mediaType':mediaType
    }

    axios
      .get(constants['SERVER_URL'] + '/api/media', {headers})
      .then((res) => {
        // console.log("RES", res)
        setMedia(res.data);
        resetFilters();
      })
      .catch((err) => {
        console.log('Error from ShowMediaList');
      });
  });

  const tiers = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
  };

  var possible_years = new Set();
  media.forEach(m => {
    tiers[m.tier].push(m);
    possible_years.add(m.year)
  });

  possible_years = Array.from(possible_years).sort((a, b) => a - b);
  console.log("firstYear",firstYear)
  console.log("lastYear", lastYear)
  // console.log("Tiers",tiers)

  return (
    <div className='ShowMediaList'>
      <div className='container'>
        <br></br>
        <div className='row'>
          
          <div className='col-md-2'></div>

          <div className='col-md-8'>
            <h3 className='display-4 text-center'>{toCapitalNotation(mediaType)} {toDoString} Tier List</h3>
          </div>

          <div className='col-md-2'></div>

        </div>
        <div className='row'>
          
          <ViewByYear possible_years={possible_years} setFirstYear={setFirstYear} setLastYear={setLastYear}/>

          <div className='col-md-6'></div>
          
          { toDo ? 
            <div className='col-md-2 m-auto'>
              <Link
                to={`/${mediaType}/collection/export`}
                className='btn btn-outline-warning float-right'
              >
              Export
              </Link>
            </div>
            :
            <div className='col-md-2 m-auto'>
              <Link
                to={`/${mediaType}/to-do/export`}
                className='btn btn-outline-warning float-right'
                >
                Export
              </Link>
            </div>
          }
          
        </div>
      </div>

      <hr />

      <div className='tier-container'>
        <h2 className='display-8 text-center'>{user.anime.collectionTiers.S}</h2>
        <CardsContainer items={tiers['S']} firstYear={firstYear} lastYear={lastYear}/>
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

      <div className='container'>
        <div className='row'>
          { toDo ? 
            <div className='col-md-4 m-auto'>
            <Link
              to={`/${mediaType}/collection`}
              className='btn-lg btn-outline-warning float-left'
              >
              My Collection
            </Link>
            </div>
          :
            <div className='col-md-4 m-auto'>
            <Link
              to={`/${mediaType}/to-do`}
              className='btn-lg btn-outline-warning float-left'
              >
              To Do
            </Link>
            </div>
          }

          <div className='col-md-4'></div>

          { toDo ? 
            <div className='col-md-4 m-auto'>
              <Link
                to={`/${mediaType}/to-do/create`}
                className='btn-lg btn-outline-warning float-right'
              >
                + Add New
              </Link>
            </div>
            :
            <div className='col-md-4 m-auto'>
              <Link
                to={`/${mediaType}/collection/create`}
                className='btn-lg btn-outline-warning float-right'
              >
                + Add New
              </Link>
            </div>
          }
        </div>
      </div>

      </div>
  );
}

export default ShowMediaList;