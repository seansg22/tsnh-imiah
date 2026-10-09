import { useEffect } from 'react';
import { getAccount, isAuto, isEnabled, sync } from '../lib/cloudSync';

const INTERVAL_MS = 5 * 60_000;

// Auto-sync (pull + merge + push) on first render, then every 5 min, but only while the app is
// focused (so a backgrounded tab never hits the BE). Regaining focus catches up if a tick was missed.
export function useCloudSync() {
  useEffect(() => {
    let last = 0;
    const run = () => {
      if (document.visibilityState !== 'visible' || !document.hasFocus()) return;
      if (!getAccount() || !isEnabled() || !isAuto()) return;
      last = Date.now();
      sync().catch(() => {}); // offline-safe: retry next tick
    };
    const onFocus = () => { if (Date.now() - last >= INTERVAL_MS) run(); };

    run();
    const id = setInterval(run, INTERVAL_MS);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);
}
