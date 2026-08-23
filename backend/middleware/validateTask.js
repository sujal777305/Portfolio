/**
 * Task Validation Middleware
 * Checks required fields exist and are valid before reaching the controller.
 */
const validateTaskInput = (req, res, next) => {
  const { title, priority } = req.body;

  // On creation (POST), title is required
  if (req.method === 'POST') {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: 'Validation failed',
        details: [{ field: 'title', message: 'Task title is required' }]
      });
    }
  }

  // On update (PUT), if title is explicitly passed, it must not be empty
  if (req.method === 'PUT' && title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: 'Validation failed',
        details: [{ field: 'title', message: 'Task title cannot be empty' }]
      });
    }
  }

  // Priority validation if provided
  if (priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        error: 'Validation failed',
        details: [{ field: 'priority', message: 'Priority must be low, medium, or high' }]
      });
    }
  }

  next();
};

module.exports = validateTaskInput;
