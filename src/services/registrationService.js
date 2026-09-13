const API_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('admin_token')}` };
}

export async function submitRegistration(form) {
  const res = await fetch(`${API_URL}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to register');
  return res.json();
}

export async function getRegistrations() {
  const res = await fetch(`${API_URL}/registrations`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to load registrations');
  return res.json();
}

export async function updateRegistration(id, data) {
  const res = await fetch(`${API_URL}/registrations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to update booking');
  return res.json();
}

export async function deleteRegistration(id) {
  const res = await fetch(`${API_URL}/registrations/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to cancel booking');
  return res.json();
}