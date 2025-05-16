import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SnackbarProvider } from 'notistack';
import reportWebVitals from './reportWebVitals';
import './styles/index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <SnackbarProvider 
        maxSnack={3}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={3000}
      >
        <App />
      </SnackbarProvider>
    </React.StrictMode>
  );
} else {
  console.error("Root container not found. Check index.html");
}

reportWebVitals();
