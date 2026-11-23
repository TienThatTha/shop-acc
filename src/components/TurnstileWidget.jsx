import React, { useEffect, useRef } from 'react';
import { TURNSTILE_SITE_KEY } from '../utils/turnstileConfig';

const SITE_KEY = TURNSTILE_SITE_KEY;
let scriptPromise = null;

function loadTurnstileScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.turnstile && typeof window.turnstile.render === 'function') {
    return Promise.resolve(window.turnstile);
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-cf-turnstile="1"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.turnstile), { once: true });
      existing.addEventListener('error', () => reject(new Error('Turnstile script failed')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.cfTurnstile = '1';
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Turnstile script failed'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export default function TurnstileWidget({ onToken, onExpire, resetSignal = 0, className = '' }) {
  const hostRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onTokenRef = useRef(onToken);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onTokenRef.current = onToken;
    onExpireRef.current = onExpire;
  }, [onToken, onExpire]);

  useEffect(() => {
    if (!SITE_KEY || !hostRef.current) return undefined;
    let cancelled = false;

    loadTurnstileScript()
      .then((ts) => {
        if (cancelled || !hostRef.current || !ts) return;
        if (widgetIdRef.current !== null) {
          try {
            ts.remove(widgetIdRef.current);
          } catch { /* ignore */ }
          widgetIdRef.current = null;
        }
        widgetIdRef.current = ts.render(hostRef.current, {
          sitekey: SITE_KEY,
          theme: 'dark',
          callback: (token) => {
            if (onTokenRef.current) onTokenRef.current(token || '');
          },
          'expired-callback': () => {
            if (onExpireRef.current) onExpireRef.current();
          },
          'error-callback': () => {
            if (onExpireRef.current) onExpireRef.current();
          },
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch { /* ignore */ }
        widgetIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!SITE_KEY || resetSignal <= 0 || widgetIdRef.current === null || !window.turnstile) return;
    try {
      window.turnstile.reset(widgetIdRef.current);
    } catch { /* ignore */ }
  }, [resetSignal]);

  if (!SITE_KEY) return null;

  return (
    <div className={`flex justify-center py-1 ${className}`}>
      <div ref={hostRef} />
    </div>
  );
}
