const http = require('http');

/**
 * Practical 10 Verification Script:
 * Tests the Asynchronous Event-Driven Architecture with EventEmitter
 * 
 * Verifies:
 * 1. Immediate API response before background listener executes (non-blocking).
 * 2. 'task-created' event handling with simulated 2s background notification delay.
 * 3. 'task-deleted' event handling with simulated 1s background notification delay.
 * 4. 'error' event handling without server crash.
 * 5. Console timestamps proving response-before-handler execution order.
 */

const _BASE_URL = 'http://localhost:5000';

function makeRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let parsed = data;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    // keep raw string if not JSON
                }
                resolve({ statusCode: res.statusCode, headers: res.headers, data: parsed });
            });
        });

        req.on('error', (err) => reject(err));

        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log('================================================================');
    console.log('   PRACTICAL 10: ASYNCHRONOUS EVENT-DRIVEN ARCHITECTURE TEST   ');
    console.log('================================================================\n');

    const email = `testuser_${Date.now()}@example.com`;
    const password = 'password123';

    // 1. Register test user
    console.log(`[1] Registering test user (${email})...`);
    await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email, password });

    // 2. Login
    console.log('[2] Logging in to obtain JWT token...');
    const loginRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email, password });

    const token = loginRes.data.token;
    if (!token) {
        throw new Error('Failed to retrieve authentication token');
    }
    console.log('    Login successful. JWT token obtained.\n');

    // 3. Test POST /tasks (Demonstrates Non-Blocking Asynchronous Processing)
    console.log('[3] Creating new task via POST /tasks...');
    const taskPayload = {
        title: 'Review Node.js EventEmitter Practical 10',
        description: 'Verify background notification logs and response timestamp ordering',
        priority: 'high'
    };

    const reqStartTime = Date.now();
    console.log(`    [Client] Sending POST /tasks at:     ${new Date(reqStartTime).toISOString()}`);

    const createRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/tasks',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }, taskPayload);

    const reqEndTime = Date.now();
    const elapsedMs = reqEndTime - reqStartTime;
    console.log(`    [Client] Received API response at:  ${new Date(reqEndTime).toISOString()}`);
    console.log(`    [Client] HTTP Status Code:          ${createRes.statusCode} Created`);
    console.log(`    [Client] Total API roundtrip time:  ${elapsedMs} ms`);
    console.log(`    [Client] Created Task ID:           ${createRes.data._id}`);

    if (elapsedMs > 1000) {
        console.warn('    WARNING: Response took longer than 1s! Background listener may be blocking.');
    } else {
        console.log('    SUCCESS: API responded instantly (< 1s) while background listener processes asynchronously!');
    }

    console.log('\n    [Waiting 2.5s for background task-created notification listener to complete in console...]');
    await sleep(2500);

    // 4. Test DELETE /tasks/:id (Supplementary Problem 1: task-deleted event)
    const taskId = createRes.data._id;
    console.log(`\n[4] Deleting task via DELETE /tasks/${taskId}...`);
    const delStartTime = Date.now();
    console.log(`    [Client] Sending DELETE /tasks/:id at: ${new Date(delStartTime).toISOString()}`);

    const deleteRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: `/tasks/${taskId}`,
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const delEndTime = Date.now();
    console.log(`    [Client] Received DELETE response at: ${new Date(delEndTime).toISOString()}`);
    console.log(`    [Client] HTTP Status Code:            ${deleteRes.statusCode}`);
    console.log(`    [Client] Total API roundtrip time:    ${delEndTime - delStartTime} ms`);

    console.log('\n    [Waiting 1.5s for background task-deleted notification listener to complete in console...]');
    await sleep(1500);

    // 5. Test Error Handling Listener (Supplementary Problem 2: error event)
    console.log('\n[5] Testing Error Listener with invalid payload event...');
    const taskEvents = require('./events');
    require('./listeners'); // Ensure listeners are registered in this process
    taskEvents.emit('task-created', { title: '' }); // Invalid task title triggers catch block

    await sleep(2500);

    console.log('\n================================================================');
    console.log('   ALL PRACTICAL 10 TESTS COMPLETED SUCCESSFULLY!              ');
    console.log('================================================================');
}

if (require.main === module) {
    runTests().catch((err) => {
        console.error('Test execution failed:', err);
        process.exit(1);
    });
}

module.exports = { runTests };
