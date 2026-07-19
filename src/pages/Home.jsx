import React from 'react';
import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Skills from '../components/Skills.jsx';
import Education from '../components/Education.jsx';

/**
 * Home Page
 * Rendered at the "/" route. Combines the introductory sections of the
 * portfolio (Hero, About, Skills, Education) that don't need their own route.
 *
 * Props:
 * - studentInfo: { name, title, college }
 * - skillsList: array of skill strings
 */
function Home({ studentInfo, skillsList }) {
  return (
    <>
      <Hero
        name={studentInfo.name}
        title={studentInfo.title}
        college={studentInfo.college}
      />
      <About />
      <Skills skills={skillsList} />
      <Education />
    </>
  );
}

export default Home;
