const API_URL = import.meta.env.VITE_API_URL;

export async function sendOtp(email) {
  const res = await fetch(`${API_URL}/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to send code.');
  return res.json();
}

export async function verifyOtp(email, code) {
  const res = await fetch(`${API_URL}/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Invalid code.');
  return res.json();
}