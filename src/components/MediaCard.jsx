import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const MediaCard = (props) => {
  const media = props.m;

  return (
    <div className='card-container'>
      <div className='desc'>
        <h2>
          <Link to={`/show-media/${media.mediaType}/${media.ID}`}>{media.title}</Link>
        </h2>
        <h3>{media.tier}</h3>
        <p>{media.year}</p>
      </div>
    </div>
  );
};

export default MediaCard;