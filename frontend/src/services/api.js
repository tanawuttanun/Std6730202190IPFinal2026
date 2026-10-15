import { API_URL, REQUEST_TIMEOUT_MS } from '../config/api';

let authToken = null;
export const setAuthToken = (token) => {
  authToken = token;
};
export const getAuthToken = () => authToken;

// fetch wrapper: JSON in/out, timeout, readable error messages.
// Errors thrown here have .status (HTTP code) when the server answered.
async function request(method, path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    throw new Error(
      e.name === 'AbortError'
        ? `Server did not respond in time (${API_URL})`
        : `Cannot connect to server at ${API_URL}. Is the backend running and on the same network?`
    );
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  health: () => request('GET', '/api/health'),
  login: (username, password) => request('POST', '/api/login', { username, password }),
  getEmployees: () => request('GET', '/api/employees'),
  addEmployee: (employee) => request('POST', '/api/employees', employee),
  toggleStatus: (id) => request('PUT', `/api/employees/${encodeURIComponent(id)}/status`),
  deleteEmployee: (id) => request('DELETE', `/api/employees/${encodeURIComponent(id)}`),
  getSalaryClusters: () => request('GET', '/api/employees/salary-clusters'),
};
