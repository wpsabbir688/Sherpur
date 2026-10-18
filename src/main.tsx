// Defensive shim: ensure window.fetch is writable and not getter-only in sandboxed frames
try {
  if (typeof window !== 'undefined') {
    let _activeFetch = window.fetch ? window.fetch.bind(window) : null;
    Object.defineProperty(window, 'fetch', {
      get() {
        return _activeFetch;
      },
      set(fn) {
        _activeFetch = fn;
      },
      configurable: true,
      enumerable: true,
    });
  }
} catch {
  // safe fallback
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
