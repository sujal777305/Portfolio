import React from 'react';

/**
 * About Component
 * Renders the "About Me" section containing background info, goals, and interests.
 */
function About() {
  return (
    <section id="about" className="section">
      <div className="glow-blur" style={{ top: '30%', right: '15%' }} />
      
      <span className="section-subtitle">Get to know me</span>
      <h2 className="section-title">About Me</h2>

      <div className="about-grid">
        {/* Main Text Content Column */}
        <div className="about-text-card glass-card">
          <h3>My Story</h3>
          <p>
            I am a passionate Information Technology student with a strong interest in Web Development, 
            Artificial Intelligence, Machine Learning, and Data Science. I enjoy exploring how backend systems 
            connect with modern frontend frameworks, and how intelligent algorithms can make applications more useful.
          </p>
          <p>
            I enjoy solving complex programming problems and building real-world projects using modern web technologies. 
            For me, coding is not just about writing syntax, but about creating tools that can make a positive impact 
            in people's daily routines.
          </p>
        </div>

        {/* Dynamic Goals/Interests Cards Grid */}
        <div className="about-goals-container">
          {/* Card 1: AI Engineer Career Goal */}
          <div className="goal-card glass-card">
            <div className="goal-icon-wrapper purple-glow">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="goal-icon"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L14.907 18M18 10.5c0 3.202-2.133 5.908-5.066 6.81l-1.077-.36a2.68 2.68 0 01-1.637-2.628V12.75M21 9v1.5a9 9 0 01-9 9M9 10.5a3 3 0 116 0v1.5H9V10.5z" />
              </svg>
            </div>
            <div className="goal-info">
              <h4>Future AI Engineer</h4>
              <p>Aiming to specialize in neural networks, computer vision, and NLP applications.</p>
            </div>
          </div>

          {/* Card 2: Tech Startup Goal */}
          <div className="goal-card glass-card">
            <div className="goal-icon-wrapper teal-glow">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="goal-icon"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21V9.75M3.284 14.253A8.996 8.996 0 0112 3c4.168 0 7.747 2.822 8.716 6.747M12 3v6.75M12 9.75h9.75M12 9.75H2.25" />
              </svg>
            </div>
            <div className="goal-info">
              <h4>Startup Visionary</h4>
              <p>Planning to build a technology startup addressing automation and smart integrations.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
