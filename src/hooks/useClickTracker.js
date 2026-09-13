import { useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const FLUSH_INTERVAL = 5000;
const RAGE_WINDOW_MS = 800;   // clicks this close together in time...
const RAGE_DISTANCE_PX = 40;  // ...and this close in position = rage click

function isMobile() {
  return window.innerWidth < 768;
}
function isInteractive(el) {
  return !!el.closest('button, a, [role="button"], input, select, textarea, label');
}

export function useClickTracker() {
  const clickBuffer = useRef([]);
  const recentClicks = useRef([]); // small rolling window, just for rage-click math
  const maxScroll = useRef(0);

  useEffect(() => {
    function handleClick(e) {
      const now = Date.now();
      const xPct = (e.clientX / window.innerWidth) * 100;
      const yPct = (e.pageY / document.documentElement.scrollHeight) * 100;

      // Rage-click check: any of the last few clicks within RAGE_WINDOW_MS
      // and RAGE_DISTANCE_PX of this one?
      const isRage = recentClicks.current.some(
        (c) => now - c.time < RAGE_WINDOW_MS &&
          Math.hypot(c.x - e.clientX, c.y - e.pageY) < RAGE_DISTANCE_PX
      );
      recentClicks.current.push({ time: now, x: e.clientX, y: e.pageY });
      recentClicks.current = recentClicks.current.filter((c) => now - c.time < RAGE_WINDOW_MS);

      clickBuffer.current.push({
        page: window.location.pathname,
        xPct,
        yPct,
        device: isMobile() ? 'mobile' : 'desktop',
        isRageClick: isRage,
        isDeadClick: !isInteractive(e.target),
      });
    }

    function handleScroll() {
      const scrolled = window.scrollY + window.innerHeight;
      const pct = Math.min(100, (scrolled / document.documentElement.scrollHeight) * 100);
      if (pct > maxScroll.current) maxScroll.current = pct;
    }

    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const interval = setInterval(() => {
      if (clickBuffer.current.length > 0) {
        const batch = clickBuffer.current;
        clickBuffer.current = [];
        fetch(`${API_URL}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: batch }),
        }).catch(() => {});
      }
      if (maxScroll.current > 0) {
        fetch(`${API_URL}/events/scroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: window.location.pathname, maxScrollPct: maxScroll.current, device: isMobile() ? 'mobile' : 'desktop' }),
        }).catch(() => {});
      }
    }, FLUSH_INTERVAL);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);
}