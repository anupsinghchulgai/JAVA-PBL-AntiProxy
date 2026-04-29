import ReactDOM from 'react-dom/client';
import React from 'react';
import App from './App';
import { injectAnimations } from './styles';

injectAnimations();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
