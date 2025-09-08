import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
  
  // Redirect to login if user is not authenticated
  if (!user) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 text-center">
              <div className="card shadow-soft border-0">
                <div className="card-body p-5">
                  <h3 className="text-danger mb-3">Session Expired</h3>
                  <p className="text-muted mb-4">Your session has expired. Please log in again to continue.</p>
                  <Link to="/" className="btn btn-primary px-4 py-2">Go to Login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const tiersVariable = media.toDo ? 'todoTiers' : 'collectionTiers';
  const listType = media.toDo ? 'To-Do List' : 'My Collection' 
  return (
    <div className='ShowMediaDetails min-vh-100' style={{backgroundColor: '#2c3e50', color: 'white'}} {...swipeHandlers}>
      <div className='container py-5'>
        <div className='row mb-4'>
          <div className='col-md-2 d-flex justify-content-end align-items-center'>
            <Link to={`/${mediaType}/${media.toDo === true ? 'to-do' : 'collection'}`} className='btn btn-outline-warning btn-lg'>
              <i className="fas fa-arrow-left me-2"></i>Go Back
            </Link>
          </div>
          <div className='col-md-8 text-center'>
            <h1 className='display-4 fw-bold text-white'>{toCapitalNotation(mediaType)}'s Record</h1>
            <div className="border-bottom border-3 border-warning w-25 mx-auto"></div>
          </div>
          <div className='col-md-2 d-flex justify-content-center align-items-center'>
            <DeleteModal onDeleteClick={onDeleteClick} type='media'></DeleteModal>
          </div>
        </div>
        
        <div className='row justify-content-center'>
          <div className='col-lg-10 col-md-12'>
            <div className="card shadow-soft border-0" style={{backgroundColor: constants.mainColors.table, border: '2px solid white'}}>
              <div className="card-body p-0" style={{backgroundColor: constants.mainColors.table}}>
                <div className="table-responsive">
                  <table className='table table-hover mb-0 text-white' style={{backgroundColor: constants.mainColors.table, border: '1px solid white'}}>
                    <tbody style={{backgroundColor: constants.mainColors.table}}>
                      <tr className="border-bottom border-white" style={{backgroundColor: constants.mainColors.table}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: constants.mainColors.table}}>1</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: constants.mainColors.table}}>Title</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: constants.mainColors.table}}>{media.title}</td>
                      </tr>
                      <tr className="border-bottom border-white" style={{backgroundColor: constants.mainColors.table}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: constants.mainColors.table}}>2</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: constants.mainColors.table}}>Year</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: constants.mainColors.table}}>{media.year}</td>
                      </tr>
                      <tr className="border-bottom border-white" style={{backgroundColor: constants.mainColors.table}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: constants.mainColors.table}}>3</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: constants.mainColors.table}}>Tier</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: constants.mainColors.table}}>{mediaTypeLoc && mediaTypeLoc[tiersVariable] ? mediaTypeLoc[tiersVariable][media.tier] : media.tier}</td>
                      </tr>
                      <tr className="border-bottom border-white" style={{backgroundColor: constants.mainColors.table}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: constants.mainColors.table}}>4</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: constants.mainColors.table}}>Tags</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: constants.mainColors.table}}>{media.tags && media.tags[0] ? media.tags.join(', ') : '-'}</td>
                      </tr>
                      <tr className="border-bottom border-white" style={{backgroundColor: constants.mainColors.table}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: constants.mainColors.table}}>5</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: constants.mainColors.table}}>Description</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: constants.mainColors.table}}>{media.description ? media.description : '-'}</td>
                      </tr>
                      <tr style={{backgroundColor: constants.mainColors.table}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: constants.mainColors.table}}>6</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: constants.mainColors.table}}>List Type</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: constants.mainColors.table}}>{`${listType}`}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className='row mt-4'>
          <div className='col-md-4'></div>
          <div className='col-md-4 text-center'>
            <Link to={`/${mediaType}/${media.ID}/edit`} className='btn btn-warning btn-lg'>
              <i className="fas fa-edit me-2"></i>Edit
            </Link>
          </div>
          <div className='col-md-4'></div>
        </div>
      </div>
    </div>
  );
}

export default ShowMediaDetails;