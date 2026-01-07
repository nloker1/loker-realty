import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'

const Header = () => {
  return (
    <header className="App-header">
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/blog">Education</Link></li>
          <li><Link to="/map">Map Search</Link></li> {/* Uncommented and renamed */}
          <li><Link to="/contact">Contact</Link></li>
          {/* other links */}
        </ul>
      </nav>
      {/* Any other header content */}
    </header>
  );
}

export default Header;
