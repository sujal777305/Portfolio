/**
 * api.js
 * Central API helper for Task Manager CRUD operations & Practical 7 Authentication.
 * Communicates with the Express backend on http://localhost:5000.
 */

export const BASE_URL = 'http://localhost:5000';

/**
 * JWT Token Storage Helpers
 */
export function getToken() {
  return localStorage.getItem('jwt_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('jwt_token', token);
  }
}

export function removeToken() {
  localStorage.removeItem('jwt_token');
}

/**
 * Returns Authorization header object if token exists.
 */
function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Helper function to handle fetch responses and handle JSON/HTTP errors.
 */
async function handleResponse(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
    }
    const errorMsg = data?.error || data?.message || `HTTP error! Status: ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    if (data?.details) {
      error.details = data.details;
    }
    throw error;
  }
  return data;
}

/**
 * User Registration (POST /register)
 */
export async function registerUser(credentials) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return handleResponse(res);
}

/**
 * User Login (POST /login)
 */
export async function loginUser(credentials) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  const data = await handleResponse(res);
  if (data?.token) {
    setToken(data.token);
  }
  return data;
}

/**
 * Get Logged-in User Profile (GET /me)
 */
export async function getMe() {
  const res = await fetch(`${BASE_URL}/me`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(res);
}

/**
 * Logout User
 */
export function logoutUser() {
  removeToken();
}

/**
 * Fetch all tasks for the logged-in user.
 */
export async function getTasks() {
  const res = await fetch(`${BASE_URL}/tasks`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(res);
}

/**
 * Create a new task.
 * @param {Object} taskData - { title, description, priority }
 */
export async function createTask(taskData) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(taskData),
  });
  return handleResponse(res);
}

/**
 * Update an existing task.
 * @param {string} id - Task Mongo ID
 * @param {Object} taskData - Fields to update (e.g. { title, description, completed, priority })
 */
export async function updateTask(id, taskData) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(taskData),
  });
  return handleResponse(res);
}

/**
 * Delete a task.
 * @param {string} id - Task Mongo ID
 */
export async function deleteTask(id) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(res);
}
