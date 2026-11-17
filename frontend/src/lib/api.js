import { applyUserTheme } from './theme';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Backend is unavailable. Check that the backend is running.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export function saveAuthenticatedUser({ token, user }) {
  sessionStorage.setItem('authToken', token);
  sessionStorage.setItem('userRole', user.role);
  sessionStorage.setItem('userName', user.fullName);
  sessionStorage.setItem('profilePhoto', user.profilePhoto);
  applyUserTheme(user.theme || 'System');
}
