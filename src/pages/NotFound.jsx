import React from 'react';
import { Link } from 'react-router-dom';

/**
 * NotFound Page
 * Rendered for any path that doesn't match a defined route ("*" route).
 */
function NotFound() {
  return (
    <section className="section not-found-section">
      <div className="glow-blur" style={{ top: '30%', left: '30%' }} />

      <div className="not-found-card glass-card">
        <span className="not-found-code">404</span>
        <h2 className="section-title">Page Not Found</h2>
        <p className="not-found-text">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </section>
  );
}

export default NotFound;
