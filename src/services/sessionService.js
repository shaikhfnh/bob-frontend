const API_URL = import.meta.env.VITE_API_URL;

export async function getSessions() {
  const res = await fetch(`${API_URL}/sessions`);
  if (!res.ok) throw new Error('Failed to load sessions');
  return res.json();
}

function authHeaders() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export async function createSession(data) {
  const res = await fetch(`${API_URL}/sessions`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to create session');
  return res.json();
}
export async function updateSession(id, data) {
  const res = await fetch(`${API_URL}/sessions/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to update session');
  return res.json();
}
export async function deleteSession(id) {
  const res = await fetch(`${API_URL}/sessions/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete session');
  return res.json();
}