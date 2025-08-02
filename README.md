# Surfe Diem - Real-time Surf Conditions

Frontend application for Surfe Diem, providing real-time surf conditions and current forecasts.

## Features

### 🏄‍♂️ Current Conditions Dashboard
- **Real-time swell data** from closest surf spots
- **Live tide information** with current height and direction
- **Highest waves tracking** from nearby locations
- **Personalized recommendations** based on location

### 🧪 A/B Testing
- **Multiple homepage variations** for user experience optimization
- **Dashboard, Discovery, Minimalist, and Data-rich layouts**
- **Google Analytics integration** for performance tracking

### ⭐ Favorites System
- **Save favorite spots and buoys** with local storage
- **Batch API integration** for efficient data fetching
- **Real-time updates** for favorited locations

## Project Structure
Loosely follows [bulletproof react](https://github.com/alan2207/bulletproof-react).

- **components**: Generic components not tied to a feature
- **config**: Constants, vite & env vars
- **features**: Entire features that include many specific components
- **lib**: Wrappers for HTTP calls and other 3rd party libraries
- **pages**: Route components that encapsulate everything for that "page"
- **providers**: React context providers (see AppProvider for example)
- **routes**: Route definitions
- **test**: Testing configs & mock data
- **utils**: Non-specific utilities without a better place to be

## Running
```bash
yarn install
yarn dev
```

See also the package.json file for additional scripts.

## Setup
Best to setup the [API](https://github.com/crubio/surfe-diem-api) locally first

## Documentation
- [Surf Condition Criteria](./docs/surf-condition-criteria.md) - Scoring algorithm and condition assessment
- [Home Page Variations](./home-page-variations.md) - A/B testing strategy and variations
- [Data Flow](./data-flow-and-component-hierarchy.md) - Component hierarchy and data flow