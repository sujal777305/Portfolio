# Student Portfolio — Advanced Web Development Frameworks (ITUE301)

React + Vite multi-page student portfolio for CHARUSAT practicals.

## Features

- **Practical 1:** Multi-section portfolio (Home, About, Skills, Education, Projects, Contact)
- **Practical 2:** React Router routes, theme toggle, contact form state
- **Practical 3:** GitHub REST API integration on the Projects page with loading & error states

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
