// Contact.js
import React, { useState, useCallback } from 'react';
import { FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './Contact.css';



const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiBaseUrl = process.env.REACT_APP_API_URL || "https://www.lokerrealty.com/api";
    const submitFormEndpoint = `${apiBaseUrl}/submit-form`;

    try {
      const response = await fetch(submitFormEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      setIsSubmitted(true);
      alert('Form submitted successfully.');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit the form. Please try again.');
    }
  };

  return (
    <div>
      <Header />
      <div className="contact-container">
        <h1>Let's Connect:</h1>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message:</label>
              <textarea id="message" name="message" value={formData.message} onChange={handleChange} className="message-textarea" placeholder="Message" required></textarea>
            </div>
            <button type="submit">Message Nate</button>
          </form>
        ) : (
          <p>Message sent successfully. I will be in touch soon!</p>
        )}

        {/* Contact Details Section */}
        <div className="contact-details">
          <div className="contact-item">
            <FaPhoneAlt className="icon" />
            <a href="tel:+15412418998">(541) 399-7756</a>
          </div>
          <div className="contact-item">
            <FaEnvelope className="icon" />
            <a href="mailto:nloker1@gmail.com">nloker1@gmail.com</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;