import React from 'react';
import './About.css'; // Assuming you have a CSS file for styles
import landPage from '../../images/jasland-landpage.png';
import profileImage from '../../images/me.jpeg';
import { NavLink } from 'react-router-dom';
import Education from '../Education/Education.js';
import Skills from '../Skills/Skills.js';
import Contact from '../Contact/Contact.js';
import { aboutData } from '../../data/aboutData.js';



function About() {
  return (
    <div id="about">
        <div class="container">
            <div class="landscape-container">
                 <img src={landPage} alt="Jasmine's profile"/>
            </div>

            <div class="header-text">
                {/* <p>Software Development Engineer</p> */}
                <h1>Hi, I am <span>Jasmine</span> Zhang.</h1>
            </div>

            <div class="row">
                <div class="about-col-1">
                    <img src={profileImage} alt="Jasmine's profile"/>
                </div>
                <div class="about-col-2 intro">
                    <h1 class="sub-title">{aboutData.title}</h1>
                    <p>{aboutData.description1}<br/><br/>{aboutData.description2}{aboutData.description3 && <><br/><br/>{aboutData.description3}</>}</p>
                    <div class="intro-buttons">
                        <NavLink to="/experience" className="intro-btn">Experience</NavLink>
                        <NavLink to="/project" className="intro-btn">Projects</NavLink>
                        <NavLink to="/contact" className="intro-btn">Contact</NavLink>
                    </div>

                    {/* <div class="tab-titles">
                        <p class="tab-links active-link" onClick="opentab('skills')">Skills</p>
                        <p class="tab-links" onClick="opentab('education')">Education</p>
                        <p class="tab-links" onClick="opentab('hobby')">Hobby</p>
                    </div> */}
                    {/* <div class="tab-contents active-tab" id="skills">
                        <ul>
                            <li><span>Web Development</span><br/>Develop web application using HTML/CSS, javascript with the help of react. </li>
                            <li><span>App Development</span><br/>Develop android application</li>
                            <li><span>Programming Language</span><br/>Programming: Java, Python, C, Typescript, JavaScript, HTML/CSS, SQL, Kotlin, R</li>
                            <li><span>Frameworks</span><br/>React, Pytorch, Tensorflow </li>
                            <li><span>Technology</span><br/>git, FireBase, AWS cloud</li>
                            <li><span>Data Science</span><br/>Data Cleaning, Mining, Modeling</li>
                        </ul>
                    </div> */}

                    {/* <div class="tab-contents" id="education">
                        <ul>
                            <li><span>University of Washington - Seattle, WA </span><br/>Informatics, Minor in Math  -- Graduate in June 2025</li>
                            <p>Courses:</p>
                            <ul>
                                <li>- Data Science Methods</li>
                                <li>- Intro Machine Learning</li>
                                <li>- Web development</li>
                                <li>- Data Structures and Algorithms</li>
                                <li>- Interactive Programming</li>
                            </ul>
                        </ul>
                    </div> */}
                </div>
            </div>
            <Education />
            <Skills />
        </div>
        <Contact />
    </div>
  );
}

export default About;

