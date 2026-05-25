const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const token = localStorage.getItem('trustbase_token');

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Check your connection and try again');
  }

  if (res.status === 401) {
    localStorage.removeItem('trustbase_token');
    localStorage.removeItem('trustbase_user');
    const authErr = new Error('Unauthorized');
    authErr.status = 401;
    throw authErr;
  }

  if (res.status === 429) {
    const body = await res.json().catch(() => ({}));
    const ratErr = new Error(body.message || 'Too many requests, please wait');
    ratErr.status = 429;
    throw ratErr;
  }

  if (res.status >= 500) {
    throw new Error('Something went wrong');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data.data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
};
