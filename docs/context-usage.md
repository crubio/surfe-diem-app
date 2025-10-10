# Context Usage in Surfe Diem App

## Overview

React Context is currently used for managing user favorites. This feature is not API driven, as we do not ask users to log into the app, nor do we save any information about the users of the site on a server.

## Current Implementation: Favorites Context

### Purpose
The `FavoritesProvider` manages user's favorite surf spots across the entire application, providing persistent storage and consistent state management.

### Key Design Decisions

#### 1. **Persistent Storage Integration**
```typescript
const [favorites, setFavorites] = useState<number[]>(() => {
  const saved = localStorage.getItem('surfeDiemFavorites');
  return saved ? JSON.parse(saved) : [];
});
```
- Uses localStorage for persistence across browser sessions
- Initializes state from saved data on app startup
- Graceful fallback to empty array if no saved data

#### 2. **Automatic Persistence**
```typescript
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}, [favorites]);
```
- Automatically saves to localStorage whenever favorites change
- No manual save operations required throughout the app

#### 3. **Simple, Focused API**
```typescript
interface FavoritesContextType {
  favorites: number[];
  addFavorite: (spotId: number) => void;
  removeFavorite: (spotId: number) => void;
  isFavorite: (spotId: number) => boolean;
}
```
- Clean, predictable methods for managing favorites
- Boolean helper for checking favorite status
- Type-safe implementation

#### 4. **Optimistic Updates**
- All operations update state immediately (no async operations)
- User sees instant feedback when adding/removing favorites
- localStorage persistence happens in background

### Usage Pattern
```typescript
const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
```
- Consumed via custom `useFavorites()` hook
- Available in any component without prop drilling
- Clean separation between provider logic and consumption

## Why Context Here?

### ✅ **Good Use Case for Context:**
1. **Truly Global State** - Favorites are needed across many components (cards, spot pages, navigation)
2. **Cross-Route Persistence** - State needs to survive navigation between pages
3. **No Server Dependency** - Pure client-side preference data
4. **Simple State Shape** - Just an array of spot IDs
5. **Infrequent Updates** - Favorites don't change constantly

### ❌ **What We Avoid Context For:**
- **Server State** - API data is managed by React Query
- **Form State** - Handled by local component state
- **UI State** - Modal open/closed, etc. kept local
- **Temporary State** - Search filters, sorting preferences

## Architecture Benefits

### 1. **Performance**
- Minimal re-renders (only when favorites actually change)
- No unnecessary provider nesting
- Simple state structure

### 2. **Developer Experience**
- Single source of truth for favorites
- Easy to test and debug
- Clear separation of concerns

### 3. **User Experience**
- Instant feedback on favorite actions
- Persistent across browser sessions
- Consistent behavior app-wide

## Future Context Considerations

Before adding new contexts, ask:
1. **Is this truly global state?** - Or can it be local to a feature?
2. **Is this client-side preference data?** - Or should it be in React Query?
3. **Does it need to persist across routes?** - Or is it page-specific?
4. **Is the update frequency low?** - Frequent updates can cause performance issues

## Current Strategy: Context + React Query

- **Context**: Client-side preferences and settings (favorites, theme, etc.)
- **React Query**: All server state and API data
- **Local State**: Component-specific UI state and forms