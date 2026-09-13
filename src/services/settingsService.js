const API_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('admin_token')}` };
}

export async function getSettings() {
  const res = await fetch(`${API_URL}/settings`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function updateSetting(key, value) {
  const res = await fetch(`${API_URL}/settings/${key}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error('Failed to update setting');
  return res.json();
}