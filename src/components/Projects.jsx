import React from 'react';

/**
 * Projects Component
 * Renders the portfolio projects section displaying project cards.
 */
function Projects() {
  // Array of project details to keep the code DRY and structured
  const projectsList = [
    {
      title: 'SmartID Attendance System',
      category: 'AI & Web Application',
      description: 'An automated, high-security student attendance system utilizing face recognition and instant QR verification codes to replace manual registers.',
      features: [
        'Real-time automated face verification',
        'Dynamic secure QR codes for check-ins',
        'Comprehensive admin panel with analytics',
        'REST APIs for campus database sync'
      ],
      techStack: ['React', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'ML Basics'],
      githubLink: 'https://github.com/sujalpatel/smartid-attendance'
    },
    {
      title: 'AI Resume Analyzer',
      category: 'Data Science & NLP',
      description: 'A smart tool that parses resumes in PDF format, evaluates technical skills, and matches them with active job description requirements using basic ML NLP keyword tags.',
      features: [
        'PDF parser extracting structured text',
        'Skills gap visualization charts',
        'Automated profile matching score'
      ],
      techStack: ['Python', 'Machine Learning Basics', 'REST APIs', 'VS Code'],
      githubLink: 'https://github.com/sujalpatel/ai-resume-analyzer'
    },
    {
      title: 'Personal Portfolio Website',
      category: 'Frontend Design',
      description: 'A fully responsive, sleek, and innovative developer portfolio showcasing technical expertise, educational path, and academic practical assignments.',
      features: [
        'Premium glassmorphic UI design',
        'Custom clean CSS grids and animations',
        'Responsive mobile hamburger drawer'
      ],
      techStack: ['React', 'Vite', 'CSS3', 'HTML5', 'Git'],
      githubLink: 'https://github.com/sujalpatel/student-portfolio'
    }
  ];

  return (
    <section id="projects" className="section">
      <div className="glow-blur" style={{ bottom: '15%', right: '25%' }} />

      <span className="section-subtitle">My Creative Works</span>
      <h2 className="section-title">Projects</h2>

      <div className="projects-grid">
        {projectsList.map((project, index) => (
          <div key={index} className="project-card glass-card">
            {/* Card header with category and title */}
            <div className="project-header">
              <span className="project-category">{project.category}</span>
              <h3>{project.title}</h3>
            </div>

            {/* Description */}
            <p className="project-desc">{project.description}</p>

            {/* Features lists */}
            <div className="project-features">
              <h4>Key Features:</h4>
              <ul>
                {project.features.map((feature, fIdx) => (
                  <li key={fIdx}>
                    <span className="feature-icon">✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech badges */}
            <div className="project-tech">
              {project.techStack.map((tech, tIdx) => (
                <span key={tIdx} className="tech-badge">
                  {tech}
                </span>
              ))}
            </div>

            {/* Action link */}
            <div className="project-footer">
              <a 
                href={project.githubLink} 
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;
