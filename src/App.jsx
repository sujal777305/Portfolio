import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import './App.css';

// Route-based code splitting using React.lazy() for performance optimization
const Home = lazy(() => import('./pages/Home.jsx'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

/**
 * App Component
 * The central component of the Student Portfolio.
 * Wraps the shared layout (Header + Footer) around React Router's <Routes>,
 * and owns the dark/light theme state that is applied to the document root.
 */
function App() {
  // Data passed down to the Home page
  const studentInfo = {
    name: 'Sujal Patel',
    title: 'B.Tech Information Technology Student',
    college: 'CHARUSAT'
  };

  const skillsList = [
    'HTML5',
    'CSS3',
    'JavaScript',
    'React',
    'Vite',
    'Bootstrap',
    'Tailwind CSS',
    'Node.js',
    'Express.js',
    'MongoDB',
    'Git',
    'GitHub',
    'Python',
    'C++',
    'Java',
    'SQL',
    'MySQL',
    'Oracle Database',
    'Linux',
    'Ubuntu',
    'VS Code',
    'Data Structures',
    'Machine Learning Basics',
    'REST APIs'
  ];

  // Dark/light theme toggle (Supplementary Problem: useState driving a CSS class on root)
  const [isLightMode, setIsLightMode] = useState(false);

  const toggleTheme = () => {
    setIsLightMode((prev) => !prev);
  };

  // Apply the 'light-mode' class to the root <html> element whenever it changes
  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', isLightMode);
  }, [isLightMode]);

  return (
    <div className="portfolio-app">
      {/* Header + Navbar are shared across every route */}
      <Header name={studentInfo.name} isLightMode={isLightMode} onToggleTheme={toggleTheme} />

      <main className="main-content">
        <Suspense
          fallback={
            <div className="spinner-wrapper" role="status" aria-live="polite" style={{ minHeight: '50vh' }}>
              <div className="spinner" aria-hidden="true" />
              <p className="spinner-text">Loading page...</p>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home studentInfo={studentInfo} skillsList={skillsList} />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/contact" element={<Contact />} />
            {/* Catch-all route for unknown paths */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* Footer is shared across every route */}
      <Footer />
    </div>
  );
}

export default App;
