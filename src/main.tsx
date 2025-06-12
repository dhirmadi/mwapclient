import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Remove the App.css import if it exists
// import './App.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
