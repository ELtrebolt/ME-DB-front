import React from 'react';
import { Link } from 'react-router-dom';

const MediaCard = ({ media }) => {
  // Calculate dynamic width based on title length
  const calculateWidth = () => {
    const titleLength = media.title.length;
    const minWidth = 140; // Minimum width to fit year text
    const maxWidth = 150; // Maximum width to prevent overly wide cards
    
    // Adjusted calculation: 6px per character + padding for better 2-line fit
    const calculatedWidth = Math.max(minWidth, Math.min(maxWidth, titleLength * 6 + 24));
    
    return calculatedWidth;
  };

  const cardWidth = calculateWidth();

  return (
    <div 
      className='card shadow-soft h-100 media-card-outline transition-all duration-200 hover:shadow-medium' 
      style={{ 
        minWidth: 0, 
        width: `${cardWidth}px`
      }}
    >
      <div className='card-body p-2'>
        <h6 className='card-title title-clamp mb-1' style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
          <Link className='text-decoration-underline text-primary' to={`/${media.mediaType}/${media.ID}`}>{media.title}</Link>
        </h6>
        <p className='card-text text-white mb-0'>Year: {media.year}</p>
      </div>
    </div>
  );
};

export default MediaCard;