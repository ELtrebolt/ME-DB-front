# Feature: Drag and Drop on ShowMediaList

## Summary
Enable drag-and-drop to manage media within the tier list.

## Functionality
- Reorder within a tier with precise between-card placement via dnd-kit.
- Move between tiers; the backend `tier` field is updated on cross-tier drops.

## UI Features
- Works with existing `MediaCard` layout and styling.
- Uses native HTML5 drag-and-drop (no new dependencies).

## Files to Modify or Create
- Frontend
  - `src/pages/ShowMediaList.jsx`
  - `src/components/CardsContainer.jsx`
  - `src/components/SortableCard.jsx`
- Backend
  - No changes. Uses existing `PUT /api/media/:mediaType/:ID`.


