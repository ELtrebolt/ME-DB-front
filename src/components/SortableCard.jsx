import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MediaCard from './MediaCard';

function SortableCard({ media }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: media.ID });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <MediaCard media={media} />
    </div>
  );
}

export default SortableCard;

