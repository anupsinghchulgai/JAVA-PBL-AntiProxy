import { useCallback } from 'react';

export function useGeolocation() {
  const getPosition = useCallback(
    () =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }

        // Fail-fast for demo: even if browser geolocation hangs,
        // we will reject after this timeout.
        const FAIL_MS = 15000; // 15s
        let settled = false;
        const timer = setTimeout(() => {
          if (settled) return;
          settled = true;
          reject(new Error('GPS location timeout. Please allow Location permission and try again.'));
        }, FAIL_MS);

        navigator.geolocation.getCurrentPosition(
          (p) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve({
              lat: p.coords.latitude,
              lng: p.coords.longitude,
              accuracy: p.coords.accuracy,
            });
          },
          (e) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            const msgs = {
              1: 'Location permission denied.',
              2: 'Location unavailable.',
              3: 'Location request timed out.',
            };
            reject(new Error(msgs[e.code] || 'Unknown location error.'));
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
        );
      }),
    []
  );
  return { getPosition };
}
