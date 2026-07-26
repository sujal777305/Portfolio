import React from 'react';

/**
 * Spinner Component
 * Shown while the GitHub API request is in progress.
 */
function Spinner() {
  return (
    <div className="spinner-wrapper" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p className="spinner-text">Loading repositories...</p>
    </div>
  );
}

export default Spinner;
