import React, { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

import ViewByYear from "../components/ViewByYear";
import CardsContainer from "../components/CardsContainer";
import TierTitle from "../components/TierTitle";
import TagFilter from "../components/TagFilter";

const constants = require('../constants');

function filterData(tierData, firstYear, lastYear, selected, setTagsList, setSearchChanged, setFilteredData) {
  var array = [];
  var data = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
  };
  // Filter by Tags
  Object.keys(tierData).forEach(tier => {
    tierData[tier].forEach(m => {
      if(selected && selected[0]) {
        if(m.tags) {
          for(const t of selected) {
            if(m.tags.includes(t['label'])){
              array.push(m);
              break;
            }
          }
        }
      } else {
        array.push(m);
      }
    })
  });
  // Filter by Years
  array.forEach(m => {
    if(firstYear && lastYear) {
      if(m.year >= firstYear && m.year <= lastYear) {
        data[m.tier].push(m);
      }
    } else if (firstYear && !lastYear && m.year >= firstYear) {
      data[m.tier].push(m);
    } else if (!firstYear && lastYear && m.year <= lastYear) {
      data[m.tier].push(m);
    }
  });
  setFilteredData(data);

  // Change TagsList
  var tags_list = []
  Object.keys(data).forEach(tier => {
    data[tier].forEach(item => {
      if(item.tags) {
        item.tags.forEach(tag => {
          if(!tags_list.includes(tag)) {
            tags_list.push(tag);
          }
        })
      }
    })
  })
  setTagsList(tags_list);
  setSearchChanged(false);
  return data;
}

function toCapitalNotation(inputString) {
  return inputString
    .split(' ') // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
}

function ShowCollection({user, setUserChanged}) {
  const [tierData, setTierData] = useState();
  const { mediaType } = useParams();
  const [firstYear, setFirstYear] = useState();
  const current_year = new Date().getFullYear()
  const [lastYear, setLastYear] = useState(current_year);
  const [firstLoad, setFirstLoad] = useState(true);
  const [exportMode, setExportMode] = useState(false);
  const tiers = ["S", "A", "B", "C", "D", "F"];
  const [possibleYears, setPossibleYears] = useState([]);
  const [dataByYear, setDataByYear] = useState({});
  const [selected, setSelected] = useState([]);
  const [tagsList, setTagsList] = useState([])
  const [searchChanged, setSearchChanged] = useState();
  const [filteredData, setFilteredData] = useState();

  useEffect(() => {
    if(firstLoad)
    {
      axios
      .get(constants['SERVER_URL'] + '/api/media/' + mediaType + '/collection')
      .then((res) => {
        // console.log("GET /api/media/type/collection", res)
        setFirstYear();
        setLastYear(current_year);
        var tiers = {
          S: [],
          A: [],
          B: [],
          C: [],
          D: [],
          F: [],
        };
        var possible_years = new Set();
        res.data.forEach(m => {
          tiers[m.tier].push(m);
          possible_years.add(m.year)
        });
        setTierData(tiers);
        setPossibleYears(Array.from(possible_years).sort((a, b) => a - b));
        setFirstLoad(false);
      })
      .catch((err) => {
        console.log('Error from ShowCollection');
      });
    }
  })

  // Filtering
  if(tierData && (searchChanged === undefined || searchChanged === true)) {
    const data = filterData(tierData, firstYear, lastYear, selected, setTagsList, setSearchChanged, setFilteredData);
    setFilteredData(data);
  }
  
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

  if(exportMode) {
    return (
      <div className='container'>
        <br></br>
        <div className='row'>
          
          <div className='col-md-2'></div>
          <div className='col-md-8'>
            <h3 className='display-4 text-center'>{toCapitalNotation(mediaType)} Collection Tier List ({exportMode})</h3>
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
            Start Year = {firstYear ? firstYear : possibleYears[0]}
            <br></br>
            End Year = {lastYear}
            <br></br>
            Tags = {selected && selected[0] ? selected.map((item) => item['label']).join(', ') : 'No Tags Selected'}
            <br></br>
            <br></br>

            {exportMode === 'By-Tier' && (
              Object.keys(filteredData).map((tier) => {
                return <ul key={tier}><b>{user[mediaType].collectionTiers[tier]}</b>
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
  } else if(user && filteredData) {
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
          
          {/* col-4 */}
          <ViewByYear possible_years={possibleYears} firstYear={firstYear} lastYear={lastYear} setFirstYear={setFirstYear} setLastYear={setLastYear} setSearchChanged={setSearchChanged}/>
          <div className='col-md-6'>
            <TagFilter tagsList={tagsList} selected={selected} setSelected={setSelected} setSearchChanged={setSearchChanged}></TagFilter>
          </div>
          {/* <div className='col-md-4'></div> */}
          
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
            <TierTitle title={user[mediaType].collectionTiers[item]} mediaType={mediaType} group="collection" tier={item} setUserChanged={setUserChanged}></TierTitle>
            <CardsContainer items={filteredData[item]}/>
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
            My To-Do List
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
}

export default ShowCollection;