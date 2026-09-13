import { getVisitorId } from '../utils/visitorId';

const API_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('admin_token')}` };
}
function currentDevice() {
  return window.innerWidth < 768 ? 'mobile' : 'desktop';
}
function currentLanguage() {
  return localStorage.getItem('current_language') || 'en';
}

export function logFunnelEvent(eventType, sessionId = null, source = null) {
  fetch(`${API_URL}/funnel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visitorId: getVisitorId(), eventType, sessionId, source,
      device: currentDevice(), language: currentLanguage(),
    }),
  }).catch(() => {});
}

const touchedFields = new Set();
export function logFieldFocus(fieldName) {
  if (touchedFields.has(fieldName)) return;
  touchedFields.add(fieldName);
  fetch(`${API_URL}/funnel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visitorId: getVisitorId(), eventType: 'field_focus', fieldName,
      device: currentDevice(), language: currentLanguage(),
    }),
  }).catch(() => {});
}

export async function getFunnelSummary() {
  const res = await fetch(`${API_URL}/funnel/summary`, { headers: authHeaders() });
  return res.json();
}
export async function getTimeToComplete() {
  const res = await fetch(`${API_URL}/funnel/time-to-complete`, { headers: authHeaders() });
  return res.json();
}
export async function getSessionLeaderboard() {
  const res = await fetch(`${API_URL}/funnel/session-leaderboard`, { headers: authHeaders() });
  return res.json();
}
export async function getPeakHours() {
  const res = await fetch(`${API_URL}/funnel/peak-hours`, { headers: authHeaders() });
  return res.json();
}
export async function getDropoff() {
  const res = await fetch(`${API_URL}/funnel/dropoff`, { headers: authHeaders() });
  return res.json();
}
export async function getSources() {
  const res = await fetch(`${API_URL}/funnel/sources`, { headers: authHeaders() });
  return res.json();
}
export async function getLanguageSplit() {
  const res = await fetch(`${API_URL}/funnel/language-split`, { headers: authHeaders() });
  return res.json();
}
export async function getDeviceSplit() {
  const res = await fetch(`${API_URL}/funnel/device-split`, { headers: authHeaders() });
  return res.json();
}
export async function getTrend() {
  const res = await fetch(`${API_URL}/funnel/trend`, { headers: authHeaders() });
  return res.json();
}