import React from 'react';
import './Header.css'; 
import { NavLink } from 'react-router-dom';
import whiteLogo from '../../images/white-logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

function Header() {
  return (
    <div id="header">
      <div class="container">
          <nav>
              <img src={whiteLogo} alt="logo" class="logo"/>
              <ul id="sidemenu">
                  <NavLink to='/'className="nav-link">About</NavLink>
                  <NavLink to='/experience'className="nav-link">Experience</NavLink>
                  <NavLink to='/project'className="nav-link">Projects</NavLink>
                  <NavLink to='/hobby'className="nav-link">Hobby</NavLink>
                  {/* <NavLink to='/fun' className="nav-link">
                    Fun <FontAwesomeIcon icon={faHeart} />
                  </NavLink> */}
                  <i class="fas fa-times" onClick="closemenu()"></i>
              </ul>
              <i class="fas fa-bars" onClick="openmenu()"></i>
          </nav>
      </div>
    </div>
  );
}

export default Header;
