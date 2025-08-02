import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider } from './providers/app'

// Mobile viewport height fix
const setVH = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Set initial viewport height
setVH();

// Update on resize and orientation change
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);

// Cleanup function for event listeners
const cleanup = () => {
  window.removeEventListener('resize', setVH);
  window.removeEventListener('orientationchange', setVH);
};

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider />
  </React.StrictMode>,
)
