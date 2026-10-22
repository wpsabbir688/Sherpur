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

    // Google Maps Platform Quota Defense listener
    (window as any).gm_authFailure = () => {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    };
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      origError.apply(console, args);
      const msg = args.map((a) => String(a)).join(' ');
      if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
    };
  }
} catch {
  // safe fallback
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
