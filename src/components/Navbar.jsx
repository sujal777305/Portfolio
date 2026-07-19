import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Navbar Component
 * Renders the navigation links for the app's routes using React Router's
 * <NavLink>, so navigation happens client-side without a full page reload.
 * Also manages the open/closed state of the mobile navigation menu, and
 * exposes a button for the dark/light theme toggle (state lives in App).
 *
 * Props:
 * - isLightMode: boolean, current theme
 * - onToggleTheme: function, flips the theme
 */
function Navbar({ isLightMode, onToggleTheme }) {
  // State to manage whether the mobile menu is open
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

  return (
    <nav className="navbar">
      {/* Hamburger menu button for mobile screens */}
      <button
        className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle Navigation"
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      {/* Navigation menu list — routes handled by React Router */}
      <ul className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
        <li className="nav-item">
          <NavLink to="/" end className={navLinkClass} onClick={closeMenu}>Home</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/projects" className={navLinkClass} onClick={closeMenu}>Projects</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/contact" className={navLinkClass} onClick={closeMenu}>Contact</NavLink>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label="Toggle dark or light mode"
          >
            {isLightMode ? '🌙 Dark' : '☀️ Light'}
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
