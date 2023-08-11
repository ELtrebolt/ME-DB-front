import React, { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import MediaCard from './MediaCard';

function ShowMediaList({user}) {
  const [media, setMedia] = useState([]);

  useEffect(() => {
    const headers = {
      'userID':user.ID
    }
    console.log("Test1")
    axios
      .get('http://localhost:8082/api/media', {headers})
      .then((res) => {
        setMedia(res.data);
      })
      .catch((err) => {
        console.log('Error from ShowMediaList');
      });
  }, [user.ID]);

  const mediaList =
    media.length === 0
      ? 'there is no media record!'
      : media.map((m, k) => <MediaCard m={m} key={k} />);

  return (
    <div className='ShowMediaList'>
      <div className='container'>
        <div className='row'>
          <div className='col-md-12'>
            <br />
            <h2 className='display-4 text-center'>Media List</h2>
          </div>

          <div className='col-md-11'>
            <Link
              to='/create-media'
              className='btn btn-outline-warning float-right'
            >
              + Add New Media
            </Link>
            <br />
            <br />
            <hr />
          </div>
        </div>

        <div className='list'>{mediaList}</div>
      </div>
    </div>
  );
}

export default ShowMediaList;