import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const MediaCard = (props) => {
  // console.log("Props", props);
  const media = props.media

  return (
    <div className='media-card'>
      <h5>
        <Link to={`/${media.mediaType}/${media.ID}`}>{media.title}</Link>
      </h5>
      <p>Year: {media.year}</p>
    </div>
  );
};

export default MediaCard;