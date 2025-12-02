import React from 'react';
import './ProjectTag.css';
import { skillsImage } from '../../utils/skillsImage';

function ProjectTag({ tag }) {
  // Normalize tag name to match skillsImage function
  // Handle variations like "Express.js" -> "express.js", "Vue.js" -> "vue.js"
  const normalizedTag = tag.toLowerCase().replace(/\s+/g, ' ');
  const icon = skillsImage(normalizedTag);

  return (
    <div className="project-tag">
      {icon && <img src={icon} alt={tag} className="tag-icon" />}
      <span className="tag-name">{tag}</span>
    </div>
  );
}

export default ProjectTag;

