import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import './AboutMe.css';

const AboutMe = () => {
  return (
    <div>
      <Header />
      <div className="about-content">
      <h1>Bio</h1>
      <img src="/head_shot.jpg" alt="Nate" className="profile-picture" />
      <ul>
        <li> I initially started my careers as a software engineer. I decided to become a realtor 
        after becoming frustrated with the amount of comission realtors were charging. My goal is to charge a fair rate while maximizing the amount of money you get for your house. </li>
        <li> I love using technology to make the real estate process more efficient and save my customers time. </li>
        <li> I am grounded in the local Gorge community and love sharing this beautiful place with other wonderful people. </li>
      </ul>
      {/* Add more content about yourself here */}
      </div>
    </div>

  );
}

export default AboutMe;