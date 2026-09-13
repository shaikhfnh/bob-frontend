const API_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('admin_token')}` };
}

export async function getHeatmapEvents(page = '/', { device = 'all' } = {}) {
  const res = await fetch(`${API_URL}/events?page=${encodeURIComponent(page)}&device=${device}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load heatmap data');
  return res.json();
}

export async function getScrollSummary(page = '/') {
  const res = await fetch(`${API_URL}/events/scroll-summary?page=${encodeURIComponent(page)}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load scroll data');
  return res.json();
}