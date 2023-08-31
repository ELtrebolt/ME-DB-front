import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '../App.css';
import axios from 'axios';
const constants = require('../constants');

function toCapitalNotation(inputString) {
  return inputString
    .split(' ') // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
}

function ShowMediaDetails(props) {
  const [media, setMedia] = useState({});
  const { mediaType, group } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(constants['SERVER_URL'] + `/api/media/${mediaType}/${group}`)
      .then((res) => {
        console.log("/api/media/type/id", res)
        if(!res.data)
        {
          navigate('/404')
        }
        setMedia(res.data);
      })
      .catch((err) => {
        console.log('Error from ShowMediaDetails');
      });
  }, [mediaType, group, navigate]);

  const onDeleteClick = (mediaType, group) => {
    axios
      .delete(constants['SERVER_URL'] + `/api/media/${mediaType}/${group}`)
      .then((res) => {
        navigate(-1);
      })
      .catch((err) => {
        console.log('Error form ShowMediaDetails_deleteClick');
      });
  };

  const MediaItem = (
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
            <td>{media.tier}</td>
          </tr>
          <tr>
            <th scope='row'>4</th>
            <td>ToDo</td>
            <td>{`${media.toDo}`}</td>
          </tr>

        </tbody>
      </table>
    </div>
  );

  const toDoURL = media.toDo === true ? 'to-do' : 'collection'
  return (
    <div className='ShowMediaDetails'>
      <div className='container'>
        <br></br>
        <div className='row'>
          <div className='col-md-2 m-auto'>
            <Link to={`/${mediaType}/${toDoURL}`} className='btn btn-outline-warning float-left'>
              Go Back
            </Link>
          </div>
          <div className='col-md-8 m-auto'>
            <h1 className='display-4 text-center'>{toCapitalNotation(mediaType)}'s Record</h1>
            <hr />
          </div>
          <div className='col-md-2 m-auto'></div>
        </div>
        <div className='row'>
          <div className='col-md-10 m-auto'>{MediaItem}</div>
        </div>
          <div className='row'>
            <div className='col-md-2 m-auto'></div>
            <div className='col-md-4 m-auto'>
              <button
                type='button'
                className='btn btn-outline-danger btn-lg btn-block'
                onClick={() => {
                  onDeleteClick(mediaType, group);
                }}
              >
                Delete
              </button>
            </div>
            <div className='col-md-4 m-auto'>
              <Link
                to={`/${mediaType}/${group}/edit`}
                className='btn btn-outline-info btn-lg btn-block'
              >
                Edit
              </Link>
            </div>
            <div className='col-md-2 m-auto'></div>
        </div>
      </div>
    </div>
  );
}

export default ShowMediaDetails;