const express = require('express');

const app = express();

app.use(express.json());
const validateTaskId = (req, res, next) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            error: 'Task ID must be a number'
        });
    }

    next();
};
let tasks = [
    {
        id: 1,
        title: 'Learn REST API',
        completed: false
    },
    {
        id: 2,
        title: 'Practice Express.js',
        completed: true
    }
];

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
app.get('/tasks', (req, res) => {
    res.status(200).json(tasks);
});

app.post('/tasks', (req, res) => {
    const newTask = {
        id: tasks.length + 1,
        title: req.body.title,
        completed: req.body.completed || false
    };

    tasks.push(newTask);

    res.status(201).json(newTask);
});
app.put('/tasks/:id', validateTaskId, (req, res) => {
    const id = parseInt(req.params.id);

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            error: 'Task not found'
        });
    }

    task.title = req.body.title;
    task.completed = req.body.completed;

    res.status(200).json(task);
});
app.delete('/tasks/:id', validateTaskId, (req, res) => {
    const id = parseInt(req.params.id);

    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({
            error: 'Task not found'
        });
    }

    const deletedTask = tasks.splice(taskIndex, 1);

    res.status(200).json({
        message: 'Task deleted successfully',
        task: deletedTask[0]
    });
});
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        error: 'Something went wrong'
    });
});
app.listen(5000, () => {
    console.log('Server running on port 5000');
});