import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const MediaCard = ({ media, listeners, onCardClick, basePath = '' }) => {
  const location = useLocation();
  
  // Calculate dynamic width based on screen size and title length
  const calculateWidth = () => {
    const titleLength = media.title.length;
    const isMobile = window.innerWidth <= 767.98;
    const isSmallMobile = window.innerWidth <= 480;
    
    if (isSmallMobile) {
      // Extra small screens: 70-80px for 4-5 cards per row
      const minWidth = 70;
      const maxWidth = 80;
      return Math.max(minWidth, Math.min(maxWidth, titleLength * 3.5 + 25));
    } else if (isMobile) {
      // Mobile screens: 75-85px for 4-5 cards per row
      const minWidth = 75;
      const maxWidth = 85;
      return Math.max(minWidth, Math.min(maxWidth, titleLength * 4 + 30));
    } else {
      // Desktop: maintain current sizing
      const minWidth = 140;
      const maxWidth = 150;
      return Math.max(minWidth, Math.min(maxWidth, titleLength * 6 + 10));
    }
  };

  const cardWidth = calculateWidth();
  
  // Build the details URL with preserved query parameters
  const buildDetailsUrl = () => {
    const baseUrl = `${basePath}/${media.mediaType}/${media.ID}`;
    const currentSearch = location.search;
    
    // If there are query parameters (like tags), preserve them
    if (currentSearch) {
      return `${baseUrl}${currentSearch}`;
    }
    
    return baseUrl;
  };

  return (
    <div 
      className='card shadow-soft h-100 media-card-outline transition-all duration-200 hover:shadow-medium' 
      style={{ 
        minWidth: 0, 
        width: `${cardWidth}px`,
        cursor: onCardClick ? 'pointer' : 'grab'
      }}
      {...(onCardClick ? {} : listeners)}
      onClick={onCardClick ? () => onCardClick(media) : undefined}
    >
      <div className='card-body p-0' style={{ padding: '0px 1px' }}>
        <h6 className='card-title title-clamp mb-0' style={{ fontSize: '0.75rem', fontWeight: 'bold', lineHeight: '1.0' }}>
          {onCardClick ? (
            <span className='text-decoration-underline text-primary' style={{ cursor: 'pointer' }}>
              {media.title}
            </span>
          ) : (
            <Link 
              className='text-decoration-underline text-primary' 
              to={buildDetailsUrl()}
              style={{ 
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
              onClick={(e) => {
                // Allow navigation - @dnd-kit activationConstraint will handle drag vs click
              }}
            >
              {media.title}
            </Link>
          )}
        </h6>
        <p className='card-text text-white mb-0' style={{ fontSize: '0.65rem', lineHeight: '1.0' }}>
          {media.year ? new Date(media.year).getFullYear() : '-'}
        </p>
      </div>
    </div>
  );
};

export default MediaCard;