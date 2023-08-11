import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function UpdateMediaInfo(user) {
  const [media, setMedia] = useState({
    title: '',
    tier: '',
    toDo: '',
    year: '',
  });
  const { mediaType, ID } = useParams();
  const navigate = useNavigate();
  const userID = user.user.ID

  useEffect(() => {
    const headers = {
      'userID':userID
    }

    axios
      .get(`http://localhost:8082/api/media/${mediaType}/${ID}`, {headers})
      .then((res) => {
        setMedia({
          title: res.data[0].title,
          tier: res.data[0].tier,
          toDo: res.data[0].toDo,
          year: res.data[0].year,
        });
      })
      .catch((err) => {
        console.log('Error from UpdateMediaInfo');
      });
  }, [mediaType, ID, userID]);
  // info

  const onChange = (e) => {
    setMedia({ ...media, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const data = {
      userID: userID,
      title: media.title,
      tier: media.tier,
      toDo: media.toDo,
      year: media.year,
    };

    axios
      .put(`http://localhost:8082/api/media/${mediaType}/${ID}`, data)
      .then((res) => {
        navigate(`/show-media/${mediaType}/${ID}`);
      })
      .catch((err) => {
        console.log('Error in UpdateMediaInfo!');
      });
  };

  return (
    <div className='UpdateMediaInfo'>
      <div className='container'>
        <div className='row'>
          <div className='col-md-8 m-auto'>
            <br />
            <Link to='/' className='btn btn-outline-warning float-left'>
              Show Media List
            </Link>
          </div>
          <div className='col-md-8 m-auto'>
            <h1 className='display-4 text-center'>Edit Media</h1>
            <p className='lead text-center'>Update Media's Info</p>
          </div>
        </div>

        <div className='col-md-8 m-auto'>
          <form noValidate onSubmit={onSubmit}>
            <div className='form-group'>
              <label htmlFor='title'>Title</label>
              <input
                type='text'
                placeholder='Title'
                name='title'
                className='form-control'
                value={media.title}
                onChange={onChange}
              />
            </div>
            <br />

            <div className='form-group'>
              <label htmlFor='tier'>Tier</label>
              <input
                type='text'
                placeholder='Tier'
                name='tier'
                className='form-control'
                value={media.tier}
                onChange={onChange}
              />
            </div>
            <br />

            <div className='form-group'>
              <label htmlFor='toDo'>ToDo</label>
              <input
                type='text'
                placeholder='ToDo'
                name='toDo'
                className='form-control'
                value={media.toDo}
                onChange={onChange}
              />
            </div>
            <br />

            <div className='form-group'>
              <label htmlFor='year'>Year</label>
              <textarea
                type='text'
                placeholder='Year'
                name='year'
                className='form-control'
                value={media.year}
                onChange={onChange}
              />
            </div>
            <br />

            <button
              type='submit'
              className='btn btn-outline-info btn-lg btn-block'
            >
              Update Media
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateMediaInfo;