// Wraps the browser's global fetch once, at app startup. Every existing
// service file keeps using plain fetch() exactly as it does now — this
// silently watches every response for a 401 (expired/invalid token) and
// handles logout + redirect centrally, so no other file needs to change.

const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const response = await originalFetch(...args);

  if (response.status === 401 && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
  }

  return response;
};