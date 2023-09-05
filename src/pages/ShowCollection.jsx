import React, { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

import ViewByYear from "../components/ViewByYear";
import CardsContainer from "../components/CardsContainer";
import TierTitle from "../components/TierTitle";

const constants = require('../constants');

function toCapitalNotation(inputString) {
  return inputString
    .split(' ') // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
}

function ShowCollection({user, setUserChanged}) {
  const [media, setMedia] = useState([]);
  const { mediaType } = useParams();
  const [firstYear, setFirstYear] = useState();
  const current_year = new Date().getFullYear()
  const [lastYear, setLastYear] = useState(current_year);

  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    if(firstLoad)
    {
      axios
      .get(constants['SERVER_URL'] + '/api/media/' + mediaType + '/collection')
      .then((res) => {
        // console.log("RES", res)
        setMedia(res.data);
        
        setFirstYear();
        setLastYear(current_year);
        setFirstLoad(false);
      })
      .catch((err) => {
        console.log('Error from ShowCollection');
      });
    }
  });

  const tierData = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
  };

  var possible_years = new Set();
  media.forEach(m => {
    tierData[m.tier].push(m);
    possible_years.add(m.year)
  });

  possible_years = Array.from(possible_years).sort((a, b) => a - b);
  // console.log("Tiers",tierData)
  const tiers = ["S", "A", "B", "C", "D", "F"];

  return (
    <div className='ShowMediaList'>
      <div className='container'>
        <br></br>
        <div className='row'>
          
          <div className='col-md-2'></div>

          <div className='col-md-8'>
            <h3 className='display-4 text-center'>{toCapitalNotation(mediaType)} Collection Tier List</h3>
          </div>

          <div className='col-md-2'></div>

        </div>
        <div className='row'>
          
          <ViewByYear possible_years={possible_years} setFirstYear={setFirstYear} setLastYear={setLastYear}/>

          <div className='col-md-6'></div>
          
          <div className='col-md-2 m-auto'>
            <Link
              to={`/${mediaType}/to-do/export`}
              className='btn btn-outline-warning float-right'
              >
              Export
            </Link>
          </div>
          
        </div>
      </div>

      <hr />

      {tiers.map((item, index) => (
          <div className='tier-container' key={item}>
            <TierTitle title={user[mediaType].collectionTiers[item]} mediaType={mediaType} group="collection" tier={item} setUserChanged={setUserChanged}></TierTitle>
            <CardsContainer items={tierData[item]} firstYear={firstYear} lastYear={lastYear}/>
            <hr />
          </div>
        ))}

      <div className='container'>
        <div className='row'>
          <div className='col-md-4 m-auto'>
          <Link 
            to={`/${mediaType}/to-do`}
            className='btn-lg btn-outline-warning float-left'
            >
            To Do
          </Link>
          </div>

          <div className='col-md-4'></div>

          <div className='col-md-4 m-auto'>
            <Link
              to={`/${mediaType}/collection/create`}
              className='btn-lg btn-outline-warning float-right'
            >
              + Add New
            </Link>
          </div>

        </div>
      </div>

      </div>
  );
}

export default ShowCollection;