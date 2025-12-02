import React from 'react';
import './Project.css'; // Assuming you have a CSS file for styles
import { FaExternalLinkAlt } from 'react-icons/fa';
import { projectsData } from '../../data/projectData';
import ProjectTag from './ProjectTag';

function Project() {
  return (
    <div id="project">
            <div className="container">
                <h1 className="sub-title">My Projects <i class="fa-solid fa-code"></i></h1>

                <div className="work-list">
                    {projectsData.map(project => (
                        <div key={project.id}>
                            <h2 className='sub-title'>{project.name}</h2>
                            <div className="work">
                                <img src={project.image} alt={project.name} />
                                <div className="layer">
                                    <h2>{project.name}</h2>
                                    <p>{project.desc}</p>
                                    <a href={project.demo} target="_blank" rel="noreferrer"><FaExternalLinkAlt /></a>
                                </div>
                            </div>
                            {project.tags && project.tags.length > 0 && (
                                <div className="project-tags-container">
                                    {project.tags.map((tag, index) => (
                                        <ProjectTag key={index} tag={tag} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
    </div>
  );
}

export default Project;
