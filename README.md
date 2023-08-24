# surfe-diem-app
Font end site for surfe-diem

## Project structure
A brief explanation of the folder structure. Loosely follows [bulletproof react](https://github.com/alan2207/bulletproof-react).

- components: generic components not tied to a feature
- config: constants, vite & env vars
- features: entire features that include many specific components
- lib: wrappers for things like http calls other other 3rd party libraris
- pages: where the routes go, the first component to encapsulate everything for that "page"
- providers: see AppProvider for an example
- routes: define routes
- test: testing configs & mock data
- utils: non specific utilities without a better place to be

## Running
`yarn install`

`yarn dev`

See also the package.json file.

## Setup
Best to setup the [API](https://github.com/crubio/surfe-diem-api) locally first