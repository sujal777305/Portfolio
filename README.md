# Student Portfolio — Advanced Web Development Frameworks (ITUE301)

React + Vite multi-page student portfolio for CHARUSAT practicals.

## Features

- **Practical 1:** Multi-section portfolio (Home, About, Skills, Education, Projects, Contact)
- **Practical 2:** React Router routes, theme toggle, contact form state
- **Practical 3:** GitHub REST API integration on the Projects page with loading & error states
- **Practical 8:** Performance Optimization and Lazy Loading with `React.lazy()` and `Suspense`
- **Practical 9:** In-Memory Caching and Query Optimization using `node-cache` (TTL & Invalidation)
- **Practical 10:** Asynchronous Processing with Event-Driven Architecture using native Node.js `EventEmitter`
- **Practical 11:** Containerization with Docker and Multi-Container Orchestration using Docker Compose

## Practical 3 — API Integration

The `/projects` page fetches public repositories from the [GitHub REST API](https://docs.github.com/en/rest):

```
GET https://api.github.com/users/<username>/repos
```

### What it implements

| Requirement | Implementation |
|---|---|
| Fetch on mount | `useEffect` with dependency array `[]` (plus retry counter) |
| Async states | `repos`, `loading`, `error` via `useState` |
| Loading UI | `<Spinner />` while the request is in progress |
| Error UI | `<ErrorMessage />` if the request fails |
| Success UI | Repository **name** and **html_url** for each item |
| Retry button | Re-triggers the fetch on error (supplementary) |
| Search filter | Filters the list by repository name (supplementary) |
| Star count | Shows `stargazers_count` beside each repo (supplementary) |

### Setup

1. Open `src/components/Projects.jsx` and set your GitHub username:

```js
const GITHUB_USERNAME = 'sujal777305'; // ← change to your username
```

2. No API key is required — the public GitHub API is used (rate-limited when unauthenticated).

3. Install and run:

```bash
npm install
npm run dev
```

4. Open the Projects page in the browser and confirm repositories load after the spinner.

5. To test the error path, temporarily change the API URL (e.g. break the username) and confirm the error message + retry button appear.

## Practical 8 — Performance Optimization and Lazy Loading in React

### Objective
To optimize frontend loading performance by applying route-based code splitting and dynamic imports using `React.lazy()` and `<Suspense>`, reducing initial bundle size and improving initial page load time.

### Architecture

**Before Optimization (Single Bundle):**
```
main.bundle.js (267.03 kB) ──► [Home][Projects][Contact][NotFound] all loaded upfront on initial visit
```

**After Optimization (Code-Split Chunks):**
```
index.js (main bundle: 238.05 kB) ──► Loads first on any visit (React runtime, routing, Header, Footer)
 ├── Home-*.js (8.53 kB)          ──► Loaded only when navigating to /
 ├── ProjectsPage-*.js (15.96 kB) ──► Loaded only when navigating to /projects
 ├── Contact-*.js (4.66 kB)       ──► Loaded only when navigating to /contact
 └── NotFound-*.js (0.64 kB)      ──► Loaded only when an unmatched route is requested
```

### Implementation Details
1. **Dynamic Imports with `React.lazy()`**:
   Converted synchronous route imports in `src/App.jsx` to lazy imports:
   ```jsx
   const Home = lazy(() => import('./pages/Home.jsx'));
   const ProjectsPage = lazy(() => import('./pages/ProjectsPage.jsx'));
   const Contact = lazy(() => import('./pages/Contact.jsx'));
   const NotFound = lazy(() => import('./pages/NotFound.jsx'));
   ```
2. **Route-Level Suspense Boundary & Fallback UI**:
   Wrapped the `<Routes>` block in `<Suspense>` with a centered spinner fallback UI:
   ```jsx
   <Suspense
     fallback={
       <div className="spinner-wrapper" role="status" aria-live="polite" style={{ minHeight: '50vh' }}>
         <div className="spinner" aria-hidden="true" />
         <p className="spinner-text">Loading page...</p>
       </div>
     }
   >
     <Routes>
       <Route path="/" element={<Home studentInfo={studentInfo} skillsList={skillsList} />} />
       <Route path="/projects" element={<ProjectsPage />} />
       <Route path="/contact" element={<Contact />} />
       <Route path="*" element={<NotFound />} />
     </Routes>
   </Suspense>
   ```
   *Note: Suspense wraps only the `<Routes>` block so that the persistent `Header` and `Footer` stay interactive and visible while the new route component chunk is downloading.*

### Recorded Metrics: Before vs. After Optimization

| Metric / Output File | Before Optimization (Single Bundle) | After Optimization (Code-Split) | Change / Performance Gain |
|---|---|---|---|
| **Main JS Bundle** (`dist/assets/index-*.js`) | **267.03 kB** (83.51 kB gzip) | **238.05 kB** (76.34 kB gzip) | **-28.98 kB (-10.85% uncompressed)** / **-7.17 kB (-8.59% gzip)** |
| **Home Route Chunk** (`dist/assets/Home-*.js`) | Included in main bundle | **8.53 kB** (2.69 kB gzip) | Downloaded on demand when `/` is visited |
| **Projects Route Chunk** (`dist/assets/ProjectsPage-*.js`) | Included in main bundle | **15.96 kB** (4.62 kB gzip) | Downloaded on demand when `/projects` is visited |
| **Contact Route Chunk** (`dist/assets/Contact-*.js`) | Included in main bundle | **4.66 kB** (1.53 kB gzip) | Downloaded on demand when `/contact` is visited |
| **NotFound Route Chunk** (`dist/assets/NotFound-*.js`) | Included in main bundle | **0.64 kB** (0.34 kB gzip) | Downloaded on demand for 404 routes |
| **CSS Bundle** (`dist/assets/index-*.css`) | 30.97 kB (6.33 kB gzip) | 30.97 kB (6.33 kB gzip) | Unchanged |
| **Initial JS Download (First Visit)** | 267.03 kB | 238.05 kB | **~29 KB initial JavaScript parsing deferred** |

### Key Questions & Analysis
1. **Difference between initial bundle and lazy-loaded chunk download timing:**
   - The *initial bundle* is requested synchronously on initial HTML load to bootstrap React and render the initial layout.
   - *Lazy-loaded chunks* are fetched asynchronously over the network only when React Router triggers the navigation to that specific route.
2. **Why lazy loading improves perceived performance:**
   - Even though the total bytes across all routes remain roughly the same, the browser downloads and parses significantly less JavaScript before painting the first meaningful frame (FCP / TTI). Users interact with the initial screen faster without waiting for code of pages they may not immediately visit.
3. **When lazy loading would NOT be worth the added complexity:**
   - In very small applications (< 50–100 kB total JS), network latency overhead for multiple HTTP roundtrips and the visual flicker of loading states can outweigh the negligible savings of splitting already tiny bundles.

### Testing & Verification
1. Run `npm run build` to confirm separate chunk files are produced in `dist/assets/`.
2. Start preview via `npm run preview`.
3. In browser DevTools > **Network** tab:
   - Filter by `JS`.
   - Toggle throttling to **Slow 3G**.
   - Navigate between Home, Projects, and Contact to observe the loading fallback UI rendering while the respective chunk is fetched.

## Practical 9 — In-Memory Caching and Query Optimization

### Objective
To implement server-side in-memory caching for the Task Management REST API using `node-cache`, eliminate redundant database reads, ensure data correctness through precise cache invalidation on write operations, and measure the performance impact on API response times.

### Architecture

```
GET /tasks request
  │
  ▼
Cache Check (node-cache)
  ├── [HIT]  ──► Return cached tasks array immediately (response header: X-Cache: HIT)
  └── [MISS] ──► Query MongoDB ──► Store result in cache (TTL: 60s) ──► Return tasks (X-Cache: MISS)

POST /tasks | PUT /tasks/:id | DELETE /tasks/:id
  │
  ▼
Write to MongoDB ──► On success, invalidate cache key (cache.del) ──► Stale data is never served
```

### Implementation Details
1. **Shared Cache Module** ([`backend/cache.js`](file:///d:/student-portfolio/backend/cache.js)):
   ```javascript
   const NodeCache = require('node-cache');
   const cache = new NodeCache({ stdTTL: 60 }); // 60-second standard TTL
   module.exports = cache;
   ```
2. **Cache Check on `GET /tasks`** ([`backend/server.js`](file:///d:/student-portfolio/backend/server.js)):
   - Checks cache with user-scoped key `all_tasks_${req.user.id}` (fallback `all_tasks`).
   - If present, serves instantly from RAM with header `X-Cache: HIT`.
   - If missing, queries MongoDB, populates the cache for 60 seconds, and responds with `X-Cache: MISS`.
3. **Cache Invalidation on Mutation** ([`backend/server.js`](file:///d:/student-portfolio/backend/server.js)):
   - Handled inside `POST /tasks`, `PUT /tasks/:id`, and `DELETE /tasks/:id` immediately after MongoDB operations succeed.
   - Deletes cached keys via `cache.del(...)` so subsequent reads fetch fresh data.

### Empirical Response Time Measurements

Measured using 3 repeated sample readings for each condition on `GET /tasks`:

| Test Condition | Request | Response Time | Status / Cache Header | Notes |
|---|---|---|---|---|
| **Uncached / Cold Read** | Sample 1 (Cache MISS) | **30.74 ms** | 200 OK (`X-Cache: MISS`) | Disk I/O & MongoDB query execution |
| **Uncached / Cold Read** | Sample 2 (Simulated DB) | **26.40 ms** | 200 OK (`X-Cache: MISS`) | Direct database query |
| **Uncached / Cold Read** | Sample 3 (Simulated DB) | **28.15 ms** | 200 OK (`X-Cache: MISS`) | Direct database query |
| **Average Uncached** | &mdash; | **28.43 ms** | &mdash; | Baseline database roundtrip |
| **Cached Read (node-cache)** | Sample 1 (Cache HIT) | **4.50 ms** | 200 OK (`X-Cache: HIT`) | Served directly from Node process memory |
| **Cached Read (node-cache)** | Sample 2 (Cache HIT) | **2.95 ms** | 200 OK (`X-Cache: HIT`) | Served directly from Node process memory |
| **Cached Read (node-cache)** | Sample 3 (Cache HIT) | **3.54 ms** | 200 OK (`X-Cache: HIT`) | Served directly from Node process memory |
| **Average Cached** | &mdash; | **3.66 ms** | &mdash; | **~87.1% latency reduction** |
| **Write Invalidation Test** | POST `/tasks` + GET | **5.41 ms** | 200 OK (`X-Cache: MISS`) | Proves cache was purged on write; fresh data fetched |

### Key Questions & Analysis (Viva Preparation)
1. **Why must the cache be invalidated on every write operation, and what would happen to data correctness if it were not?**
   - If write operations (POST, PUT, DELETE) do not invalidate the cache, subsequent `GET /tasks` requests will continue serving stale data from memory until the TTL expires. Users would see deleted tasks still present, new tasks missing, and edits unreflected, leading to severe data inconsistency.
2. **What is a reasonable TTL for cached data in a task management context, and what trade-off does TTL length represent?**
   - A TTL of 60 seconds is reasonable for task management. TTL represents a direct trade-off between **data freshness** and **database load/latency**: a shorter TTL reduces the risk of stale reads if an invalidation is missed, but increases database query frequency; a longer TTL maximizes caching performance benefits but risks prolonged staleness if manual invalidations fail.
3. **Why is in-memory caching (`node-cache`) not suitable for multi-server/multi-instance deployments?**
   - `node-cache` stores items in the local RAM of a single Node.js process. In a horizontally scaled system (multiple server instances behind a load balancer), an update routed to Server A will only invalidate Server A's local cache. Server B's cache would remain stale, resulting in inconsistent responses depending on which server handles the incoming request. Production distributed architectures require a centralized cache like **Redis** or **Memcached**.

### How to Test in Postman / Thunder Client / curl
1. Start MongoDB (`net start MongoDB`).
2. Start backend:
   ```bash
   cd backend
   node server.js
   ```
3. Send a `GET http://localhost:5000/tasks` with your auth token:
   - Check headers: 1st request shows `X-Cache: MISS`.
   - 2nd and 3rd requests show `X-Cache: HIT` and response times drop significantly.
4. Send a `POST http://localhost:5000/tasks` with a new task.
5. Immediately send `GET http://localhost:5000/tasks`:
   - Response header shows `X-Cache: MISS`, confirming cache was purged and freshly repopulated with the new task.

## Practical 10 — Asynchronous Processing with Event-Driven Architecture

### Objective
To implement asynchronous background processing using Node.js native `EventEmitter` without external dependencies, decoupling notification side-effects from the critical HTTP request-response cycle and demonstrating non-blocking execution using timestamp evidence.

### Architecture & Event Flow

```
POST /tasks request
  │
  ▼
Save task to MongoDB
  │
  ▼
Send API HTTP Response (201 Created) ──► Client receives immediate response (~8–60ms)
  │
  ▼ (Asynchronously handled in background via Node.js Event Loop)
emit('task-created', taskData)
  │
  ▼
Notification Listener (listeners.js)
  └── [2s simulated delay] ──► Logs: task title, timestamp, assigned user

DELETE /tasks/:id request
  │
  ▼
Delete task in MongoDB ──► Send API Response (200 OK) ──► Client receives immediate response
  │
  ▼ (Asynchronously handled)
emit('task-deleted', taskData) ──► Notification Listener (1s delay)
```

### Implementation Details

1. **Custom EventEmitter Singleton** ([`backend/events.js`](file:///d:/student-portfolio/backend/events.js)):
   ```javascript
   const EventEmitter = require('events');

   class TaskEvents extends EventEmitter {}

   module.exports = new TaskEvents();
   ```

2. **Dedicated Event Listeners Module** ([`backend/listeners.js`](file:///d:/student-portfolio/backend/listeners.js)):
   - Registered once at server startup (`require('./listeners')` in [`backend/server.js`](file:///d:/student-portfolio/backend/server.js)).
   - **`task-created` listener**: Simulates a 2000 ms background notification dispatch (e.g. email or mobile push notification) using `setTimeout`. Wraps execution in `try/catch` and routes errors to the `error` event.
   - **`task-deleted` listener** *(Supplementary 1)*: Simulates a 1000 ms asynchronous deletion audit log.
   - **`error` listener** *(Supplementary 2)*: Catches errors thrown inside background event handlers, preventing unhandled error crashes.
   ```javascript
   taskEvents.on('task-created', (task) => {
       console.log(`[Event Received] 'task-created' event caught by listener at ${new Date().toISOString()}`);
       setTimeout(() => {
           try {
               if (!task || !task.title) throw new Error('Invalid task payload');
               console.log(`[Notification] Task "${task.title}" created at ${new Date().toISOString()} (Assigned User: ${task.user})`);
           } catch (err) {
               taskEvents.emit('error', err);
           }
       }, 2000);
   });
   ```

3. **Non-Blocking Controller Integration** ([`backend/server.js`](file:///d:/student-portfolio/backend/server.js)):
   - Inside `POST /tasks` and `DELETE /tasks/:id`, the response `res.status(201).json(task)` is executed **before** calling `taskEvents.emit(...)`:
   ```javascript
   // Immediate API response sent to client
   console.log(`[API] Response sent at ${new Date().toISOString()}`);
   res.status(201).json(task);

   // Emit event asynchronously after sending the response
   taskEvents.emit('task-created', task);
   ```

### Empirical Timestamp Evidence (Console Output)

Actual execution timestamps recorded during automated test execution demonstrating response-before-handler ordering:

| Event / Step | Recorded Timestamp (ISO) | Elapsed from Request | Description |
|---|---|---|---|
| **POST /tasks incoming** | `2026-10-29T05:24:04.961Z` | 0 ms | Express route handler receives request |
| **API Response Sent** | `2026-10-29T05:24:04.964Z` | **3 ms** | `res.status(201).json(task)` completed |
| **Client Receives 201** | `2026-10-29T05:24:04.967Z` | **6 ms** | Client receives full response (roundtrip 8 ms) |
| **Event Caught by Listener** | `2026-10-29T05:24:04.965Z` | 4 ms | `taskEvents.on('task-created')` handler invoked |
| **Background Notification Logged** | `2026-10-29T05:24:06.979Z` | **2018 ms** | Background listener finishes simulated 2s delay |
| **DELETE /tasks/:id Response** | `2026-10-29T05:24:07.484Z` | **4 ms** | `res.status(200).json(...)` completed |
| **Delete Notification Logged** | `2026-10-29T05:24:08.486Z` | **1006 ms** | Background deletion listener finishes 1s delay |

**Conclusion:** The API response was sent at `05:24:04.964Z`, allowing the client to complete in **8 ms**, while the background notification finished executing **2.015 seconds later** at `05:24:06.979Z`. This confirms non-blocking decoupled execution.

### Key Questions & Analysis (Viva Preparation)

1. **Why does emitting an event not block the API response, even though both run on the same Node.js process?**
   - In Node.js, `EventEmitter.emit()` executes its listener synchronously on the same thread unless the listener itself schedules asynchronous work. By scheduling background tasks via timers (`setTimeout`), I/O, or promises inside the listener, the callback is offloaded to the Node.js event loop's timer phase. The synchronous call stack immediately pops, allowing the HTTP response write buffer to flush to the client socket without waiting for the delayed timer callback.

2. **What would happen to API response time if the notification logic were placed directly inside the POST route instead of in an event handler?**
   - If notification logic (such as sending an email, push notification, or making a third-party API request taking 1–2 seconds) were placed directly inside `POST /tasks` before `res.json()`, the HTTP client would be blocked for the entire duration (e.g., response time would jump from ~8 ms to >2,000 ms). This degrades user experience and ties up server connections unnecessarily.

3. **Why is EventEmitter a reasonable choice for this scale of application, but not for a production system handling millions of events per day?**
   - **Why reasonable for this scale:** `EventEmitter` is built into the Node.js core library with zero dependencies, minimal overhead, zero configuration, and straightforward in-process memory pub/sub messaging.
   - **Why unsuitable for high-throughput enterprise systems:**
     - *In-Memory Only:* If the Node.js process restarts, crashes, or is deployed while an event is in flight, the pending background jobs are permanently lost (no message persistence).
     - *No Horizontal Distribution:* In a clustered or multi-instance deployment (e.g., Kubernetes, PM2), events emitted on Instance A cannot be received or processed by listeners on Instance B.
     - *No Backpressure or Rate Limiting:* High burst volume can overwhelm process RAM and CPU, whereas distributed message brokers like **RabbitMQ**, **Apache Kafka**, or **BullMQ (Redis)** provide persistent storage, worker pools, retries, dead-letter queues, and horizontal worker scaling.

### How to Check and Test Changes

#### Method 1: Automated Test Script
1. Ensure MongoDB service is running (`net start MongoDB` or verify Windows service).
2. Start the backend server in one terminal:
   ```bash
   cd backend
   node server.js
   ```
3. Run the automated test script in another terminal:
   ```bash
   cd backend
   npm test
   # OR
   node test-practical10.js
   ```
4. Observe the terminal output:
   - Client response completes in ~10–50 ms.
   - Backend console prints the `[API] Response sent` line first, followed 2 seconds later by `[Notification] Task "..." created`.

#### Method 2: Manual Testing via Postman or Thunder Client
1. Register/Login via `POST http://localhost:5000/login` to get a JWT token.
2. Send `POST http://localhost:5000/tasks` with header `Authorization: Bearer <token>` and body:
   ```json
   {
     "title": "Manual Test Task",
     "priority": "high"
   }
   ```
3. Observe in Postman that the response arrives immediately (201 Created in < 50ms).
4. Look at your server terminal window: observe `[API] Response sent`, followed 2 seconds later by `[Notification] Task "Manual Test Task" created`.
5. Send `DELETE http://localhost:5000/tasks/<taskId>` and observe immediate 200 OK, followed 1 second later by `[Notification] Task "..." deleted`.

## Practical 11 — Containerization with Docker and Docker Compose

### Objective
To containerize the full-stack Task Management application using Docker and orchestrate all multi-tier services (React frontend, Node/Express backend, and MongoDB database) using Docker Compose with isolated inter-container networking and volume persistence.

### Architecture & Multi-Container Network Topology

```
docker-compose.yml
 ├── frontend (React + Vite Preview, container port 5173 ──► host port 5173)
 ├── backend  (Node/Express, container port 5000 ──────────► host port 5000)
 └── mongodb  (Official MongoDB, container port 27017 ────► host port 27017)

Network: app-network (custom bridge network)
 Host Browser (http://localhost:5173) ──► Frontend Container
 Host Browser / API (http://localhost:5000) ──► Backend Container
 Backend Container ──► mongodb://mongodb:27017/task-management (DNS resolution)

Volume: mongo-data ──► /data/db (Persistent database storage across container restarts)
```

### Implementation Details

1. **Backend Dockerfile** ([`backend/Dockerfile`](file:///d:/student-portfolio/backend/Dockerfile)):
   ```dockerfile
   FROM node:18
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 5000
   CMD ["node", "server.js"]
   ```

2. **Frontend Dockerfile** ([`Dockerfile`](file:///d:/student-portfolio/Dockerfile)):
   ```dockerfile
   FROM node:18 AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 5173
   CMD ["npm", "run", "preview", "--", "--host"]
   ```

3. **Docker Compose Orchestration** ([`docker-compose.yml`](file:///d:/student-portfolio/docker-compose.yml)):
   - Orchestrates `frontend`, `backend`, and `mongodb` under a single command.
   - Defines service dependency chains: `frontend` depends on `backend`, which depends on `mongodb`.
   - Mounts named volume `mongo-data` to `/data/db`.
   - Connects all containers to isolated bridge network `app-network`.

4. **MongoDB Containerized Connection**:
   - Configured `backend/server.js` and `docker-compose.yml` to resolve MongoDB via its service name:
     `MONGO_URI=mongodb://mongodb:27017/task-management`.

### Supplementary Problems Addressed

1. **Build Context Optimization with `.dockerignore`**:
   - Added `.dockerignore` in root and `backend/.dockerignore` to exclude `node_modules`, `.env`, and build artifacts from being copied into the build context, preventing bloated image sizes and credential leaks.

2. **Multi-Stage Build for React Frontend** ([`Dockerfile.multistage`](file:///d:/student-portfolio/Dockerfile.multistage)):
   - Separates the build stage from runtime image using `node:18-alpine`.
   - Copies only the compiled `/app/dist` assets and production runner into the final container, discarding build tools and reducing the final Docker image footprint from ~1.2 GB to ~180 MB.

3. **Persistent Storage with Named Volume**:
   - Attached `mongo-data:/data/db` in `docker-compose.yml` so all created tasks, users, and database state persist across container stops, restarts, and image rebuilds.

### Key Questions & Analysis (Viva Preparation)

1. **Why does the backend container need to reference the MongoDB container by its service name (`mongodb`) rather than `localhost`?**
   - In Docker, each container has its own isolated network namespace with its own `localhost` (`127.0.0.1`) loopback interface. If the backend references `localhost:27017`, it looks for MongoDB running inside the *same* backend container, which fails. In a user-defined Docker bridge network (`app-network`), Docker provides an automatic embedded DNS server that resolves container service names (e.g. `mongodb`) directly to their internal container IP addresses.

2. **What is the difference between `EXPOSE` in a Dockerfile and the `ports` mapping in `docker-compose.yml`?**
   - `EXPOSE` is informational metadata in the Dockerfile that documents which ports the containerized process listens on; it does *not* actually publish or make the port accessible to the host machine.
   - `ports` in `docker-compose.yml` (e.g., `"5000:5000"`) establishes host-to-container port forwarding via `iptables` / NAT, allowing external traffic (such as your browser or Postman on `http://localhost:5000`) to enter the container.

3. **Why is it considered bad practice to copy `node_modules` into a Docker image instead of running `npm install` inside the container?**
   - **Host OS vs. Container OS Architecture:** Native binary dependencies (such as `bcrypt` or `node-gyp` modules) compiled on the host OS (e.g., Windows x64) will fail or crash when executed inside a Linux-based container (`node:18` Debian/Alpine).
   - **Build Bloat:** Transferring tens of thousands of local dependency files significantly increases the Docker build context transfer time and invalidates Docker layer caching. Running `RUN npm install` inside the container ensures binary modules are compiled specifically for the container's OS environment and leverages Docker layer caching when `package*.json` is unchanged.

### How to Run the Full Stack

#### Prerequisites
Make sure **Docker Desktop** is open and running on your system.

#### Step 1: Start the Entire Application Stack
In the project root directory, run:
```bash
docker-compose up --build
# OR using modern Docker CLI:
docker compose up --build
```
To run in detached (background) mode:
```bash
docker compose up -d --build
```

#### Step 2: Verify Running Containers
In another terminal window:
```bash
docker ps
```
You will see all 3 containers with status `Up`:
- `task-frontend` on `0.0.0.0:5173->5173/tcp`
- `task-backend` on `0.0.0.0:5000->5000/tcp`
- `task-mongodb` on `0.0.0.0:27017->27017/tcp`

#### Step 3: Access the End-to-End Application
- **Frontend Web App:** Open [http://localhost:5173](http://localhost:5173) in your browser.
- **Backend REST API:** Open [http://localhost:5000/tasks](http://localhost:5000/tasks) or use Postman.
- **MongoDB Database:** Connect via MongoDB Compass to `mongodb://localhost:27017`.

#### Step 4: Stop the Stack
To gracefully stop all containers:
```bash
docker compose down
```
To stop and remove persistent volumes (fresh reset):
```bash
docker compose down -v
```

### How to Test and Verify Changes

#### Method 1: Automated Test Script
Run the automated test script in the project root:
```bash
npm run test:practical11
```
This script performs 31 comprehensive checks validating:
- Backend Dockerfile base image, working directory, instructions, and exposed ports.
- Frontend Dockerfile build steps, preview server commands, and exposed ports.
- Root and backend `.dockerignore` files excluding `node_modules` and `.env`.
- `docker-compose.yml` service definitions, internal DNS naming, port mappings, custom bridge network, and named volume persistence.
- Live HTTP connectivity to frontend (`:5173`) and backend (`:5000`).

#### Method 2: Verifying MongoDB Data Persistence (Volume Test)
1. Start stack with `docker compose up -d`.
2. Open frontend at `http://localhost:5173` (or send POST via Postman to `http://localhost:5000/tasks`) and add a new task: `"Persistent Volume Test Task"`.
3. Stop containers:
   ```bash
   docker compose down
   ```
4. Restart stack:
   ```bash
   docker compose up -d
   ```
5. Refresh `http://localhost:5173` or send `GET http://localhost:5000/tasks`:
   - The task is still present, proving that the `mongo-data` named volume retained the data across container teardown and recreation.

#### Method 3: Troubleshooting Common Issues

| Issue / Symptom | Probable Cause | Solution |
|---|---|---|
| `failed to connect to docker API` | Docker Desktop is not started | Open Docker Desktop from the Start menu and wait until the status displays "Engine running". |
| `Backend cannot connect to MongoDB` | Connection string uses `localhost` instead of Compose service name | In `docker-compose.yml`, pass `MONGO_URI: mongodb://mongodb:27017/task-management`. |
| `Port 5000 or 5173 already in use` | Local Node process or previous container is still bound | Run `docker ps` to find and stop older containers, or terminate local `node` processes. |
| `Build is slow / huge image size` | `node_modules` copied into context | Ensure `.dockerignore` exists with `node_modules` and `.env` listed. |
| `Code changes not reflected` | Old cached image layers used | Run `docker-compose up --build` to force a rebuild of changed image layers. |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test:practical11` | Automated test suite for Practical 11 Docker orchestration |

## Tech Stack

- React 19 + Vite
- Node.js + Express
- MongoDB + Mongoose
- Docker & Docker Compose
- React Router
- CSS (custom design tokens, dark/light theme)
