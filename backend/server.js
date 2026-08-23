const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Task = require('./models/Task');
const User = require('./models/User');
const authMiddleware = require('./middleware/auth');
const validateTaskInput = require('./middleware/validateTask');

const app = express();

app.use(cors());
app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// JSON Content-Type validation for state-modifying endpoints
app.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        if (!req.is('application/json')) {
            return res.status(400).json({
                error: 'Content-Type must be application/json'
            });
        }
    }
    next();
});

// Task ID validation helper
const validateTaskId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            error: 'Invalid task ID'
        });
    }
    next();
};

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err.message));

// ==========================================
// AUTHENTICATION ROUTES (Practical 7)
// ==========================================

// POST /register - Register a new user with bcrypt password hashing
app.post('/register', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long'
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists with this email'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (err) {
        next(err);
    }
});

// POST /login - Verify credentials & issue JWT token (1h expiry)
app.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const secret = process.env.JWT_SECRET || 'fallback_secret_key';
        const token = jwt.sign(
            { id: user._id, email: user.email },
            secret,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (err) {
        next(err);
    }
});

// GET /me - Return currently logged-in user's details using decoded JWT
app.get('/me', authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (err) {
        next(err);
    }
});

// ==========================================
// TASK ROUTES (Protected by Auth & Validation Middleware)
// ==========================================

// Apply authMiddleware to protect all /tasks routes
app.use('/tasks', authMiddleware);

app.get('/tasks', async (req, res, next) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
});

app.get('/tasks/:id', validateTaskId, async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

        if (!task) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        res.status(200).json(task);
    } catch (err) {
        next(err);
    }
});

app.post('/tasks', validateTaskInput, async (req, res, next) => {
    try {
        const task = await Task.create({
            ...req.body,
            user: req.user.id
        });
        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
});

app.put('/tasks/:id', validateTaskId, validateTaskInput, async (req, res, next) => {
    try {
        const update = { ...req.body };

        if (typeof update.title === 'string') {
            update.title = update.title.trim();
        }

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            update,
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        res.status(200).json(task);
    } catch (err) {
        next(err);
    }
});

app.delete('/tasks/:id', validateTaskId, async (req, res, next) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        if (!task) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        res.status(200).json({
            message: 'Task deleted successfully',
            task
        });
    } catch (err) {
        next(err);
    }
});

// 404 Route Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        const details = Object.values(err.errors).map((fieldError) => ({
            field: fieldError.path,
            message: fieldError.message
        }));

        return res.status(400).json({
            error: 'Validation failed',
            details
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            error: 'Invalid task ID'
        });
    }

    res.status(500).json({
        error: 'Something went wrong'
    });
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});
