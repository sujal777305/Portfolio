const EventEmitter = require('events');

/**
 * Custom EventEmitter for Task Management application
 * Decouples background asynchronous notifications from the critical HTTP request-response cycle.
 */
class TaskEvents extends EventEmitter {}

// Export a singleton instance of TaskEvents
module.exports = new TaskEvents();
