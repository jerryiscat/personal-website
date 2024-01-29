import React, { useContext } from 'react';
import { ThemeContext, themeData} from '../../contexts/ThemeContext';

import './Education.css'
import eduImgWhite from '../../images/eduImgWhite.svg'
import eduImgBlack from '../../images/eduImgBlack.svg'
import eduPink from '../../images/eduPink.svg'

import { educationData } from '../../data/educationData'


function Education() {

    const { theme } = useContext(ThemeContext);

    return (
        <div className="education" id="resume">
            <div className="education-body">
                <div className="education-description">
                <h1 class="sub-title" style={{color:theme.primary}}>Education</h1>
                    {educationData.map(edu => (
                        <div key={edu.id} className='education-card' >
                            <div className="educard-img" style={{backgroundColor:theme.primary}}>
                                <img src={theme.type === 'light' ? eduImgBlack : eduImgWhite} alt="" />
                            </div>
                            <div className="education-details">
                                <h6 style={{color: theme.primary}}>{edu.startYear}-{edu.endYear}</h6>
                                <h4 style={{color: theme.tertiary}}>{edu.course}</h4>
                                <h5 style={{color: theme.tertiary80}}>{edu.institution}</h5>
                            </div>
                        </div> 
                    ))}
                </div>
                <div className="education-image">
                    <img src={eduPink} alt="education"/>
                </div>
            </div>
        </div>
    )
}

export default Education
