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
const cache = require('./cache');
const taskEvents = require('./events');
require('./listeners'); // Practical 10: Register event listeners at server startup

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
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/task-management';
if (process.env.NODE_ENV !== 'test' || process.env.MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => console.log(`MongoDB connected: ${MONGO_URI}`))
        .catch((err) => {
            if (process.env.NODE_ENV !== 'test') {
                console.error('MongoDB connection error:', err.message);
            }
        });
}

// Health check endpoint (Practical 12: CI/CD Pipeline Verification)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

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
// AI ASSISTANT ROUTES (Practical 13)
// ==========================================

const OpenAI = require('openai');

// In-memory rate limiting map: identifier -> timestamp of last request
// Supplementary requirement: max 1 AI request per task/client per cooldown window
const aiRateLimitMap = new Map();

function generateFallbackDescription(title) {
    const t = (title || '').toLowerCase();
    if (t.includes('bug') || t.includes('fix') || t.includes('error')) {
        return `Investigate root cause in logs, reproduce locally, implement solution, and write unit tests for: ${title}.`;
    }
    if (t.includes('study') || t.includes('exam') || t.includes('read') || t.includes('learn')) {
        return `Review syllabus topics, prepare summary notes, practice sample questions, and verify comprehension for: ${title}.`;
    }
    if (t.includes('docker') || t.includes('deploy') || t.includes('ci') || t.includes('cd')) {
        return `Configure deployment definitions, verify container build and network orchestration, and execute end-to-end tests for: ${title}.`;
    }
    if (t.includes('meeting') || t.includes('presentation')) {
        return `Prepare presentation slides, compile project metrics, and discuss roadmap deliverables for: ${title}.`;
    }
    return `Plan implementation steps, complete all required deliverables, and verify acceptance criteria for: ${title}.`;
}

async function handleGenerateDescription(req, res) {
    try {
        const { title } = req.body || {};

        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({
                error: 'Task title is required to generate a description'
            });
        }

        // Rate limiting check: 1 request every 15 seconds per client
        const clientId = req.ip || req.headers['x-forwarded-for'] || 'client';
        const now = Date.now();
        const lastRequest = aiRateLimitMap.get(clientId);
        if (lastRequest && (now - lastRequest < 15000) && process.env.NODE_ENV !== 'test') {
            const waitSec = Math.ceil((15000 - (now - lastRequest)) / 1000);
            return res.status(429).json({
                error: `Rate limit exceeded. Please wait ${waitSec}s before generating another suggestion.`,
                rateLimited: true,
                retryAfter: waitSec
            });
        }
        aiRateLimitMap.set(clientId, now);

        // 1. Try OpenAI if API key is provided and valid
        const openaiKey = process.env.OPENAI_API_KEY;
        if (openaiKey && openaiKey !== 'your_key_here' && openaiKey !== 'your_openai_api_key_here' && !openaiKey.includes('placeholder')) {
            try {
                const client = new OpenAI({ apiKey: openaiKey });
                const completion = await client.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an AI task assistant. Output a concise 2-sentence actionable description for the task title. Do not include quotes or intro text.'
                        },
                        {
                            role: 'user',
                            content: `Write a short task description for: ${title.trim()}`
                        }
                    ],
                    max_tokens: 120,
                    temperature: 0.7
                });

                const aiText = completion.choices?.[0]?.message?.content?.trim();
                if (aiText) {
                    return res.status(200).json({
                        description: aiText,
                        fallback: false,
                        provider: 'openai-gpt-4o-mini'
                    });
                }
            } catch (aiErr) {
                console.warn('OpenAI API call failed, falling back gracefully:', aiErr.message);
                // Graceful degradation: fall through to fallback
            }
        }

        // 2. Try Google Gemini if GEMINI_API_KEY is provided
        const geminiKey = process.env.GEMINI_API_KEY;
        if (geminiKey && geminiKey !== 'your_key_here' && geminiKey !== 'your_gemini_api_key_here' && !geminiKey.includes('placeholder')) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
                const geminiRes = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Write a concise 2-sentence actionable task description for: "${title.trim()}". Return only the description text.`
                            }]
                        }]
                    })
                });

                const data = await geminiRes.json();
                const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                if (aiText) {
                    return res.status(200).json({
                        description: aiText,
                        fallback: false,
                        provider: 'gemini-1.5-flash'
                    });
                }
            } catch (geminiErr) {
                console.warn('Gemini API call failed, falling back gracefully:', geminiErr.message);
                // Graceful degradation: fall through to fallback
            }
        }

        // 3. Graceful degradation: Return smart contextual fallback
        const fallbackText = generateFallbackDescription(title);
        return res.status(200).json({
            description: fallbackText,
            fallback: true,
            provider: 'rule-based-fallback',
            message: 'AI API unavailable or unconfigured. Provided contextual template.'
        });

    } catch (err) {
        // Ultimate safety catch: never crash the core app (Graceful degradation)
        console.error('AI route error:', err.message);
        return res.status(200).json({
            description: generateFallbackDescription(req.body?.title),
            fallback: true,
            error: err.message
        });
    }
}

app.post('/api/ai/generate-description', handleGenerateDescription);
app.post('/ai/generate-description', handleGenerateDescription);

// ==========================================
// TASK ROUTES (Protected by Auth & Validation Middleware)
// ==========================================

// Apply authMiddleware to protect all /tasks routes
app.use('/tasks', authMiddleware);

// Cache key and invalidation helpers (Practical 9: In-Memory Caching)
const getTaskCacheKey = (userId) => (userId ? `all_tasks_${userId}` : 'all_tasks');
const invalidateTaskCache = (userId) => {
    if (userId) {
        cache.del(`all_tasks_${userId}`);
    }
    cache.del('all_tasks');
};

app.get('/tasks', async (req, res, next) => {
    try {
        const cacheKey = getTaskCacheKey(req.user?.id);
        const cached = cache.get(cacheKey);

        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.status(200).json(cached);
        }

        // If database is not connected in test environment, return empty list
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json([]);
        }

        const tasks = await Task.find({ user: req.user?.id }).sort({ createdAt: -1 });
        cache.set(cacheKey, tasks);
        res.setHeader('X-Cache', 'MISS');
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

        // Invalidate cache on write operation so stale data is never served
        invalidateTaskCache(req.user?.id);

        // Immediate API response (201 Created)
        console.log(`[API] Response sent at ${new Date().toISOString()}`);
        res.status(201).json(task);

        // Emit task-created event asynchronously after sending the response
        taskEvents.emit('task-created', task);
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

        // Invalidate cache on write operation so stale data is never served
        invalidateTaskCache(req.user?.id);

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

        // Invalidate cache on write operation so stale data is never served
        invalidateTaskCache(req.user?.id);

        // Immediate API response (200 OK)
        console.log(`[API] Delete response sent at ${new Date().toISOString()}`);
        res.status(200).json({
            message: 'Task deleted successfully',
            task
        });

        // Emit task-deleted event asynchronously after sending the response
        taskEvents.emit('task-deleted', task);
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
app.use((err, req, res, _next) => {
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

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
