# Demo Mode Architecture

## Overview

Demo mode provides a fully functional preview of the ME-DB application without requiring authentication. It uses localStorage to persist user changes (media items, tier titles, etc.) and shares core components with the app to ensure feature parity.

## Architecture Pattern

### Shared Components

Core app components (`ShowMediaList`, `ShowMediaDetails`, `CreateMedia`, etc.) are shared between app and demo modes. They accept a `dataSource` prop to distinguish behavior:

- `dataSource="api"` - Uses backend API, requires authentication
- `dataSource="demo"` - Uses localStorage via `useDemoData` hook, no authentication

### Demo Wrappers

Demo-specific pages wrap shared components and provide:
- Demo data hooks (`useDemoData`, `useDemoTierTitles`)
- Demo-specific state management
- Demo-specific persistence logic
- Callback functions for CRUD operations

**Example**: `DemoShowMediaList` wraps `ShowMediaList` and passes:
- `dataSource="demo"`
- `basePath="/demo"` (for routing)
- Callbacks: `onGetMediaByTier`, `onReorderInTier`, `onMoveToTier`
- Demo-specific props: `tierTitleOverrides`, `onTierTitleSave`

## Pattern for Adding Features

When adding features to shared components that should work in both app and demo:

### 1. Use `dataSource` prop for conditional logic

```jsx
if (dataSource === 'demo' && onCustomCallback) {
  // Demo mode: use callback
  onCustomCallback(data);
} else if (dataSource === 'api') {
  // App mode: use API
  axios.post('/api/endpoint', data);
}
```

### 2. Accept optional props for demo-specific behavior

```jsx
function SharedComponent({
  dataSource = 'api',
  basePath = '',
  // ... other props
  demoSpecificProp = undefined,
  onDemoSpecificAction = undefined
}) {
  // Component logic
}
```

### 3. Keep demo-specific state in wrapper, not shared component

**Good**: Demo wrapper manages state, passes as props
```jsx
// DemoShowMediaList.jsx
const { getTierTitle, setTierTitle } = useDemoTierTitles();
const tierTitleOverrides = getAllOverrides();
const handleSave = (tier, title) => setTierTitle(mediaType, toDoString, tier, title);

<ShowMediaList
  tierTitleOverrides={tierTitleOverrides}
  onTierTitleSave={handleSave}
  // ...
/>
```

**Bad**: Shared component has demo-specific state
```jsx
// ShowMediaList.jsx - DON'T DO THIS
const [tierTitleOverrides, setTierTitleOverrides] = useState({}); // ❌
```

### 4. Always use `basePath` for routing

```jsx
// Good
navigate(`${basePath}/${mediaType}/${id}`);

// Bad
navigate(`/${mediaType}/${id}`); // ❌ Hardcoded path
```

### 5. Use callbacks instead of direct API calls in shared components

**Good**: Accept callback prop
```jsx
function SharedComponent({ onSave, dataSource }) {
  const handleSave = () => {
    if (dataSource === 'demo' && onSave) {
      onSave(data);
    } else {
      axios.post('/api/endpoint', data);
    }
  };
}
```

**Bad**: Direct API call
```jsx
function SharedComponent() {
  const handleSave = () => {
    axios.post('/api/endpoint', data); // ❌ Breaks demo mode
  };
}
```

## Checklist Before Merging App Changes

When modifying shared components, verify:

- [ ] Works with `dataSource="demo"` (test in demo mode)
- [ ] Demo wrapper passes necessary props/callbacks
- [ ] No hardcoded API calls (use callbacks or `dataSource` checks)
- [ ] Routing uses `basePath` prop (not hardcoded paths)
- [ ] Demo-specific state is in wrapper, not shared component
- [ ] localStorage persistence hooks exist for demo-specific features

## Demo Persistence Hooks

### `useDemoData`

Manages media items (CRUD operations) with localStorage persistence.

**Location**: `demo/hooks/useDemoData.js`

**Usage**:
```jsx
const { 
  data, 
  loading,
  getMediaByTier,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
  reorderInTier,
  moveToTier
} = useDemoData(mediaType);
```

**Storage**: `demo_${mediaType}` (e.g., `demo_anime`, `demo_games`)

### `useDemoTierTitles`

Manages tier title overrides with localStorage persistence.

**Location**: `demo/hooks/useDemoTierTitles.js`

**Usage**:
```jsx
const { 
  getTierTitle,
  setTierTitle,
  getAllOverrides,
  clearTierTitle
} = useDemoTierTitles();
```

**Storage**: `demo_tierTitles` (single object with all overrides)

**Key format**: `${mediaType}-${toDoString}-${tier}` (e.g., `games-collection-S`)

## Benefits of This Architecture

1. **Feature Parity**: Changes to shared components automatically work in demo
2. **Separation of Concerns**: Demo-specific logic isolated in wrappers
3. **Maintainability**: Single source of truth for core functionality
4. **Testability**: Easy to test demo vs app behavior
5. **Persistence**: Demo changes persist across sessions via localStorage

## Example: Adding a New Feature

**Scenario**: Add a "Favorite" button to media cards

### Step 1: Update shared component

```jsx
// ShowMediaList.jsx
function ShowMediaList({
  // ... existing props
  onToggleFavorite = undefined, // New callback prop
  favoriteIds = [] // New prop for favorite state
}) {
  // In render:
  <MediaCard 
    media={item}
    isFavorite={favoriteIds.includes(item.ID)}
    onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(item.ID) : undefined}
  />
}
```

### Step 2: Update demo wrapper

```jsx
// DemoShowMediaList.jsx
const [favoriteIds, setFavoriteIds] = useState(() => {
  // Load from localStorage
  const stored = localStorage.getItem('demo_favorites');
  return stored ? JSON.parse(stored) : [];
});

const handleToggleFavorite = (id) => {
  const newFavorites = favoriteIds.includes(id)
    ? favoriteIds.filter(fid => fid !== id)
    : [...favoriteIds, id];
  setFavoriteIds(newFavorites);
  localStorage.setItem('demo_favorites', JSON.stringify(newFavorites));
};

<ShowMediaList
  // ... existing props
  favoriteIds={favoriteIds}
  onToggleFavorite={handleToggleFavorite}
/>
```

### Step 3: Update app usage (if needed)

```jsx
// App.js or wherever ShowMediaList is used in app mode
// Either add API call in ShowMediaList with dataSource check,
// or pass callback that calls API
```

## Troubleshooting

### Demo data doesn't persist

- Check browser localStorage is enabled
- Check for `storageAvailable` warnings in console
- Verify localStorage keys: `demo_anime`, `demo_tierTitles`, etc.

### Changes to app don't work in demo

- Verify `dataSource="demo"` is passed
- Check demo wrapper passes necessary props
- Ensure no hardcoded API calls in shared component
- Verify routing uses `basePath`

### Demo-specific features break app

- Ensure demo-specific props have default values
- Use `dataSource` checks before demo-specific logic
- Keep demo state in wrapper, not shared component
