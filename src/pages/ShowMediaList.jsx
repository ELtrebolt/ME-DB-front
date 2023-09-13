import React, { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';

import ViewByYear from "../components/ViewByYear";
import CardsContainer from "../components/CardsContainer";
import TierTitle from "../components/TierTitle";
import TagFilter from "../components/TagFilter";
import FilterOperator from "../components/FilterOperator";

const constants = require('../constants');

function filterData(tierData, firstYear, lastYear, allTags, selectedTags, setSuggestedTags, setSearchChanged, setFilteredData, filterOperator) {
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
      if(selectedTags && selectedTags[0]) {
        if(m.tags) {
          for(const t of selectedTags) {
            if(filterOperator === 'OR') {
              if(m.tags.includes(t['label'])){
                array.push(m);
                break;
              }
            } else if(filterOperator === 'AND') {
              if(!m.tags.includes(t['label'])) {
                break;
              }
              if(selectedTags[selectedTags.length-1] === t) {
                array.push(m);
              }
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

  // Change TagsList Dynamically
  var tags_list = []
  if(filterOperator === 'OR'){
    tags_list = allTags;
  } else if(filterOperator === 'AND') {
    const allTagsList = allTags.map((item) => item['label']);
    var added_tags = new Set()
    Object.keys(data).forEach(tier => {
      data[tier].forEach(item => {
        if(item.tags) {
          item.tags.forEach(tag => {
            const foundIndex = allTagsList.indexOf(tag);
            const tagDict = { value: foundIndex, label: tag };
            if(foundIndex >= -1 && !added_tags.has(tag)) {
              tags_list.push(tagDict);
              added_tags.add(tag);
            }
          })
        }
      })
    })
  }
  setSuggestedTags(tags_list);
  setSearchChanged(false);
  return data;
}

function toCapitalNotation(inputString) {
  if(inputString === 'to-do') {
    return 'To-Do';
  }
  return inputString
    .split(' ') // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
}

function ShowMediaList({user, setUserChanged, toDo}) {
  // Data
  const [tierData, setTierData] = useState();
  const { mediaType } = useParams();
  const tiers = ["S", "A", "B", "C", "D", "F"];
  // Filters
  const [firstYear, setFirstYear] = useState();
  const current_year = new Date().getFullYear();
  const [lastYear, setLastYear] = useState(current_year);
  const [possibleYears, setPossibleYears] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [filterOperator, setFilterOperator] = useState('OR')
  const [searchChanged, setSearchChanged] = useState();
  const [filteredData, setFilteredData] = useState();
  // Modes
  const [firstLoad, setFirstLoad] = useState(true);
  const [exportMode, setExportMode] = useState(false);
  const [dataByYear, setDataByYear] = useState({});
  const [toDoState, setToDoState] = useState(toDo);
  const [toDoString, setToDoString] = useState(toDo ? 'to-do' : 'collection');
  const [tierVariable, setTierVariable] = useState(toDo ? 'todoTiers' : 'collectionTiers')
  const navigate = useNavigate();

  function switchToDo() {
    const newToDoState = !toDoState;
    setToDoState(newToDoState);
    const newToDoString = newToDoState ? 'to-do' : 'collection';
    setToDoString(newToDoString);
    setTierVariable(newToDoState ? 'todoTiers' : 'collectionTiers')
    setFirstLoad(true);
    navigate(`/${mediaType}/${newToDoString}`);
  }

  useEffect(() => {
    if(firstLoad)
    {
      // console.log('firstloading')
      axios
      .get(constants['SERVER_URL'] + '/api/media/' + mediaType + '/' + toDoString)
      .then((res) => {
        // console.log("GET /api/media/type/" + toDoString, res)
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
        var tags_set = new Set();
        var all_tags = [];
        var index = 0;
        res.data.forEach(m => {
          tiers[m.tier].push(m);
          possible_years.add(m.year)
          
          // Add All Tags
          if(m.tags) {
            m.tags.forEach((t) => {
              if(!tags_set.has(t)) {
                tags_set.add(t);
                all_tags.push({value:index, label:t})
                index += 1;
              }
            })
          }
        });
        setAllTags(all_tags);
        setTierData(tiers);
        setPossibleYears(Array.from(possible_years).sort((a, b) => a - b));
        setFirstLoad(false);
        setSearchChanged(true);
      })
      .catch((err) => {
        console.log('Error from ShowMediaList');
      });
    }
  })

  // Filtering
  if(tierData && (searchChanged === undefined || searchChanged === true)) {
    const data = filterData(tierData, firstYear, lastYear, allTags, selectedTags, setSuggestedTags, setSearchChanged, setFilteredData, filterOperator);
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
            <h3 className='display-4 text-center'>{toCapitalNotation(mediaType)} {toCapitalNotation(toDoString)} Tier List ({exportMode})</h3>
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
            Tags ({filterOperator}) = {selectedTags && selectedTags[0] ? selectedTags.map((item) => item['label']).join(', ') : 'No Tags Selected'}
            <br></br>
            <br></br>

            {exportMode === 'By-Tier' && (
              Object.keys(filteredData).map((tier) => {
                return <ul key={tier}><b>{user[mediaType][tierVariable][tier]}</b>
                  {filteredData[tier].map((item) => (
                    <li key={item.ID}>{item.title}, {item.year}</li>
                  ))}
                </ul>;
              })
            )}

            {exportMode === 'By-Year' && (
              Object.keys(dataByYear).map((year) => {
                return <ul key={year}><b>{year}</b>
                  {dataByYear[year].map((item) => (
                    <li key={item.ID}>{item.title}, {item.tier}</li>
                  ))}
                </ul>;
              })
            )}
          </div>
          <div className='col-md-2'></div>
        </div>
      </div>
    )
  } else if(user && !firstLoad && filteredData) {
  return (
    <div className='ShowMediaList'>
      <div className='container'>
        <br></br>
        <div className='row'>
          
          <div className='col-md-2'></div>

          <div className='col-md-8'>
            <h3 className='display-4 text-center'>{toCapitalNotation(mediaType)} {toCapitalNotation(toDoString)} Tier List</h3>
          </div>

          <div className='col-md-2'></div>

        </div>
        <div className='row'>
          
          {/* col-4 */}
          <ViewByYear possible_years={possibleYears} firstYear={firstYear} lastYear={lastYear} setFirstYear={setFirstYear} setLastYear={setLastYear} setSearchChanged={setSearchChanged}/>
          <div className='col-md-4'>
            <TagFilter suggestedTags={suggestedTags} selected={selectedTags} setSelected={setSelectedTags} setSearchChanged={setSearchChanged}></TagFilter>
          </div>
          <div className = 'col-md-2'>
            <FilterOperator filterOperator={filterOperator} setFilterOperator={setFilterOperator} setSearchChanged={setSearchChanged}></FilterOperator>
          </div>
          
          <div className='col-md-2 m-auto text-right'>
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
            <TierTitle title={user[mediaType][tierVariable][item]} mediaType={mediaType} group={toDoString} tier={item} setUserChanged={setUserChanged}></TierTitle>
            <CardsContainer items={filteredData[item]}/>
            <hr />
          </div>
        ))}

      <div className='container'>
        <div className='row'>
          <div className='col-md-4 m-auto'>
          <button 
            className='btn-lg btn-outline-warning float-left'
            onClick={switchToDo}
            >
            My {toCapitalNotation(toDoState ? 'collection' : 'to-do')} List
          </button>
          </div>

          <div className='col-md-4'></div>

          <div className='col-md-4 m-auto'>
            <Link
              to={`/${mediaType}/${toDoString}/create`}
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

export default ShowMediaList;