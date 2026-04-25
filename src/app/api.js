let onUnauthorized = null;

// Registered by App.js so a 401 from any call (other than the explicit
// /auth/login/success probe, which returns 200 with success:false) clears
// stale client-side auth state without waiting for the 30-min poll.
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function request(method, url, data) {
  const options = {
    method,
    credentials: 'include',
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  };
  const res = await fetch(url, options);
  if (!res.ok) {
    if (res.status === 401 && typeof onUnauthorized === 'function') {
      try { onUnauthorized(); } catch (_) { /* handler must not break the throw path */ }
    }
    const err = new Error(`HTTP ${res.status}`);
    err.response = { status: res.status, data: await res.json().catch(() => ({})) };
    throw err;
  }
  // Guard against empty bodies (e.g. 204 No Content from DELETE endpoints)
  const text = await res.text();
  return { data: text ? JSON.parse(text) : null };
}

export const api = {
  get: (url) => request('GET', url, null),
  post: (url, data) => request('POST', url, data),
  put: (url, data) => request('PUT', url, data),
  delete: (url) => request('DELETE', url, null),
};
