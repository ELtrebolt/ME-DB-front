import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import '../App.css';
import axios from 'axios';
import DeleteModal from "../components/DeleteModal";
import useSwipe from "../useSwipe.tsx";
const constants = require('../constants');

function toCapitalNotation(inputString) {
  return inputString
    .split(' ') // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
}

function ShowMediaDetails({user, newType, filteredData}) {
  const [media, setMedia] = useState({});
  const { mediaType, group } = useParams();
  const [loaded, setLoaded] = useState(false)
  const [curIndex, setCurIndex] = useState(0);
  const mediaList = filteredData ? Object.values(filteredData).reduce((acc, val) => acc.concat(val), []) : [];
  const navigate = useNavigate();
  const mediaTypeLoc = user ? (newType ? user.newTypes[mediaType] : user[mediaType]) : null;

  // Redirect to login if user is not authenticated
  if (!user) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <h3>Session Expired</h3>
            <p>Your session has expired. Please log in again to continue.</p>
            <Link to="/" className="btn btn-primary">Go to Login</Link>
          </div>
        </div>
      </div>
    );
  }
  
  useEffect(() => {
    if(!loaded) {
      axios
      .get(constants['SERVER_URL'] + `/api/media/${mediaType}/${group}`)
      .then((res) => {
        if(!res.data) {
          navigate('/404')
        } else {
          console.log("Details GET /api/media/type/id", res.data)
          setMedia(res.data);
          
          for(let i = 0; i < mediaList.length; i++) {
            if(mediaList[i].title === res.data.title) {
              setCurIndex(i);
            }
          }
          setLoaded(true);
        }
      })
      .catch((err) => {
        console.log('Error from ShowMediaDetails');
    });
    }
  });

  function onDeleteClick() {
    axios
      .delete(constants['SERVER_URL'] + `/api/media/${mediaType}/${group}`)
      .then((res) => {
        // Use the media object's toDo property as fallback if res.data.toDo is undefined
        const groupStr = (res.data && res.data.toDo === true) || media.toDo === true ? 'to-do' : 'collection';
        navigate(`/${mediaType}/${groupStr}`);
      })
      .catch((err) => {
        console.log('Error from ShowMediaDetails_deleteClick:', err);
      });
  };

  function onNextShortcut() {
    var nextIndex = curIndex+1;
    if(nextIndex === mediaList.length){
      nextIndex = 0;
    }
    setCurIndex(nextIndex);
    nextIndex = mediaList[nextIndex].ID.toString();
    navigate(`/${mediaType}/${nextIndex}`);
    setLoaded(false);
  }
  function onPreviousShortcut() {
    var prevIndex = curIndex-1;
    if(prevIndex === -1){
      prevIndex = mediaList.length-1;
    }
    setCurIndex(prevIndex);
    prevIndex = mediaList[prevIndex].ID.toString();
    navigate(`/${mediaType}/${prevIndex}`);
    setLoaded(false);
  }
  const swipeHandlers = useSwipe({ onSwipedLeft: onNextShortcut, onSwipedRight: onPreviousShortcut });
  
  const tiersVariable = media.toDo ? 'todoTiers' : 'collectionTiers';
  const listType = media.toDo ? 'To-Do List' : 'My Collection' 
  return (
    <div className='ShowMediaDetails' {...swipeHandlers}>
      <div className='container'>
        <br></br>
        <div className='row'>
          <div className='col-md-2 m-auto d-flex justify-content-end'>
            <Link to={`/${mediaType}/${media.toDo === true ? 'to-do' : 'collection'}`} className='btn btn-outline-warning float-left'>
              Go Back
            </Link>
          </div>
          <div className='col-md-8 m-auto'>
            <h1 className='display-4 text-center'>{toCapitalNotation(mediaType)}'s Record</h1>
            <hr />
          </div>
          <div className='col-md-2 m-auto'>
            <DeleteModal onDeleteClick={onDeleteClick} type='media'></DeleteModal>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-10 m-auto'>
          <div>
            <table className='table table-hover table-dark'>
              <tbody>
                <tr>
                  <th scope='row'>1</th>
                  <td>Title</td>
                  <td>{media.title}</td>
                </tr>
                <tr>
                  <th scope='row'>2</th>
                  <td>Year</td>
                  <td>{media.year}</td>
                </tr>
                <tr>
                  <th scope='row'>3</th>
                  <td>Tier</td>
                  <td>{mediaTypeLoc && mediaTypeLoc[tiersVariable] ? mediaTypeLoc[tiersVariable][media.tier] : media.tier}</td>
                </tr>
                <tr>
                  <th scope='row'>4</th>
                  <td>Tags</td>
                  <td>{media.tags && media.tags[0] ? media.tags.join(', ') : '-'}</td>
                </tr>
                <tr>
                  <th scope='row'>5</th>
                  <td>Description</td>
                  <td>{media.description ? media.description : '-'}</td>
                </tr>
                <tr>
                  <th scope='row'>6</th>
                  <td>List Type</td>
                  <td>{`${listType}`}</td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
        </div>
          <div className='row'>
            <div className='col-md-4 m-auto'></div>
            <div className='col-md-4 m-auto'>
              <Link
                to={`/${mediaType}/${group}/edit`}
                className='btn btn-outline-info btn-lg btn-block'
              >
                Edit
              </Link>
            </div>
            <div className='col-md-4 m-auto'></div>
        </div>
      </div>
    </div>
  );
}

export default ShowMediaDetails;