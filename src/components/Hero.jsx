import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Hero Component
 * Renders the introductory section of the portfolio with call-to-action buttons.
 * Displays information dynamically via props.
 * 
 * Props:
 * - name: String representing the student's name.
 * - title: String representing the student's current title/role.
 * - college: String representing the student's university/college.
 */
function Hero({ name, title, college }) {
  return (
    <section id="hero" className="hero-section">
      {/* Background glow-blur circles for design aesthetics */}
      <div className="glow-blur" style={{ top: '10%', left: '10%' }} />
      <div className="glow-blur" style={{ bottom: '20%', right: '10%' }} />

      <div className="hero-container">
        {/* Left Column: text content and calls to action */}
        <div className="hero-content">
          <span className="hero-greeting">Hello, I'm</span>
          <h1 className="hero-name">{name}</h1>
          <h2 className="hero-title">{title}</h2>
          <p className="hero-college">
            Student at <span className="highlight">{college}</span>
          </p>
          <p className="hero-description">
            Passionate about Web Development, Artificial Intelligence, Machine Learning, 
            and Data Science. I focus on creating clean, interactive web applications and 
            solving complex algorithmic problems.
          </p>
          
          {/* Action buttons with custom styles */}
          <div className="hero-actions">
            <Link to="/projects" className="btn btn-primary">
              View My Work
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              Get In Touch
            </Link>
          </div>
        </div>

        {/* Right Column: Profile Avatar with decorative glowing shapes */}
        <div className="hero-visual">
          <div className="avatar-frame">
            <img 
              src="/avatar.png" 
              alt={`${name}'s avatar`} 
              className="avatar-img"
            />
            {/* Glowing borders inside CSS for animated aesthetics */}
            <div className="glowing-border-glow" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
