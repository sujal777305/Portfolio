import React from 'react';
import Projects from '../components/Projects.jsx';

/**
 * ProjectsPage
 * Rendered at the "/projects" route. Thin wrapper around the existing
 * Projects component so the route has its own dedicated page component,
 * matching the pattern used by Home and Contact.
 */
function ProjectsPage() {
  return <Projects />;
}

export default ProjectsPage;
