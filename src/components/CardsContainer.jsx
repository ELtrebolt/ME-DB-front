import React from 'react';
import MediaCard from '../components/MediaCard';

function MyComponent({ items, firstYear, lastYear }) {
  return (
    <div className='cards-container'>
      {items.map((item, index) => {
        if(firstYear && lastYear)
        {
          if(item.year >= firstYear && item.year <= lastYear) {
            return <div key={index}><MediaCard media={item}/></div>;
          }
        }
        else if (firstYear && !lastYear && item.year >= firstYear)
        {
          return <div key={index}><MediaCard media={item}/></div>;
        }
        else if (!firstYear && lastYear && item.year <= lastYear)
        {
          return <div key={index}><MediaCard media={item}/></div>;
        }
        return null; 
      })}
    </div>
  );
}

export default MyComponent;