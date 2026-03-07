import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css'

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="App-header">
      {/* Mobile Hamburger Button */}
      <button className="hamburger" onClick={toggleMobileMenu} aria-label="Toggle menu">
        <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
        <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
        <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
      </button>

      <nav className={isMobileMenuOpen ? 'nav-open' : ''}>
        <ul>
          <li><Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
          <li><Link to="/properties" onClick={() => setIsMobileMenuOpen(false)}>My Listings</Link></li>
          <li><Link to="/map" onClick={() => setIsMobileMenuOpen(false)}>Map Search</Link></li>

          <li 
            className="dropdown-wrapper"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="dropdown-button">Locations ▾</span>
            
            {isDropdownOpen && (
              <ul className="dropdown-menu">
                <li><Link to="/market/hood-river" onClick={() => setIsMobileMenuOpen(false)}>Hood River</Link></li>
                <li><Link to="/market/white-salmon" onClick={() => setIsMobileMenuOpen(false)}>White Salmon</Link></li>
                <li><Link to="/market/the-dalles" onClick={() => setIsMobileMenuOpen(false)}>The Dalles</Link></li>
              </ul>
            )}
          </li>

          <li><Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link></li>
        </ul>
      </nav>
      
      <div className="brokerage-info">
        <img src="/real-logo.png" alt="Real Broker Logo" />
        <span className="brokerage-text">Real Broker, LLC</span>
      </div>
    </header>
  );
}

export default Header;