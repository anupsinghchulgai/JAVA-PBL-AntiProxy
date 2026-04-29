import { useCallback } from 'react';

export function useGeolocation() {
  const getPosition = useCallback(
    () =>
      new Promise((resolve, reject) => {
        // DEMO fallback: if GPS permission/timing is blocked on phones/laptops,
        // teacher QR must still be generated to show the flow.
        const DEMO_LAT = 28.6139; // Delhi (demo only)
        const DEMO_LNG = 77.2090; // demo only
        const DEMO_ACCURACY_METERS = 5000;

        if (!navigator.geolocation) {
          resolve({ lat: DEMO_LAT, lng: DEMO_LNG, accuracy: DEMO_ACCURACY_METERS });
          return;
        }

        // Fail-fast for demo: even if browser geolocation hangs,
        // we will reject after this timeout.
        const FAIL_MS = 15000; // 15s
        let settled = false;
        const timer = setTimeout(() => {
          if (settled) return;
          settled = true;
          resolve({ lat: DEMO_LAT, lng: DEMO_LNG, accuracy: DEMO_ACCURACY_METERS });
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
            // For demo: still resolve so teacher can generate QR.
            resolve({ lat: DEMO_LAT, lng: DEMO_LNG, accuracy: DEMO_ACCURACY_METERS });
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
        );
      }),
    []
  );
  return { getPosition };
}
