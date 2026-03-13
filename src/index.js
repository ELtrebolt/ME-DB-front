import React from 'react';
import ReactDOM from 'react-dom/client';
import './styling/index.css';
import './styling/App.css';
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import { Toaster } from 'sonner';
import App from './App';
import { initVitals } from './app/vitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Toaster position="top-center" duration={5000} />
  </React.StrictMode>
);

initVitals();
