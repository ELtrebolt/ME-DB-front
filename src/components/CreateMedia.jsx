import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

const CreateMedia = ({user}) => {
  // Define the state with useState hook
  const navigate = useNavigate();
  const [media, setMedia] = useState({
    userID: user.ID,
    mediaType: 'Media',
    title: '',
    tier: '',
    toDo: '',
    year: '',
  });

  const onChange = (e) => {
    setMedia({ ...media, [e.target.name]: e.target.value });
  };

  console.log(media);
  const onSubmit = (e) => {
    e.preventDefault();

    axios
      .post('http://localhost:8082/api/media', media)
      .then((res) => {
        console.log("Add success")
        setMedia({
          title: '',
          tier: '',
          toDo: '',
          year: '',
        });
        
        // Push to /
        navigate('/');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className='CreateMedia'>
      <div className='container'>
        <div className='row'>
          <div className='col-md-8 m-auto'>
            <br />
            <Link to='/' className='btn btn-outline-warning float-left'>
              Show Media List
            </Link>
          </div>
          <div className='col-md-8 m-auto'>
            <h1 className='display-4 text-center'>Add Media</h1>
            <p className='lead text-center'>Create new media</p>

            <form noValidate onSubmit={onSubmit}>
              <div className='form-group'>
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
                <input
                  type='text'
                  placeholder='tier'
                  name='tier'
                  className='form-control'
                  value={media.tier}
                  onChange={onChange}
                />
              </div>

              <div className='form-group'>
                <input
                  type='text'
                  placeholder='toDo'
                  name='toDo'
                  className='form-control'
                  value={media.toDo}
                  onChange={onChange}
                />
              </div>

              <div className='form-group'>
                <input
                  type='text'
                  placeholder='year'
                  name='year'
                  className='form-control'
                  value={media.year}
                  onChange={onChange}
                />
              </div>

              <input
                type='submit'
                className='btn btn-outline-warning btn-block mt-4'
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMedia;