import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Usp from '../components/marketing/Usp';
import UspPackages from "../components/marketing/UspPackages"; 
import SoldTestimonialToggle from '../components/marketing/SoldTestimonialToggle';

import Popup from '../components/shared/Popup'; // Import the pop-up component
import './Home.css'; 

const Home = () => {
  useEffect(() => {
    document.title = "Gorge Realty | Columbia Gorge Real Estate | Nate Loker";
  }, []);

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
    </div>
  );
}

export default Home;