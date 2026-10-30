/**
 * test-practical11.js
 * Automated Verification Script for Practical 11:
 * Containerization with Docker and Docker Compose
 * 
 * Verifies:
 * 1. Dockerfile configurations for frontend and backend.
 * 2. .dockerignore configuration excluding node_modules and .env.
 * 3. docker-compose.yml orchestration structure, services, networks, volumes, ports.
 * 4. Active container status and HTTP reachability (if containers are currently running).
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('   PRACTICAL 11: DOCKER & DOCKER COMPOSE VERIFICATION TEST      ');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        console.log(`  [PASS] ${message}`);
        passedTests++;
    } else {
        console.error(`  [FAIL] ${message}`);
    }
}

// -------------------------------------------------------------
// Test 1: Backend Dockerfile
// -------------------------------------------------------------
console.log('1. Verifying Backend Dockerfile...');
const backendDockerfilePath = path.join(__dirname, 'backend', 'Dockerfile');
assert(fs.existsSync(backendDockerfilePath), 'backend/Dockerfile exists');

if (fs.existsSync(backendDockerfilePath)) {
    const content = fs.readFileSync(backendDockerfilePath, 'utf-8');
    assert(/FROM\s+node:18/i.test(content), 'Backend Dockerfile uses node:18 base image');
    assert(/WORKDIR\s+\/app/i.test(content), 'Backend Dockerfile sets WORKDIR to /app');
    assert(/COPY\s+package\*\.json/i.test(content), 'Backend Dockerfile copies package*.json first');
    assert(/RUN\s+npm\s+install/i.test(content), 'Backend Dockerfile runs npm install');
    assert(/EXPOSE\s+5000/i.test(content), 'Backend Dockerfile exposes port 5000');
    assert(/CMD\s+\[.*node.*server\.js.*\]/i.test(content), 'Backend Dockerfile executes node server.js');
}

// -------------------------------------------------------------
// Test 2: Frontend Dockerfile
// -------------------------------------------------------------
console.log('\n2. Verifying Frontend Dockerfile...');
const frontendDockerfilePath = path.join(__dirname, 'Dockerfile');
assert(fs.existsSync(frontendDockerfilePath), 'Frontend Dockerfile exists at root');

if (fs.existsSync(frontendDockerfilePath)) {
    const content = fs.readFileSync(frontendDockerfilePath, 'utf-8');
    assert(/FROM\s+node:(18|20)/i.test(content), 'Frontend Dockerfile uses compatible node base image');
    assert(/WORKDIR\s+\/app/i.test(content), 'Frontend Dockerfile sets WORKDIR to /app');
    assert(/RUN\s+npm\s+run\s+build/i.test(content), 'Frontend Dockerfile runs npm run build');
    assert(/EXPOSE\s+5173/i.test(content), 'Frontend Dockerfile exposes port 5173');
    assert(/CMD\s+\[.*preview.*\]/i.test(content), 'Frontend Dockerfile serves via Vite preview');
}

// -------------------------------------------------------------
// Test 3: .dockerignore Files
// -------------------------------------------------------------
console.log('\n3. Verifying .dockerignore Configuration (Supplementary Problem)...');
const rootDockerignore = path.join(__dirname, '.dockerignore');
const backendDockerignore = path.join(__dirname, 'backend', '.dockerignore');

assert(fs.existsSync(rootDockerignore), 'Root .dockerignore exists');
if (fs.existsSync(rootDockerignore)) {
    const rootContent = fs.readFileSync(rootDockerignore, 'utf-8');
    assert(rootContent.includes('node_modules'), 'Root .dockerignore excludes node_modules');
    assert(rootContent.includes('.env'), 'Root .dockerignore excludes .env');
}

assert(fs.existsSync(backendDockerignore), 'Backend .dockerignore exists');
if (fs.existsSync(backendDockerignore)) {
    const backendContent = fs.readFileSync(backendDockerignore, 'utf-8');
    assert(backendContent.includes('node_modules'), 'Backend .dockerignore excludes node_modules');
    assert(backendContent.includes('.env'), 'Backend .dockerignore excludes .env');
}

// -------------------------------------------------------------
// Test 4: docker-compose.yml Architecture
// -------------------------------------------------------------
console.log('\n4. Verifying docker-compose.yml Structure & Service Orchestration...');
const composePath = path.join(__dirname, 'docker-compose.yml');
assert(fs.existsSync(composePath), 'docker-compose.yml exists at project root');

if (fs.existsSync(composePath)) {
    const composeContent = fs.readFileSync(composePath, 'utf-8');
    assert(/services:\s*[\s\S]*mongodb:/i.test(composeContent), 'Defines "mongodb" service');
    assert(/services:\s*[\s\S]*backend:/i.test(composeContent), 'Defines "backend" service');
    assert(/services:\s*[\s\S]*frontend:/i.test(composeContent), 'Defines "frontend" service');
    assert(/mongo-data:/i.test(composeContent), 'Defines "mongo-data" named volume (Supplementary Problem)');
    assert(/app-network:/i.test(composeContent), 'Defines "app-network" bridge network');
    assert(/27017:27017/.test(composeContent), 'Maps MongoDB port 27017');
    assert(/5000:5000/.test(composeContent), 'Maps Backend port 5000');
    assert(/5173:5173/.test(composeContent), 'Maps Frontend port 5173');
    assert(/mongodb:\/\/mongodb:27017/i.test(composeContent), 'Backend connects to mongodb service name instead of localhost');
    assert(/depends_on:\s*[\s\S]*- mongodb/i.test(composeContent), 'Backend depends_on mongodb');
    assert(/depends_on:\s*[\s\S]*- backend/i.test(composeContent), 'Frontend depends_on backend');
}

// -------------------------------------------------------------
// Test 5: Live Container Connectivity Probe (Optional check)
// -------------------------------------------------------------
console.log('\n5. Probing Live Endpoints (if containers are currently running)...');

function checkHttpEndpoint(url, label) {
    return new Promise((resolve) => {
        const req = http.get(url, (res) => {
            console.log(`  [INFO] ${label} (${url}) is active: HTTP ${res.statusCode}`);
            resolve(true);
        });
        req.on('error', () => {
            console.log(`  [NOTE] ${label} (${url}) is not reachable currently (containers stopped or Docker Desktop not running).`);
            resolve(false);
        });
        req.setTimeout(1500, () => {
            req.destroy();
            resolve(false);
        });
    });
}

await checkHttpEndpoint('http://localhost:5173', 'Frontend Service');
await checkHttpEndpoint('http://localhost:5000', 'Backend Service');

console.log('\n================================================================');
console.log(`  RESULT: ${passedTests} / ${totalTests} Static Configuration Checks Passed!`);
console.log('================================================================\n');

if (passedTests === totalTests) {
    console.log('>> Configuration is 100% complete and compliant with Practical 11 requirements.');
    console.log('>> To run the full stack: docker-compose up --build');
    console.log('>> To verify containers: docker ps\n');
}
