import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '../App.css';
import axios from 'axios';

function ShowMediaDetails(props) {
  const [media, setMedia] = useState({});
  const { mediaType, ID } = useParams();
  const navigate = useNavigate();
  const user = props.user;
  const headers = {
    'userID':user.ID
  }

  useEffect(() => {
    const headers = {
      'userID':user.ID
    }
    
    axios
      .get(`http://localhost:8082/api/media/${mediaType}/${ID}`, {headers})
      .then((res) => {
        setMedia(res.data);
      })
      .catch((err) => {
        console.log('Error from ShowMediaDetails');
      });
  }, [mediaType, ID, user.ID]);
  // [id]

  const onDeleteClick = (mediaType, ID) => {
    axios
      .delete(`http://localhost:8082/api/media/${mediaType}/${ID}`, {headers})
      .then((res) => {
        navigate('/');
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
            <td>Tier</td>
            <td>{media.tier}</td>
          </tr>
          <tr>
            <th scope='row'>3</th>
            <td>ToDo</td>
            <td>{media.toDo}</td>
          </tr>
          <tr>
            <th scope='row'>4</th>
            <td>Year</td>
            <td>{media.year}</td>
          </tr>

        </tbody>
      </table>
    </div>
  );

  return (
    <div className='ShowMediaDetails'>
      <div className='container'>
        <div className='row'>
          <div className='col-md-10 m-auto'>
            <br /> <br />
            <Link to='/' className='btn btn-outline-warning float-left'>
              Show Media List
            </Link>
          </div>
          <br />
          <div className='col-md-8 m-auto'>
            <h1 className='display-4 text-center'>Media's Record</h1>
            <p className='lead text-center'>View Media's Info</p>
            <hr /> <br />
          </div>
          <div className='col-md-10 m-auto'>{MediaItem}</div>
          <div className='col-md-6 m-auto'>
            <button
              type='button'
              className='btn btn-outline-danger btn-lg btn-block'
              onClick={() => {
                onDeleteClick(mediaType, ID);
              }}
            >
              Delete Media
            </button>
          </div>
          <div className='col-md-6 m-auto'>
            <Link
              to={`/edit-media/${mediaType}/${ID}`}
              className='btn btn-outline-info btn-lg btn-block'
            >
              Edit Media
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowMediaDetails;