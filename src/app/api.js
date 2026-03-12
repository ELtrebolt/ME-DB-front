async function request(method, url, data) {
  const options = {
    method,
    credentials: 'include',
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  };
  const res = await fetch(url, options);
  if (!res.ok) {
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
