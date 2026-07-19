import React from 'react';

/**
 * Skills Component
 * Renders the list of skills passed down as props from App.jsx.
 * 
 * Props:
 * - skills: Array of strings containing technical skills.
 */
function Skills({ skills }) {
  // Helper to categorize skills on-the-fly for distinct badge colors if desired, 
  // or styling classes. Since it's a flat array, we can check the category.
  const getSkillCategoryClass = (skillName) => {
    const name = skillName.toLowerCase();
    
    // Web Frontend technologies
    if (['html5', 'css3', 'javascript', 'react', 'vite', 'bootstrap', 'tailwind css'].some(tech => name.includes(tech))) {
      return 'skill-frontend';
    }
    // Backend & APIs
    if (['node.js', 'express.js', 'rest apis'].some(tech => name.includes(tech))) {
      return 'skill-backend';
    }
    // Databases
    if (['mongodb', 'sql', 'mysql', 'oracle database'].some(tech => name.includes(tech))) {
      return 'skill-database';
    }
    // Programming Languages
    if (['python', 'c++', 'java'].some(tech => name.includes(tech))) {
      return 'skill-lang';
    }
    // Systems, Tools & Methods
    if (['git', 'github', 'linux', 'ubuntu', 'vs code', 'data structures', 'machine learning basics'].some(tech => name.includes(tech))) {
      return 'skill-tool';
    }
    
    return 'skill-general';
  };

  return (
    <section id="skills" className="section">
      {/* Visual background glow */}
      <div className="glow-blur" style={{ bottom: '10%', left: '15%' }} />

      <span className="section-subtitle">What I work with</span>
      <h2 className="section-title">Skills & Technologies</h2>

      <div className="skills-container glass-card">
        <p className="skills-intro">
          A collection of languages, frameworks, databases, and tools that I have studied 
          and worked with during my B.Tech courses and personal projects.
        </p>

        {/* Dynamic rendering of skills using map() */}
        <div className="skills-grid">
          {skills.map((skill, index) => (
            <div 
              key={index} 
              className={`skill-badge ${getSkillCategoryClass(skill)}`}
            >
              <span className="skill-dot" />
              <span className="skill-text">{skill}</span>
            </div>
          ))}
        </div>

        {/* Categories Legend to make the color-coding user friendly */}
        <div className="skills-legend">
          <div className="legend-item"><span className="legend-dot frontend" /> Frontend</div>
          <div className="legend-item"><span className="legend-dot backend" /> Backend & APIs</div>
          <div className="legend-item"><span className="legend-dot database" /> Databases</div>
          <div className="legend-item"><span className="legend-dot lang" /> Languages</div>
          <div className="legend-item"><span className="legend-dot tool" /> Tools & CS Basics</div>
        </div>
      </div>
    </section>
  );
}

export default Skills;
