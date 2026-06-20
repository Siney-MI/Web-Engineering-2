import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';

// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";


import App from './App';
import { BrowserRouter } from 'react-router';

const root = createRoot(
  document.getElementById('root') as HTMLElement
);


root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
      </BrowserRouter>
  </StrictMode>
);


  