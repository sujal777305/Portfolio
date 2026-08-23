import React, { useState, useEffect } from 'react';
import Spinner from './Spinner.jsx';
import ErrorMessage from './ErrorMessage.jsx';
import { getTasks, createTask, updateTask, deleteTask } from '../api.js';

/**
 * Projects Component (Replaced with Task Manager for Practical 6)
 * Renders a full-stack Task Management Board connected to Node/Express/MongoDB.
 * Features: Complete CRUD, Optimistic UI Updates, Custom Deletion Dialog, Toast Notifications.
 */
function Projects() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Deletion Modal State
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Toast State
  const [toasts, setToasts] = useState([]);

  // Search/Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Trigger effect retry
  const [retryCount, setRetryCount] = useState(0);

  // Show dynamic toast notifications
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch tasks on component mount
  useEffect(() => {
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
          setError(err.message || 'Failed to connect to the backend server.');
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
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount((count) => count + 1);
  };

  // Handle task completion toggle with Optimistic UI updates
  const handleToggleComplete = async (task) => {
    if (task.isOptimistic) return; // ignore optimistic cards

    const originalCompleted = task.completed;
    const newCompleted = !originalCompleted;

    // Optimistically update local state
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
      // Rollback to original state if backend fails
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, completed: originalCompleted } : t))
      );
      showToast(`Failed to update task status: ${err.message}`, 'error');
    }
  };

  // Form submit handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Task title is required!', 'error');
      return;
    }

    if (editingTaskId) {
      // UPDATE ACTION (Normal submitting flow)
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
        showToast(`Failed to update task: ${err.message}`, 'error');
      } finally {
        setSubmitting(false);
      }
    } else {
      // CREATE ACTION (Optimistic UI Update)
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

      // Clear form inputs immediately
      resetForm();

      // Instantly inject the optimistic task into list
      setTasks((prev) => [tempTask, ...prev]);

      try {
        const confirmedTask = await createTask({
          title: tempTask.title,
          description: tempTask.description,
          priority: tempTask.priority,
        });

        // Swap the temporary optimistic item for the persistent backend item
        setTasks((prev) =>
          prev.map((t) => (t._id === tempId ? confirmedTask : t))
        );
        showToast('Task created successfully!', 'success');
      } catch (err) {
        // Rollback: Remove the optimistic item and restore form fields
        setTasks((prev) => prev.filter((t) => t._id !== tempId));
        setTitle(tempTask.title);
        setDescription(tempTask.description);
        setPriority(tempTask.priority);
        showToast(`Failed to save task: ${err.message}`, 'error');
      }
    }
  };

  // Set form into edit mode
  const handleEditClick = (task) => {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setEditingTaskId(task._id);

    // Smooth scroll to form section
    const formElement = document.getElementById('task-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Open confirmation modal for deletion
  const handleDeleteClick = (task) => {
    if (task.isOptimistic) return;
    setTaskToDelete(task);
  };

  // Handle actual backend deletion
  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    const id = taskToDelete._id;
    const titleStr = taskToDelete.title;
    setTaskToDelete(null); // Close modal

    // Temporarily save original tasks in case of rollback
    const originalTasks = [...tasks];

    // Optimistically remove from local state
    setTasks((prev) => prev.filter((t) => t._id !== id));

    try {
      await deleteTask(id);
      showToast(`Task "${titleStr}" deleted successfully.`, 'success');
    } catch (err) {
      // Rollback
      setTasks(originalTasks);
      showToast(`Failed to delete task: ${err.message}`, 'error');
    }
  };

  // Reset form inputs
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setEditingTaskId(null);
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
      {/* Decorative blurred glow effects */}
      <div className="glow-blur" style={{ bottom: '15%', right: '25%' }} />
      <div className="glow-blur" style={{ top: '10%', left: '15%' }} />

      <span className="section-subtitle">Practical 6 Integration</span>
      <h2 className="section-title">Task Management</h2>

      <p className="projects-api-note">
        Live full-stack connection to MongoDB backend at{' '}
        <code>http://localhost:5000/tasks</code>.
      </p>

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
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              rows={3}
              placeholder="Add more details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              disabled={submitting}
            />
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

      {/* Success Content rendering */}
      {!loading && !error && (
        <>
          {/* Filters & Search Toolbar */}
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

          {/* Task Lists Grid */}
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
              <button
                onClick={handleDeleteConfirm}
                className="btn btn-danger"
              >
                Delete
              </button>
              <button
                onClick={() => setTaskToDelete(null)}
                className="btn btn-secondary"
              >
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
