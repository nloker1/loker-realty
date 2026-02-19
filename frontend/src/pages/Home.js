import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Usp from '../components/marketing/Usp';
import UspPackages from "../components/marketing/UspPackages"; 
import SoldTestimonialToggle from '../components/marketing/SoldTestimonialToggle';

import Popup from '../components/shared/Popup'; // Import the pop-up component
import './Home.css'; 

const Home = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    document.title = "Gorge Realty | Columbia Gorge Real Estate | Nate Loker";
    // Check if the user has already seen the pop-up
    const hasVisited = localStorage.getItem("hasVisited");

    if (!hasVisited) {
      // Show pop-up after 5 seconds
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
    localStorage.setItem("hasVisited", "true"); // Save that the user has seen the pop-up
  };

  const handleSubscribe = (email) => {
    console.log("Subscribing:", email);
    localStorage.setItem("hasVisited", "true"); // Prevent pop-up from showing again
    setShowPopup(false);
  };

  return (
    <div>
      <Header /> 
      <div className="home-content">
          <div className="hero-section">
            <div className="header-container">        
              <div className="header-text">
                  <h1>Nate Loker</h1>
                  <h2>Columbia Gorge Realtor | Real Broker LLC </h2>
              </div>
              <img src="head_shot.jpg" alt="Nate Loker" className="headshot" />
            </div>
            <div className="consultation-box">
              <a href="https://calendly.com/consultation-with-nate" target="_blank" rel="noopener noreferrer" className="consultation-link">
                Free Consultation
              </a>
            </div>
          </div>
      </div>
      
      <Usp />
      <UspPackages />
      <SoldTestimonialToggle />

      <Footer />

      {/* Pop-up component - only renders if showPopup is true */}
      {showPopup && <Popup onClose={handleClosePopup} onSubscribe={handleSubscribe} />}
    </div>
  );
}

export default Home;