// Load environment variables before anything else
import './lib/load-environment';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Log environment loading in development mode
if (typeof window !== 'undefined' && window.__ENV__?.IS_DEVELOPMENT) {
  console.log('[App] Environment variables loaded:', window.__ENV__);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
