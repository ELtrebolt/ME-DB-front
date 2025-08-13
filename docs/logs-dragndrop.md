# Drag and Drop Implementation Logs

## Overview
Implemented HTML5 drag-and-drop on the `ShowMediaList` tiers so users can:
- Reorder items within a tier (client-side only, tier unchanged)
- Move items across tiers (persists new tier to backend)

## Files Created/Modified

### Frontend
- Modified: `ME-DB-front/src/components/CardsContainer.jsx`
  - Migrated to dnd-kit with `SortableContext` and per-card `useSortable`
  - Renders the cards within sortable context for precise between-card insertion

- Modified: `ME-DB-front/src/pages/ShowMediaList.jsx`
  - Wrapped tiers with `DndContext`; added sensors and `onDragEnd` handler
  - Uses `arrayMove` for intra-tier reorder; computes destination tier/index
  - On cross-tier drop, sends PUT to `/api/media/:mediaType/:ID` with updated `tier`

- Created: `ME-DB-front/src/components/SortableCard.jsx`
  - `useSortable`-based wrapper for `MediaCard` with transform/transition

### Backend
- No changes needed. Reused existing endpoint `PUT /api/media/:mediaType/:ID` to update `tier`.

## User Experience
- Drag any card by pressing and moving it.
- Drop on another card to insert before it, or drop in empty space of a tier to append at end.
- Moving to a different tier updates the backend immediately.

## Notes
- Reordering within a tier is not persisted; it's a visual-only change as requested.
- Tier changes are optimistic; on failure, an error is logged to console.


