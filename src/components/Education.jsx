import React from 'react';

/**
 * Education Component
 * Renders the academic history/timeline of the student.
 */
function Education() {
  return (
    <section id="education" className="section">
      <div className="glow-blur" style={{ top: '20%', left: '20%' }} />

      <span className="section-subtitle">Academic Background</span>
      <h2 className="section-title">Education</h2>

      <div className="education-timeline">
        {/* Main education card */}
        <div className="education-card glass-card">
          <div className="education-header">
            <div className="education-logo-placeholder">
              {/* Modern graduation cap icon */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="cap-icon"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 019.918 5.842 50.45 50.45 0 00-2.658.814m-15.482 0a50.58 50.58 0 002.658-.814m10.166 8.378c.529-.27 1.096-.418 1.674-.418h1.22c.578 0 1.145.148 1.674.418M12 13.5v7.5m0-7.5l-3-1.5m3 1.5l3-1.5" />
              </svg>
            </div>
            
            <div className="education-meta">
              <span className="education-duration">2024 - Present</span>
              <h3>Bachelor of Technology (B.Tech)</h3>
              <p className="education-stream">Information Technology</p>
              <h4 className="education-inst">CHARUSAT University</h4>
            </div>
          </div>

          <div className="education-body">
            <p>
              Currently pursuing my undergraduate degree in Information Technology. 
              The curriculum focuses on core computer science subjects, software architecture, 
              databases, web design, and intelligent systems.
            </p>
            
            <h5 className="subheading-highlights">Key Coursework:</h5>
            <ul className="coursework-list">
              <li>Data Structures & Algorithms</li>
              <li>Database Management Systems (SQL, MongoDB)</li>
              <li>Object-Oriented Programming (C++, Java)</li>
              <li>Web Design Frameworks (React, Node.js)</li>
              <li>Fundamentals of Machine Learning</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Education;
