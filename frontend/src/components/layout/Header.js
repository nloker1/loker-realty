import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css'

const Header = () => {
  // Add state to track if the mouse is hovering over the menu
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="App-header">
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/map">Map Search</Link></li>

          {/* THE NEW DROPDOWN MENU */}
          <li 
            className="dropdown-wrapper"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <span className="dropdown-button">Locations ▾</span>
            
            {/* Only show this submenu if isDropdownOpen is true */}
            {isDropdownOpen && (
              <ul className="dropdown-menu">
                <li><Link to="/market/hood-river">Hood River</Link></li>
                <li><Link to="/market/white-salmon">White Salmon</Link></li>
                <li><Link to="/market/the-dalles">The Dalles</Link></li>
              </ul>
            )}
          </li>

          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </nav>
      
      {/* Container for the Stacked Logo + Text */}
      <div className="brokerage-info">
        <img src="/real-logo.png" alt="Real Broker Logo" />
        <span className="brokerage-text">Real Broker, LLC</span>
      </div>
    </header>
  );
}

export default Header;