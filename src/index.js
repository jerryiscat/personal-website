import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Global styles
import App from './App'; // Root component
import ThemeContextProvider from './contexts/ThemeContext'
// import reportWebVitals from './reportWebVitals'; // Optional

ReactDOM.render(
  <ThemeContextProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ThemeContextProvider>,

  document.getElementById('root')
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
