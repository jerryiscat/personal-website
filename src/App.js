import React from 'react';
import { Route, Routes, HashRouter} from 'react-router-dom';
import Header from './components/Header/Header'
import About from './components/About/About';
import Experience from './components/Experience/Experience';
import Project from './components/Project/Project';
import Contact from './components/Contact/Contact';
import Fun from './components/Fun/Fun';
import Hobby from './components/Hobby/Hobby';
import Footer from './components/Footer/Footer';
import GameViewer from './components/GameViewer/GameViewer';

function App() {
  return (
    <HashRouter>
      <Header />
      {/* <ScrollToTop/> */}
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/about" element={<About />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/project" element={<Project />} />
        <Route path="/fun" element={<Fun />} />
        <Route path="/hobby" element={<Hobby />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/game/:gameName" element={<GameViewer />} />
      </Routes>
      <Footer />
      {/* <BackToTop /> */}
    </HashRouter>
    
  );
}

export default App;
