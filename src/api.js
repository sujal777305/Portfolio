/**
 * api.js
 * Central API helper for Task Manager CRUD operations.
 * Communicates with the Express backend on http://localhost:5000.
 */

export const BASE_URL = 'http://localhost:5000';

/**
 * Helper function to handle fetch responses and handle JSON/HTTP errors.
 */
async function handleResponse(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    // If it's a validation error, extract details if possible
    const errorMsg = data?.error || data?.message || `HTTP error! Status: ${response.status}`;
    const error = new Error(errorMsg);
    if (data?.details) {
      error.details = data.details; // validation details
    }
    throw error;
  }
  return data;
}

/**
 * Fetch all tasks from the backend.
 */
export async function getTasks() {
  const res = await fetch(`${BASE_URL}/tasks`);
  return handleResponse(res);
}

/**
 * Create a new task.
 * @param {Object} taskData - { title, description, priority, completed }
 */
export async function createTask(taskData) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
  });
  return handleResponse(res);
}
