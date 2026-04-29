import { useCallback } from 'react';

export function useGeolocation() {
  const getPosition = useCallback(
    () =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (p) =>
            resolve({
              lat: p.coords.latitude,
              lng: p.coords.longitude,
              accuracy: p.coords.accuracy,
            }),
          (e) => {
            const msgs = {
              1: 'Location permission denied.',
              2: 'Location unavailable.',
              3: 'Location request timed out.',
            };
            reject(new Error(msgs[e.code] || 'Unknown location error.'));
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }),
    []
  );
  return { getPosition };
}
