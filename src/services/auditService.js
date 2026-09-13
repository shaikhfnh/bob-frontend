const API_URL = import.meta.env.VITE_API_URL;

export async function getAuditLog() {
  const res = await fetch(`${API_URL}/audit`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to load audit log');
  return res.json();
}