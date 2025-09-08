import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MediaCard from './MediaCard';

function SortableCard({ media, className }) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging
  } = useSortable({ 
    id: media.ID
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: 'default',
    touchAction: 'none',
    zIndex: isDragging ? 1000 : 'auto'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      className={className}
    >
      <MediaCard media={media} listeners={listeners} />
    </div>
  );
}

export default SortableCard;


