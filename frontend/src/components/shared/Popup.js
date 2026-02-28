import React, { useState, useEffect } from "react";
import "./Popup.css"; // We'll style it separately

const Popup = ({ onClose, onSubscribe }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubscribe(email);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Get Your Free Insider's Guide!</h2>
        <p>Subscribe now to receive the Columbia River Gorge Real Estate Guide in your inbox.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Subscribe</button>
        </form>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>
    </div>
  );
};

export default Popup;
