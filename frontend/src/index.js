import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/rooms.css';
import Rooms3d from './rooms/rooms3d';
import App from './app.js';
import "bootstrap/dist/css/bootstrap.min.css";

//  Disable console logs in production
/*if (process.env.NODE_ENV === "production") {
  console.log = function () {};
  console.error = function () {};
  console.warn = function () {};
}*/

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);
