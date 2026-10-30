import React, { useState, useEffect } from 'react';
import Spinner from './Spinner.jsx';
import ErrorMessage from './ErrorMessage.jsx';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  loginUser,
  registerUser,
  getMe,
  logoutUser,
  getToken,
  generateTaskDescription,
} from '../api.js';

/**
 * Projects Component (Task Manager with Practical 7 Auth & Middleware Pipeline)
 * Renders full-stack Task Management connected to Node/Express/MongoDB with:
 * - JWT Registration & Login Modal with bcrypt password hashing
 * - Server-side Authorization (Bearer token validation)
 * - Server-side Input Validation middleware handling
 * - User-scoped task isolation & /me endpoint profile fetch
 */
function Projects() {
  // Auth State
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Task State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Task Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Practical 13: AI Assistant States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDisclaimer, setAiDisclaimer] = useState(false);

  // Deletion Modal State
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Toast State
  const [toasts, setToasts] = useState([]);

  // Search/Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Retry trigger
  const [retryCount, setRetryCount] = useState(0);

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Check existing auth token on mount
  useEffect(() => {
    let cancelled = false;
    const token = getToken();

    if (!token) {
      setUser(null);
      setAuthChecking(false);
      return;
    }

    setAuthChecking(true);
    getMe()
      .then((data) => {
        if (!cancelled && data?.user) {
          setUser(data.user);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setUser(null);
          if (err.status === 401) {
            showToast('Session expired. Please log in again.', 'error');
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAuthChecking(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch tasks whenever user changes or retry trigger changes
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getTasks()
      .then((data) => {
        if (!cancelled) {
          setTasks(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.status === 401) {
            setUser(null);
            setShowAuthModal(true);
            showToast('Authentication required or token expired.', 'error');
          } else {
            setError(err.message || 'Failed to connect to backend server.');
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, retryCount]);

  const handleRetry = () => {
    setRetryCount((count) => count + 1);
  };

  // Auth Form Submit Handler (Login / Register)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Email and password are required.');
      return;
    }

    if (authMode === 'register' && authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setAuthSubmitting(true);
    try {
      if (authMode === 'login') {
        const data = await loginUser({ email: authEmail.trim(), password: authPassword.trim() });
        setUser(data.user);
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
        showToast(`Welcome back, ${data.user.email}!`, 'success');
      } else {
        await registerUser({ email: authEmail.trim(), password: authPassword.trim() });
        showToast('Registration successful! Logging you in...', 'success');
        // Auto-login after registration
        const loginData = await loginUser({ email: authEmail.trim(), password: authPassword.trim() });
        setUser(loginData.user);
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setTasks([]);
    resetForm();
    showToast('Logged out successfully.', 'success');
  };

  // Handle task completion toggle with Optimistic UI update
  const handleToggleComplete = async (task) => {
    if (task.isOptimistic) return;

    const originalCompleted = task.completed;
    const newCompleted = !originalCompleted;

    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, completed: newCompleted } : t))
    );

    try {
      await updateTask(task._id, { completed: newCompleted });
      showToast(
        `Task "${task.title}" marked as ${newCompleted ? 'completed' : 'incomplete'}.`,
        'success'
      );
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, completed: originalCompleted } : t))
      );
      if (err.status === 401) {
        setUser(null);
        setShowAuthModal(true);
      }
      showToast(`Failed to update task status: ${err.message}`, 'error');
    }
  };

  // Task Form submit handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Task title is required!', 'error');
      return;
    }

    if (!user) {
      setShowAuthModal(true);
      showToast('Please log in to manage tasks.', 'error');
      return;
    }

    if (editingTaskId) {
      setSubmitting(true);
      try {
        const updatedTask = await updateTask(editingTaskId, {
          title: title.trim(),
          description: description.trim(),
          priority,
        });

        setTasks((prev) =>
          prev.map((t) => (t._id === editingTaskId ? updatedTask : t))
        );
        showToast('Task updated successfully!', 'success');
        resetForm();
      } catch (err) {
        if (err.status === 401) {
          setUser(null);
          setShowAuthModal(true);
        }
        showToast(`Failed to update task: ${err.message}`, 'error');
      } finally {
        setSubmitting(false);
      }
    } else {
      const tempId = 'temp-' + Date.now();
      const tempTask = {
        _id: tempId,
        title: title.trim(),
        description: description.trim(),
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      resetForm();
      setTasks((prev) => [tempTask, ...prev]);

      try {
        const confirmedTask = await createTask({
          title: tempTask.title,
          description: tempTask.description,
          priority: tempTask.priority,
        });

        setTasks((prev) =>
          prev.map((t) => (t._id === tempId ? confirmedTask : t))
        );
        showToast('Task created successfully!', 'success');
      } catch (err) {
        setTasks((prev) => prev.filter((t) => t._id !== tempId));
        setTitle(tempTask.title);
        setDescription(tempTask.description);
        setPriority(tempTask.priority);
        if (err.status === 401) {
          setUser(null);
          setShowAuthModal(true);
        }
        showToast(`Failed to save task: ${err.message}`, 'error');
      }
    }
  };

  const handleEditClick = (task) => {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setEditingTaskId(task._id);

    const formElement = document.getElementById('task-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteClick = (task) => {
    if (task.isOptimistic) return;
    setTaskToDelete(task);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    const id = taskToDelete._id;
    const titleStr = taskToDelete.title;
    setTaskToDelete(null);

    const originalTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t._id !== id));

    try {
      await deleteTask(id);
      showToast(`Task "${titleStr}" deleted successfully.`, 'success');
    } catch (err) {
      setTasks(originalTasks);
      if (err.status === 401) {
        setUser(null);
        setShowAuthModal(true);
      }
      showToast(`Failed to delete task: ${err.message}`, 'error');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setEditingTaskId(null);
    setAiDisclaimer(false);
    setAiLoading(false);
  };

  // Practical 13: Handle AI Task Description Generation
  const handleGenerateAIDescription = async () => {
    if (!title.trim()) {
      showToast('Please enter a task title first so AI has context!', 'error');
      return;
    }

    try {
      setAiLoading(true);
      const data = await generateTaskDescription(title.trim());

      if (data?.description) {
        // Set returned description as an editable suggestion
        setDescription(data.description);
        setAiDisclaimer(true);

        if (data.fallback) {
          showToast(data.message || 'AI API unavailable — provided smart contextual template.', 'info');
        } else {
          showToast(`✨ AI description generated via ${data.provider || 'AI'}! Review and edit below.`, 'success');
        }
      } else {
        showToast('Could not generate description. Please enter one manually.', 'error');
      }
    } catch (err) {
      if (err.status === 429) {
        showToast(err.message || 'AI rate limit exceeded. Please wait a moment before trying again.', 'error');
      } else {
        showToast(`AI generation error: ${err.message || 'Service unavailable'}. Please type manually.`, 'error');
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Filter tasks based on Search, Status, and Priority
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      filterPriority === 'all' || task.priority === filterPriority;

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && task.completed) ||
      (filterStatus === 'pending' && !task.completed);

    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <section id="projects" className="section task-manager-section">
      <div className="glow-blur" style={{ bottom: '15%', right: '25%' }} />
      <div className="glow-blur" style={{ top: '10%', left: '15%' }} />

      <span className="section-subtitle">Practical 7 Integration</span>
      <h2 className="section-title">Auth & Middleware Pipeline</h2>

      <p className="projects-api-note">
        JWT Authentication & Server Middleware connected to MongoDB at{' '}
        <code>http://localhost:5000/tasks</code>.
      </p>

      {/* Auth Control Bar */}
      <div className="auth-status-bar glass-card">
        {authChecking ? (
          <div className="auth-status-loading">
            <Spinner /> <span>Verifying JWT session...</span>
          </div>
        ) : user ? (
          <div className="auth-status-logged-in">
            <div className="user-info-badge">
              <span className="auth-icon">🔐</span>
              <span>
                Authenticated as <strong>{user.email}</strong>
              </span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              🚪 Logout
            </button>
          </div>
        ) : (
          <div className="auth-status-logged-out">
            <span className="auth-warning-text">
              🔒 You must be logged in to view and manage tasks.
            </span>
            <div className="auth-actions">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                  setShowAuthModal(true);
                }}
                className="btn btn-primary btn-sm"
              >
                🔑 Log In
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setAuthError(null);
                  setShowAuthModal(true);
                }}
                className="btn btn-secondary btn-sm"
              >
                ✨ Register
              </button>
            </div>
          </div>
        )}
      </div>

      {/* If Not Logged In Prompt */}
      {!authChecking && !user && (
        <div className="task-auth-prompt glass-card">
          <h3>Authentication Required</h3>
          <p>Please log in or create a new account to access your user-protected task dashboard.</p>
          <div className="auth-prompt-buttons">
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
                setShowAuthModal(true);
              }}
              className="btn btn-primary"
            >
              Sign In to Continue
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
                setShowAuthModal(true);
              }}
              className="btn btn-secondary"
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* Task Content - Only if User is Authenticated */}
      {user && (
        <>
          {/* Task Creation/Editing Form Section */}
          <div id="task-form-section" className="task-form-container glass-card">
            <h3>{editingTaskId ? '📝 Edit Task' : '➕ Create New Task'}</h3>
            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-group">
                <label htmlFor="task-title">Task Title *</label>
                <input
                  id="task-title"
                  type="text"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <div className="label-with-ai-action">
                  <label htmlFor="task-desc">Description</label>
                  <button
                    type="button"
                    onClick={handleGenerateAIDescription}
                    disabled={aiLoading || submitting || !title.trim()}
                    className="btn-ai-generate"
                    title={title.trim() ? "Auto-generate actionable description with AI" : "Enter a task title first"}
                  >
                    {aiLoading ? (
                      <>
                        <span className="ai-btn-spinner" aria-hidden="true" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">✨</span>
                        <span>Generate with AI</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  id="task-desc"
                  rows={3}
                  placeholder="Add more details about this task, or click 'Generate with AI'..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  disabled={submitting}
                />
                {aiDisclaimer && (
                  <div className="ai-disclaimer-banner" role="status">
                    <span className="ai-badge">🤖 AI Suggestion</span>
                    <span className="ai-disclaimer-text">
                      This description was AI-generated. Review and edit before saving.
                    </span>
                    <button
                      type="button"
                      className="ai-dismiss-btn"
                      onClick={() => setAiDisclaimer(false)}
                      title="Dismiss disclaimer"
                      aria-label="Dismiss AI suggestion note"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="task-priority">Priority</label>
                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>

                <div className="form-actions-inline">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : editingTaskId ? 'Update Task' : 'Add Task'}
                  </button>
                  {editingTaskId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn btn-secondary"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Loading State */}
          {loading && <Spinner />}

          {/* Error State */}
          {!loading && error && (
            <ErrorMessage message={error} onRetry={handleRetry} />
          )}

          {/* Tasks Display */}
          {!loading && !error && (
            <>
              {/* Toolbar */}
              <div className="task-toolbar glass-card">
                <div className="toolbar-search">
                  <label htmlFor="task-search" className="visually-hidden">
                    Search tasks
                  </label>
                  <input
                    id="task-search"
                    type="search"
                    className="toolbar-input"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="toolbar-filters">
                  <div className="filter-group">
                    <label htmlFor="filter-priority">Priority:</label>
                    <select
                      id="filter-priority"
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                    >
                      <option value="all">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="filter-status">Status:</label>
                    <select
                      id="filter-status"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <span className="task-count">
                  {filteredTasks.length} of {tasks.length} tasks
                </span>
              </div>

              {/* Task Grid */}
              {filteredTasks.length === 0 ? (
                <div className="task-empty-state glass-card">
                  <p>
                    {tasks.length === 0
                      ? 'No tasks created yet. Use the form above to add your first task!'
                      : 'No tasks match your selected search filters.'}
                  </p>
                </div>
              ) : (
                <div className="tasks-grid">
                  {filteredTasks.map((task) => (
                    <article
                      key={task._id}
                      className={`task-card glass-card priority-${task.priority} ${
                        task.completed ? 'task-completed' : ''
                      } ${task.isOptimistic ? 'task-optimistic-loading' : ''}`}
                    >
                      {task.isOptimistic && (
                        <div className="optimistic-overlay">
                          <Spinner />
                          <span>Saving to server...</span>
                        </div>
                      )}

                      <div className="task-card-header">
                        <span className={`priority-badge badge-${task.priority}`}>
                          {task.priority.toUpperCase()}
                        </span>

                        <div className="task-checkbox-wrapper">
                          <input
                            type="checkbox"
                            id={`check-${task._id}`}
                            checked={task.completed}
                            onChange={() => handleToggleComplete(task)}
                            disabled={task.isOptimistic}
                            className="task-checkbox"
                            title="Toggle task completion"
                          />
                          <label htmlFor={`check-${task._id}`} className="visually-hidden">
                            Complete Task
                          </label>
                        </div>
                      </div>

                      <div className="task-card-content">
                        <h3>{task.title}</h3>
                        {task.description && <p>{task.description}</p>}
                      </div>

                      <div className="task-card-footer">
                        <span className="task-date">
                          {new Date(task.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        <div className="task-card-actions">
                          <button
                            onClick={() => handleEditClick(task)}
                            disabled={task.isOptimistic || task.completed}
                            className="btn-icon"
                            title="Edit task title/description"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteClick(task)}
                            disabled={task.isOptimistic}
                            className="btn-icon btn-icon-delete"
                            title="Delete task"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Authentication Modal (Login / Register) */}
      {showAuthModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog glass-card auth-modal-dialog">
            <div className="auth-modal-header">
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                >
                  🔑 Sign In
                </button>
                <button
                  type="button"
                  className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                  }}
                >
                  ✨ Register
                </button>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAuthModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="auth-form">
              <h3>{authMode === 'login' ? 'Sign In to Your Account' : 'Create New Account'}</h3>

              {authError && <div className="auth-error-alert">{authError}</div>}

              <div className="form-group">
                <label htmlFor="auth-email">Email Address *</label>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="student@charusat.edu.in"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                  disabled={authSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="auth-password">Password *</label>
                <input
                  id="auth-password"
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  disabled={authSubmitting}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={authSubmitting}
                >
                  {authSubmitting
                    ? 'Processing...'
                    : authMode === 'login'
                    ? 'Log In'
                    : 'Create Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="btn btn-secondary"
                  disabled={authSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Glassmorphism Modal Dialog */}
      {taskToDelete && (
        <div className="modal-backdrop">
          <div className="modal-dialog glass-card">
            <h3>⚠️ Confirm Deletion</h3>
            <p>
              Are you sure you want to delete the task{' '}
              <strong>"{taskToDelete.title}"</strong>?
            </p>
            <p className="modal-warning-subtext">This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={handleDeleteConfirm} className="btn btn-danger">
                Delete
              </button>
              <button onClick={() => setTaskToDelete(null)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications Overlay Container */}
      <div className="toasts-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-alert glass-card toast-${toast.type}`}
            role="alert"
          >
            <span className="toast-symbol">
              {toast.type === 'success' ? '✅' : '❌'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;
