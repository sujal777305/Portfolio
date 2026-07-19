import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar.jsx';

/**
 * Header Component
 * Renders the top header bar, containing the logo/brand name and the Navbar.
 * 
 * Props:
 * - name: String representing the student's name (used as the logo/brand).
 * - isLightMode: boolean, current theme (forwarded to Navbar).
 * - onToggleTheme: function, flips the theme (forwarded to Navbar).
 */
function Header({ name, isLightMode, onToggleTheme }) {
  // Extract initials from the name for a small logo avatar (e.g. Sujal Patel -> SP)
  const getInitials = (fullName) => {
    if (!fullName) return 'SP';
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  return (
    <header className="header glass-card">
      <div className="header-container">
        {/* Brand Logo with dynamic initials and name, routes back to Home */}
        <Link to="/" className="logo-brand">
          <span className="logo-icon">{getInitials(name)}</span>
          <span className="logo-text">{name}</span>
        </Link>

        {/* Embedded Navigation bar */}
        <Navbar isLightMode={isLightMode} onToggleTheme={onToggleTheme} />
      </div>
    </header>
  );
}

export default Header;
