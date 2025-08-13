import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableCard from './SortableCard';

function CardsContainer({ items, tier }) {
  return (
    <SortableContext items={items.map(i => i.ID)} strategy={verticalListSortingStrategy}>
      <div className='cards-container'>
        {items.map((item) => (
          <SortableCard key={item.ID} media={item} />
        ))}
      </div>
    </SortableContext>
  );
}

export default CardsContainer;