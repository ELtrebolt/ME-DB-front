import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '../App.css';
import axios from 'axios';
import DeleteModal from "../components/DeleteModal";
const constants = require('../constants');

function toCapitalNotation(inputString) {
  return inputString
    .split(' ') // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
}

function ShowMediaDetails({user, newType}) {
  const [media, setMedia] = useState({});
  const { mediaType, group } = useParams();
  const [loaded, setLoaded] = useState(false)
  const navigate = useNavigate();
  const mediaTypeLoc = newType ? user.newTypes[mediaType] : user[mediaType]
  
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
        const groupStr = res.data.toDo === true ? 'to-do' : 'collection'
        navigate(`/${mediaType}/${groupStr}`);
      })
      .catch((err) => {
        console.log('Error form ShowMediaDetails_deleteClick');
      });
  };
  
  const tiersVariable = media.toDo ? 'todoTiers' : 'collectionTiers';
  const listType = media.toDo ? 'To-Do List' : 'My Collection' 
  return (
    <div className='ShowMediaDetails'>
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
                  <td>{mediaTypeLoc[tiersVariable][media.tier]}</td>
                </tr>
                <tr>
                  <th scope='row'>4</th>
                  <td>Tags</td>
                  <td>{media.tags && media.tags[0] ? media.tags.join(', ') : '-'}</td>
                </tr>
                <tr>
                  <th scope='row'>5</th>
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