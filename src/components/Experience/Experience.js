import React from 'react';
import './Experience.css'; // Assuming you have a CSS file for styles
import { experienceData } from '../../data/ExperienceData'


function Experience() {
  return (
    <div id="experience">
        <div className="container">
            <h1 className="sub-title">Experience</h1>
            <div className="experience-list">
                {experienceData.map((exp, index) => (
                    <div key={index}>
                        <span className="experience-icon">{exp.icon || "📋"}</span>
                        <h2>{exp.title}</h2>
                        <p><em><b>{exp.institution}, {exp.duration}</b></em></p>
                        <br/>
                        <ul>
                            {exp.responsibilities.map((item, idx) => {
                                // Check if this is the first item (publication) and exp has a publicationLink
                                if (idx === 0 && exp.publicationLink) {
                                    // Make the entire publication sentence clickable without showing the URL
                                    return (
                                        <li key={idx}>
                                            <a 
                                                href={exp.publicationLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ color: '#fff', textDecoration: 'underline' }}
                                            >
                                                {item}
                                            </a>
                                        </li>
                                    );
                                }
                                
                                // Check if the item contains a URL
                                const urlRegex = /(https?:\/\/[^\s]+)/g;
                                const urlMatch = item.match(urlRegex);
                                
                                if (urlMatch) {
                                    // If URL found, make the entire sentence clickable
                                    return (
                                        <li key={idx}>
                                            <a 
                                                href={urlMatch[0]} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ color: '#fff', textDecoration: 'underline' }}
                                            >
                                                {item}
                                            </a>
                                        </li>
                                    );
                                }
                                
                                // If no URL, render normally
                                return <li key={idx}>{item}</li>;
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    </div>
    // <div class="experience-list">   
    //             <div>
    //                 <i class="fa-solid fa-book-open-reader"></i>
    //                 <h2>Undergraduate Teacher Assistant</h2>
    //                 <p><em><b>University of Washington, Information School and Allen School, Sep 2022 – current</b></em></p>
    //                 <br/>
    //                 <ul>
    //                     <li>Teaching Intro to Data Science, Intro to Data Programming (R) and Intermediate Data Programming (Python) as a teacher assistant for 15 - 19 hours every week
    //                     </li>
    //                     <li>Hosting office hours, Grade assignments,  preparing learning resources and conduct labs for 25+ students. 
    //                     </li>
    //                 </ul>
    //             </div>

    //             <div>
    //                 <i class="fa-solid fa-magnifying-glass"></i>
    //                 <h2>Research Assistant</h2>
    //                 <p><em><b>University of Washington, DataLab, June 2023 – current</b></em></p>
    //                 <br/>
    //                 <ul>
    //                     <li>Collaborating with a diverse team of developers, designers, and researchers in a Git-based environment to identify and resolve website issues.
    //                     </li>
    //                     <li>Utilizing TypeScript and Vegalite to enhance interactive plots</li>
    //                 </ul>
    //             </div>

    //             <div>
    //                 <i class="fa-solid fa-code"></i>
    //                 <h2>Marketing Director</h2>
    //                 <p><em><b>The Technology and Business Association, UW</b></em></p>
    //                 <br/>
    //                 <ul>
    //                     <li>Planed tech events for 50+ attendees, and implemented marketing strategies to boost visibility and increased membership by 20%
    //                     </li>
    //                     <li>Independently wireframed, prototyped, and created 3 pages for the organization website, updating CMS data using webflow and custom codes
    //                     </li>
    //                 </ul>
    //             </div>
    // </div> 
  );
}



export default Experience;
