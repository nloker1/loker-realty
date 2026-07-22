import React, { useState } from "react";
import "./Testimonials.css";

const Testimonials = () => {
  // Testimonials Data
  const testimonials = [
    { id: 1, text: "Working with Nate as my realtor was an absolute pleasure! His expertise and commitment made the entire property buying process smooth and stress-free. Nate's deep knowledge of the local market was evident. His communication was impeccable, keeping me informed at every stepand ensuring I felt confident throughout. What impressed me most was Nate's genuine dedication to finding me the perfect property. He listened attentively to my preferences and tirelessly searched until we found exactly what I was looking for. Nate's negotiation skills were exceptional, securing a great deal and making sure all my concerns were addressed. I would wholeheartedly recommend Nate to anyone looking to buy or sell a property. His professionalism, integrity, and personal touch make him an outstanding real estate agent who goes above and beyond for his clients.", author: "- Mark DeForge" },
    { id: 2, text: "Nate was so great to work with! He was very patient with us as we looked into three different houses. He has great knowledge in the real estate field and had great recommendations for us when it came to finding out how much to offer, who to go through with inspections and consultations. If we ever need to purchase or sell another home, we would absolutely reach out to Nate again.", author: "- Sandra Virgen" },
    { id: 3, text: "Nate was very helpful during the entirety of our home buying experience. He was easy to talk to, straight forward with communication, and always responded in a timely manner.", author: "- Tritan Aberle" },
    { id: 4, text: "Nate is very friendly and knowledgeable about properties in the White Salmon area. He made our home buying journey easy and fun.", author: "- Sam Moss" },
  ];
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  const handlePrevTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
  };

  const handleNextTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="testimonials-wrapper">
      <div className="testimonials-content">
        <h2>What My Clients Say:</h2>
        <div className="testimonial-slider">
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className={`testimonial-slide ${index === currentTestimonialIndex ? "active" : ""}`}>
              <p>"{testimonial.text}"</p>
              <h3>{testimonial.author}</h3>
            </div>
          ))}
        </div>
        <div className="testimonial-controls">
          <button className="prev-btn" onClick={handlePrevTestimonial}>❮</button>
          <button className="next-btn" onClick={handleNextTestimonial}>❯</button>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
