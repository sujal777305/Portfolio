import React from 'react';

/**
 * ErrorMessage Component
 * Shown when the GitHub API call fails.
 * Includes a retry button (supplementary) to re-trigger the fetch.
 */
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message-card glass-card" role="alert">
      <div className="error-icon-box" aria-hidden="true">!</div>
      <h3>Failed to load repositories</h3>
      <p className="error-detail">{message || 'Something went wrong while fetching data.'}</p>
      {onRetry && (
        <button type="button" className="btn btn-primary retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
