import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.DEV) return 'http://localhost:5000';
  return window.location.origin;
};

// Override global fetch to automatically rewrite local backend URL in production
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  let url = input;
  const baseUrl = getApiBaseUrl();
  
  if (typeof input === 'string' && input.startsWith('http://localhost:5000')) {
    url = input.replace('http://localhost:5000', baseUrl);
  } else if (input instanceof URL && input.href.startsWith('http://localhost:5000')) {
    url = new URL(input.href.replace('http://localhost:5000', baseUrl));
  } else if (input instanceof Request && input.url.startsWith('http://localhost:5000')) {
    const newUrl = input.url.replace('http://localhost:5000', baseUrl);
    url = new Request(newUrl, input);
  }
  
  return originalFetch(url, init);
};

// Configure Axios request interceptor to rewrite local backend URL in production
axios.interceptors.request.use((config) => {
  const baseUrl = getApiBaseUrl();
  if (config.url && config.url.startsWith('http://localhost:5000')) {
    config.url = config.url.replace('http://localhost:5000', baseUrl);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
