const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Task = require('./models/Task');

const app = express();

app.use(cors());
app.use(express.json());

const validateTaskId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            error: 'Invalid task ID'
        });
    }

    next();
};

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err.message));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

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

app.get('/tasks', async (req, res, next) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
});

app.get('/tasks/:id', validateTaskId, async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

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

app.post('/tasks', async (req, res, next) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
});

app.put('/tasks/:id', validateTaskId, async (req, res, next) => {
    try {
        const update = { ...req.body };

        if (typeof update.title === 'string') {
            update.title = update.title.trim();
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
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
        const task = await Task.findByIdAndDelete(req.params.id);

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

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

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
