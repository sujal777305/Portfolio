const taskEvents = require('./events');

/**
 * Event Listeners for Task Management Background Processing (Practical 10)
 * Demonstrates non-blocking background task execution using Node.js EventEmitter.
 */

// Listener for 'task-created' event
taskEvents.on('task-created', (task) => {
    console.log(`[Event Received] 'task-created' event caught by listener at ${new Date().toISOString()}`);

    // Artificial delay (2 seconds) simulating slow background processing (e.g. email, push notification)
    setTimeout(() => {
        try {
            if (!task || !task.title) {
                throw new Error('Invalid task payload received in task-created listener');
            }

            console.log(
                `[Notification] Task "${task.title}" created at ${new Date().toISOString()} (Assigned User: ${task.user})`
            );
        } catch (err) {
            // Forward error to custom error event listener to prevent server crashes
            taskEvents.emit('error', err);
        }
    }, 2000);
});

// Listener for 'task-deleted' event (Supplementary Problem 1)
taskEvents.on('task-deleted', (task) => {
    console.log(`[Event Received] 'task-deleted' event caught by listener at ${new Date().toISOString()}`);

    // Artificial delay (1 second) simulating deletion cleanup/audit logging
    setTimeout(() => {
        try {
            if (!task || !task._id) {
                throw new Error('Invalid task payload received in task-deleted listener');
            }

            console.log(
                `[Notification] Task "${task.title}" (ID: ${task._id}) deleted at ${new Date().toISOString()} (User: ${task.user})`
            );
        } catch (err) {
            taskEvents.emit('error', err);
        }
    }, 1000);
});

// Dedicated error listener (Supplementary Problem 2)
// Node.js EventEmitter throws an uncaught exception if an 'error' event is emitted without a listener
taskEvents.on('error', (err) => {
    console.error(`[TaskEvents Error] Handled background event error at ${new Date().toISOString()}: ${err.message}`);
});

console.log('[TaskEvents] Event listeners successfully registered');
