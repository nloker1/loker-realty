import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'

const Header = () => {
  return (
    <header className="App-header">
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/map">Map Search</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
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