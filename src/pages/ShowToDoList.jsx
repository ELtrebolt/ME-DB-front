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

function ShowToDoList({user, setUserChanged}) {
  const [media, setMedia] = useState([]);
  const { mediaType } = useParams();
  const [firstYear, setFirstYear] = useState();
  const current_year = new Date().getFullYear()
  const [lastYear, setLastYear] = useState(current_year);
  const [firstLoad, setFirstLoad] = useState(true);
  const [exportMode, setExportMode] = useState(false);
  const tiers = ["S", "A", "B", "C", "D", "F"];
  var possible_years = new Set();
  const [dataByYear, setDataByYear] = useState({});

  useEffect(() => {
    if(firstLoad)
    {
      axios
      .get(constants['SERVER_URL'] + '/api/media/' + mediaType + '/to-do')
      .then((res) => {
        // console.log("RES", res)
        setMedia(res.data);

        setFirstYear();
        setLastYear(current_year);
        setFirstLoad(false);
      })
      .catch((err) => {
        console.log('Error from ShowToDoList');
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

  media.forEach(m => {
    tierData[m.tier].push(m);
    possible_years.add(m.year)
  });

  // Filtering
  possible_years = Array.from(possible_years).sort((a, b) => a - b);
  const filteredData = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
  };
  media.forEach(m => {
    if(firstYear && lastYear)
    {
      if(m.year >= firstYear && m.year <= lastYear) {
        filteredData[m.tier].push(m);
      }
    }
    else if (firstYear && !lastYear && m.year >= firstYear)
    {
      filteredData[m.tier].push(m);
    }
    else if (!firstYear && lastYear && m.year <= lastYear)
    {
      filteredData[m.tier].push(m);
    }
  });

  function exportByYear() {
    var temp = {};
    Object.keys(filteredData).forEach(tier => {
      filteredData[tier].forEach(item => {
        if (temp[item.year]) {
          temp[item.year].push(item);
        } else {
          temp[item.year] = [item];
        }
      })
    });
    setDataByYear(temp);
    setExportMode("By-Year");
  }

  // console.log("Tiers",tierData)
  const firstYearString = firstYear ? firstYear : possible_years[0];
  if(exportMode) {
    return (
      <div className='container'>
        <br></br>
        <div className='row'>
          
          <div className='col-md-2'></div>
          <div className='col-md-8'>
            <h3 className='display-4 text-center'>{toCapitalNotation(mediaType)} To-Do Tier List ({exportMode})</h3>
          </div>
          <div className='col-md-2 m-auto'>     
            <button
              onClick={setExportMode.bind(null, false)}
              className='btn btn-outline-primary float-right'
              >
              Go Back
            </button>
          </div>
        </div>
        <hr></hr>
        <div className='row'>
          <div className='col-md-2'></div>
          <div className='col-md-10'>
            <b>Filters</b>
            <br></br>
            Start Year = {firstYearString}
            <br></br>
            End Year = {lastYear}
            <br></br>
            <br></br>

            {exportMode === 'By-Tier' && (
              Object.keys(filteredData).map((tier) => {
                return <ul key={tier}><b>{user[mediaType].todoTiers[tier]}</b>
                  {filteredData[tier].map((item) => (
                    <li key={item}>{item.title}, {item.year}</li>
                  ))}
                </ul>;
              })
            )}

            {exportMode === 'By-Year' && (
              Object.keys(dataByYear).map((year) => {
                return <ul key={year}><b>{year}</b>
                  {dataByYear[year].map((item) => (
                    <li key={item}>{item.title}, {item.tier}</li>
                  ))}
                </ul>;
              })
            )}
          </div>
          <div className='col-md-2'></div>
        </div>
      </div>
    )
  }
  return (
    <div className='ShowMediaList'>
      <div className='container'>
        <br></br>
        <div className='row'>
          
          <div className='col-md-2'></div>

          <div className='col-md-8'>
            <h3 className='display-4 text-center'>{toCapitalNotation(mediaType)} To-Do Tier List</h3>
          </div>

          <div className='col-md-2'></div>

        </div>
        <div className='row'>
          
          <ViewByYear possible_years={possible_years} setFirstYear={setFirstYear} setLastYear={setLastYear}/>

          <div className='col-md-6'></div>
          
          <div className='col-md-2 m-auto'>
            <div className="dropdown">
              <button className="btn btn-warning dropdown-toggle" type="button" id="exportDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Export
              </button>
              <div className="dropdown-menu" aria-labelledby="exportDropdown">
                <button className="dropdown-item" onClick={setExportMode.bind(null, 'By-Tier')}>By Tier</button>
                <button className="dropdown-item" onClick={exportByYear}>By Year</button>
              </div>
            </div>  
          </div>
          
        </div>
      </div>

      <hr />

      {tiers.map((item, index) => (
          <div className='tier-container' key={item}>
            <TierTitle title={user[mediaType].todoTiers[item]} mediaType={mediaType} group="todo" tier={item} setUserChanged={setUserChanged}></TierTitle>
            <CardsContainer items={tierData[item]} firstYear={firstYear} lastYear={lastYear}/>
            <hr />
          </div>
        ))}

      <div className='container'>
        <div className='row'>
          <div className='col-md-4 m-auto'>
          <Link 
            to={`/${mediaType}/collection`}
            className='btn-lg btn-outline-warning float-left'
            >
            My Collection
          </Link>
          </div>

          <div className='col-md-4'></div>

          <div className='col-md-4 m-auto'>
            <Link
              to={`/${mediaType}/to-do/create`}
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

export default ShowToDoList;