import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated import for React 18
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import AppRouter from './Router'; // Assuming Router.js handles the routing

const root = ReactDOM.createRoot(document.getElementById('root')); // Use createRoot
root.render(

  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>

);
