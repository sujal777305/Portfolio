import React, { useState, useEffect } from 'react';
import Spinner from './Spinner.jsx';
import ErrorMessage from './ErrorMessage.jsx';

/** GitHub username used for the public REST API (change if needed). */
const GITHUB_USERNAME = 'sujal777305';

/**
 * Projects Component
 * Fetches public repositories from the GitHub REST API and renders them
 * with loading, error, and success UI states (Practical 3).
 */
function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Supplementary: search/filter by repository name
  const [searchTerm, setSearchTerm] = useState('');
  // Bump this to re-run the effect (retry button)
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setRepos(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to fetch repositories');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount((count) => count + 1);
  };

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="projects" className="section">
      <div className="glow-blur" style={{ bottom: '15%', right: '25%' }} />

      <span className="section-subtitle">My Creative Works</span>
      <h2 className="section-title">Projects</h2>
      <p className="projects-api-note">
        Live data from the GitHub API for{' '}
        <a
          href={`https://github.com/${GITHUB_USERNAME}`}
          target="_blank"
          rel="noreferrer"
        >
          @{GITHUB_USERNAME}
        </a>
      </p>

      {loading && <Spinner />}

      {!loading && error && (
        <ErrorMessage message={error} onRetry={handleRetry} />
      )}

      {!loading && !error && (
        <>
          {/* Supplementary: filter repositories by name */}
          <div className="repo-search-bar">
            <label htmlFor="repo-search" className="visually-hidden">
              Search repositories
            </label>
            <input
              id="repo-search"
              type="search"
              className="repo-search-input"
              placeholder="Search repositories by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="repo-count">
              {filteredRepos.length} of {repos.length} repos
            </span>
          </div>

          {filteredRepos.length === 0 ? (
            <p className="repo-empty">
              {repos.length === 0
                ? 'No public repositories found for this user.'
                : 'No repositories match your search.'}
            </p>
          ) : (
            <div className="projects-grid">
              {filteredRepos.map((repo) => (
                <article key={repo.id} className="project-card glass-card repo-card">
                  <div className="project-header">
                    <span className="project-category">
                      {repo.language || 'Repository'}
                    </span>
                    <h3>{repo.name}</h3>
                  </div>

                  {repo.description && (
                    <p className="project-desc">{repo.description}</p>
                  )}

                  {/* Supplementary: display star count */}
                  <div className="repo-meta">
                    <span className="repo-stars" title="Stars">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="star-icon"
                        aria-hidden="true"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {repo.stargazers_count}
                    </span>
                    {repo.forks_count > 0 && (
                      <span className="repo-forks">{repo.forks_count} forks</span>
                    )}
                    {repo.updated_at && (
                      <span className="repo-updated">
                        Updated{' '}
                        {new Date(repo.updated_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="project-footer">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="project-link"
                    >
                      <span>View on GitHub</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="link-arrow"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Projects;
