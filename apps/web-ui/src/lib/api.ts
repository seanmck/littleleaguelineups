const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem('token');
  const headers = new Headers(init?.headers);

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
