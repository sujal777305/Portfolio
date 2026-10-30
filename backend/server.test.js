const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./server');

describe('Practical 12: Task Management REST API CI/CD Automated Tests', () => {

    afterAll(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    });

    /**
     * Test 1 (Core Step 2):
     * Tests GET /tasks endpoint returns HTTP status 200.
     * In the CI pipeline demonstration:
     * - To break the pipeline: change 200 to 404 or 500.
     * - To fix the pipeline: revert back to 200.
     */
    test('GET /tasks returns 200', async () => {
        const res = await request(app).get('/tasks');
        expect(res.statusCode).toBe(200);
    });

    /**
     * Test 2 (Supplementary / Post-Lab Work):
     * Verifies GET /health endpoint returns HTTP 200 and status 'OK'.
     */
    test('GET /health returns 200 and status OK', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'OK');
        expect(res.body).toHaveProperty('uptime');
    });

    /**
     * Test 3 (Supplementary / Endpoint Validation):
     * Verifies POST /register validates input and returns HTTP 400 when body is missing required fields.
     */
    test('POST /register returns 400 when email or password is missing', async () => {
        const res = await request(app)
            .post('/register')
            .send({});
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Email and password are required');
    });

    /**
     * Test 4 (Supplementary / Endpoint Validation):
     * Verifies POST /login validates input and returns HTTP 400 when credentials are empty.
     */
    test('POST /login returns 400 when credentials are missing', async () => {
        const res = await request(app)
            .post('/login')
            .send({});
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Email and password are required');
    });

    /**
     * Practical 13 AI Integration Tests:
     */
    describe('Practical 13: AI Service Integration & Graceful Degradation', () => {
        test('POST /api/ai/generate-description returns 200 with generated/fallback description', async () => {
            const res = await request(app)
                .post('/api/ai/generate-description')
                .send({ title: 'Complete Docker setup for project' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('description');
            expect(typeof res.body.description).toBe('string');
            expect(res.body.description.length).toBeGreaterThan(0);
            expect(res.body).toHaveProperty('fallback');
        });

        test('POST /api/ai/generate-description returns 400 when title is missing or empty', async () => {
            const res = await request(app)
                .post('/api/ai/generate-description')
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });
});
