import React from 'react';
import MediaCard from '../components/MediaCard';

function MyComponent({ items }) {
  return (
    <div className='cards-container'>
      {items.map((item, index) => {
        return <div key={index}><MediaCard media={item}/></div>;
      })}
    </div>
  );
}

export default MyComponent;