import React, { useState } from "react";
import "./SoldTestimonialToggle.css";

const SoldTestimonialToggle = () => {
  const [activeTab, setActiveTab] = useState("sold"); // Default: Recently Sold

  // Recently Sold Data
  const homes = [
    { id: 1, image: "6808-cooper-spur.jpg", address: "6808 Cooper Spur Rd, Mt Hood Parkdale, OR 97041", price: "$586,000", date: "10/25/24" },
    { id: 2, image: "693-achor-ave.jpg", address: "693 Achor Ave, White Salmon, WA 98672", price: "$858,000", date: "10/15/24" },
    { id: 3, image: "878-hwy-142.jpg", address: "878 Highway 142, Klickitat, WA 98628", price: "$575,000", date: "8/30/24" },
    { id: 4, image: "520-wyers-st.jpg", address: "520 SE Wyers St, White Salmon, WA 98672", price: "$705,000", date: "8/15/24" },
  ];
  const [currentHomeIndex, setCurrentHomeIndex] = useState(0);

  const handlePrevHome = () => {
    setCurrentHomeIndex((prevIndex) => (prevIndex === 0 ? homes.length - 1 : prevIndex - 1));
  };

  const handleNextHome = () => {
    setCurrentHomeIndex((prevIndex) => (prevIndex === homes.length - 1 ? 0 : prevIndex + 1));
  };

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
    <div className="toggle-wrapper">
    <div className="toggle-container">
      {/* Toggle Buttons */}
      <div className="toggle-buttons">
        <button className={activeTab === "sold" ? "active" : ""} onClick={() => setActiveTab("sold")}>
          Recently Sold
        </button>
        <button className={activeTab === "testimonials" ? "active" : ""} onClick={() => setActiveTab("testimonials")}>
          Testimonials
        </button>
      </div>

      {/* Recently Sold Section */}
      {activeTab === "sold" && (
        <div className="recently-sold-container">
          <h2>Recently Sold Homes:</h2>
          <div className="recently-sold-slide">
            <img src={homes[currentHomeIndex].image} alt={homes[currentHomeIndex].address} className="home-image" />
            <h3 className="home-address">{homes[currentHomeIndex].address}</h3>
            <p className="home-price">Price: {homes[currentHomeIndex].price} | Date: {homes[currentHomeIndex].date}</p>
          </div>
          <button className="prev-btn" onClick={handlePrevHome}>❮</button>
          <button className="next-btn" onClick={handleNextHome}>❯</button>
        </div>
      )}

      {/* Testimonials Section */}
      {activeTab === "testimonials" && (
        <div className="testimonials-container">
          <h2>What My Clients Say:</h2>
          <div className="testimonial-slider">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className={`testimonial-slide ${index === currentTestimonialIndex ? "active" : ""}`}>
                <p>"{testimonial.text}"</p>
                <h3>{testimonial.author}</h3>
              </div>
            ))}
          </div>
          <button className="prev-btn" onClick={handlePrevTestimonial}>❮</button>
          <button className="next-btn" onClick={handleNextTestimonial}>❯</button>
        </div>
      )}
    </div>
    </div>
  );
};

export default SoldTestimonialToggle;
