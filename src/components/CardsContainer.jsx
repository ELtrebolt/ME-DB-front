import React, { useState } from 'react';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import SortableCard from './SortableCard';

function CardsContainer({ items, tier, onEdgeDrop, readOnly, onCardClick }) {
  const idList = Array.isArray(items) ? items.map(i => i.ID) : [];
  const [edgeDragOver, setEdgeDragOver] = useState({ top: false, bottom: false });
  
  // Make the entire tier container a droppable zone
  const { setNodeRef, isOver } = useDroppable({
    id: `tier:${tier}`,
    disabled: readOnly
  });

  // Create separate droppable zones for top and bottom edges
  const { setNodeRef: setTopRef, isOver: isTopOver } = useDroppable({
    id: `tier-${tier}-top`,
    disabled: readOnly
  });

  const { setNodeRef: setBottomRef, isOver: isBottomOver } = useDroppable({
    id: `tier-${tier}-bottom`,
    disabled: readOnly
  });

  // Update edge drag over state based on droppable zones
  React.useEffect(() => {
    setEdgeDragOver({
      top: isTopOver,
      bottom: isBottomOver
    });
  }, [isTopOver, isBottomOver]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Top edge drop zone */}
      <div
        ref={setTopRef}
        style={{
          position: 'absolute',
          top: '-10px',
          left: '0',
          right: '0',
          height: '20px',
          zIndex: 1000,
          backgroundColor: edgeDragOver.top ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
          border: edgeDragOver.top ? '2px dashed rgba(59, 130, 246, 0.8)' : '2px dashed transparent',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {edgeDragOver.top && (
          <div style={{
            color: 'rgba(59, 130, 246, 1)',
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: '0 0 4px rgba(59, 130, 246, 0.8)'
          }}>
            Drop to move to {tier} tier
          </div>
        )}
      </div>

      {/* Main tier container */}
      <SortableContext items={idList} strategy={rectSortingStrategy}>
        <div 
          ref={setNodeRef}
          className='tier-flex'
          style={{ 
            minHeight: items && items.length > 0 ? '80px' : '0px',
            padding: items && items.length > 0 ? '8px' : '0px',
            position: 'relative',
            backgroundColor: isOver ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            border: isOver ? '2px dashed rgba(59, 130, 246, 0.5)' : '2px dashed transparent',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          {items && items.map((item) => (
            <SortableCard key={item.ID} media={item} className="sortable-card" onCardClick={onCardClick} />
          ))}
        </div>
      </SortableContext>

      {/* Bottom edge drop zone */}
      <div
        ref={setBottomRef}
        style={{
          position: 'absolute',
          bottom: '-10px',
          left: '0',
          right: '0',
          height: '20px',
          zIndex: 1000,
          backgroundColor: edgeDragOver.bottom ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
          border: edgeDragOver.bottom ? '2px dashed rgba(59, 130, 246, 0.8)' : '2px dashed transparent',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {edgeDragOver.bottom && (
          <div style={{
            color: 'rgba(59, 130, 246, 1)',
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: '0 0 4px rgba(59, 130, 246, 0.8)'
          }}>
            Drop to move to {tier} tier
          </div>
        )}
      </div>
    </div>
  );
}

export default CardsContainer;