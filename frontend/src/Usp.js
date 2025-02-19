import React from 'react';
import './Usp.css'; // Ensure you create and import the CSS file for styling

const Usp = () => {
  return (
    <div className="usp">
      <h1>Why Work With Me? </h1>
      <div className="content-wrapper">

        <h2>1. Independent & Fair:</h2>
        <p>
          Unlike agents tied to big brokerages, I am affiliated with real broker a hands-off agency
          that allows me more independece. This allows me to give you 
          <strong> honest, unbiased </strong> advice. My <strong> fair pricing model </strong> 
          keeps more of your hard-earned equity in your pocket.
        </p>

        <h2>3. Local Expertise:</h2>
        <p>
          With deep expertise in <strong> Columbia Gorge land use laws, permits, and builder connections</strong>, 
          I guide you through complex transactions with confidence. My insights help you 
          <strong> unlock opportunities </strong> that other agents might miss.
        </p>

        <h2>2. Strong Negotiator:</h2>
        <p>
          I always negotiate to secure the best possible deal for my clients. Whether you're selling 
          or buying, my skills help you <strong> maximize value </strong> and avoid costly mistakes.
        </p>
        <h2>4. Professional Marketing:</h2>
        <p>
          Every listing receives <em> top-tier marketing</em>, including 
          <strong> professional photography, videography, and premium placements </strong> on Zillow, 
          Redfin, and other top real estate platforms—ensuring maximum exposure.
        </p>
        
      </div>
    </div>
  );
};

export default Usp;
