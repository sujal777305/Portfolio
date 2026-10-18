# Student Portfolio — Advanced Web Development Frameworks (ITUE301)

React + Vite multi-page student portfolio for CHARUSAT practicals.

## Features

- **Practical 1:** Multi-section portfolio (Home, About, Skills, Education, Projects, Contact)
- **Practical 2:** React Router routes, theme toggle, contact form state
- **Practical 3:** GitHub REST API integration on the Projects page with loading & error states
- **Practical 8:** Performance Optimization and Lazy Loading with `React.lazy()` and `Suspense`
- **Practical 9:** In-Memory Caching and Query Optimization using `node-cache` (TTL & Invalidation)

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

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Tech Stack

- React 18+
- Vite
- React Router
- Fetch API (GitHub REST)
- CSS (custom design tokens, dark/light theme)
