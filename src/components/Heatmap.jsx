import { useRef, useEffect, useState } from 'react';
import { getHeatmapEvents } from '../services/analyticsService';

const PUBLIC_SITE_URL = 'http://localhost:5173';
const DEVICE_WIDTHS = { desktop: 1440, mobile: 390 };

export default function Heatmap({ page = '/' }) {
  const canvasRef = useRef(null);
  const [pageHeight, setPageHeight] = useState(null); // was 3000 — that stale guess was the bug
  const [device, setDevice] = useState('desktop');
  const [opacity, setOpacity] = useState(0.7);
  const [events, setEvents] = useState([]);

  const frameWidth = DEVICE_WIDTHS[device];
  const isMobile = device === 'mobile';

  // THE ACTUAL FIX: the moment device changes, throw away the old height.
  // Nothing renders sized-to-the-wrong-layout while waiting for the new one.
  useEffect(() => {
    setPageHeight(1000);
  }, [device]);

  useEffect(() => {
    function handleMessage(e) {
      if (e.data?.type === 'PAGE_HEIGHT') setPageHeight(e.data.height);
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [device]);

  useEffect(() => {
    getHeatmapEvents(page, { device }).then(setEvents);
  }, [page, device]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pageHeight) return; // don't draw against a height we don't trust
    canvas.width = frameWidth;
    canvas.height = pageHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    events.forEach((e) => {
      const x = (e.x_pct / 100) * canvas.width;
      const y = (e.y_pct / 100) * canvas.height;
      const color = e.is_rage_click ? '245,158,11' : e.is_dead_click ? '107,114,128' : '200,16,46';
      const r = isMobile ? 18 : 28;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(${color},0.15)`);
      grad.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
  }, [pageHeight, events, frameWidth, isMobile]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <div className="flex gap-1.5 rounded-lg bg-neutral-100 p-1">
          {['desktop', 'mobile'].map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold capitalize transition-all ${
                device === d ? 'bg-white shadow-sm' : 'text-brand-muted'
              }`}
            >
              {d === 'mobile' ? '📱' : '🖥️'} {d}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-brand-muted">Opacity</label>
          <input type="range" min="0.2" max="1" step="0.1" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
        </div>
        <span className="text-xs text-brand-muted">{pageHeight ? `${events.length} clicks` : 'Switching...'}</span>
      </div>

      <div className={`relative h-[720px] w-full overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-100 ${isMobile ? 'flex justify-center py-6' : ''}`}>
        {!pageHeight ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-brand-muted">
            Loading {device} layout...
          </div>
        ) : (
          <div
            className={`relative ${isMobile ? 'overflow-hidden rounded-[2rem] border-[6px] border-neutral-900 shadow-xl' : 'w-full'}`}
            style={{ width: frameWidth, height: pageHeight }}
          >
            <iframe
              key={device}
              src={PUBLIC_SITE_URL}
              title="Live site preview"
              scrolling="no"
              className="absolute left-0 top-0 border-0"
              style={{ width: frameWidth, height: pageHeight }}
            />
            <canvas
              className="pointer-events-none absolute left-0 top-0"
              ref={canvasRef}
              style={{ width: frameWidth, height: pageHeight, opacity }}
            />
          </div>
        )}
      </div>
    </div>
  );
}