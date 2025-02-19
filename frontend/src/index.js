import React from 'react';
import ReactDOM from 'react-dom/client';
import './rooms/rooms.css';
import Rooms3d from './rooms/rooms3d';
import App from './app.js';
import "bootstrap/dist/css/bootstrap.min.css";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);
