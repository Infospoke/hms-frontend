import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// StrictMode intentionally double-invokes effects in dev (which is why data
// fetches showed a "canceled" row in the network tab alongside the real
// 200) — removed so the demo network tab only ever shows one request per
// page load. Data fetching still aborts in-flight requests on unmount via
// AbortController, so nothing about request cleanup changes.
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
