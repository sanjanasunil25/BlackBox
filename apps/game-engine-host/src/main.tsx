import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/app';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// Cache busting commit