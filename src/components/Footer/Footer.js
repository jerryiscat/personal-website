import React from 'react';
import './Footer.css'; 
import { NavLink } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.css';


function Footer() {
  return (
    <div class="footer">
        <div className='footer-contact-container'>
            <div className="social-icons">
                   <a href="https://www.linkedin.com/in/jasmine-zhang-a37500233/"><i class="fa-brands fa-linkedin"></i></a>
                    <a href="https://github.com/jerryiscat"><i class="fa-brands fa-github"></i></a>
            </div>
            
            <NavLink to='/contact'className="contact-link"> 
              <button className= "btn btn2 contact-btn">
                  Contact Me <i class="fa-solid fa-envelope"></i>
              </button>
            </NavLink>
        </div>
        <p>Copyright  &copy; Jasmine Zhang. Welcome to Jasland <i class="fa-solid fa-seedling seeding"></i></p> 
    </div>
  );
}

export default Footer;
