import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header/Header'
import About from './components/About/About';
import Experience from './components/Experience/Experience';
import Project from './components/Project/Project';
import Contact from './components/Contact/Contact';
import Fun from './components/Fun/Fun';
import Footer from './components/Footer/Footer';

function App() {
  return (
    <Router>
      <Header />

      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/about" element={<About />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/project" element={<Project />} />
        <Route path="/fun" element={<Fun />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      
      <Footer />
    </Router>
  );
}

export default App;
