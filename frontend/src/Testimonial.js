import React from 'react';
import './Testimonial.css'; 

export default function Testimonial() {
  return (
    <div class="testimonial-wrapper">
    <div className="testimonial-container">
      <h1 className="testimonial-header">What My Clients Say</h1>
      <div className="testimonial-slider">
        <div className="testimonial-slide active">
          <p>"Working with Nate as my realtor was an absolute pleasure! His expertise and commitment 
          made the entire property buying process smooth and stress-free. Nate's deep knowledge of the
          local market was evident. His communication was impeccable, keeping me informed at every step
           and ensuring I felt confident throughout. What impressed me most was Nate's genuine dedication
           to finding me the perfect property. He listened attentively to my preferences and tirelessly 
           searched until we found exactly what I was looking for. Nate's negotiation skills were exceptional, 
           securing a great deal and making sure all my concerns were addressed. I would wholeheartedly 
           recommend Nate to anyone looking to buy or sell a property. His professionalism, 
           integrity, and personal touch make him an outstanding real estate agent who goes above and 
           beyond for his clients"</p>
          <h3>-  Mark DeForge</h3>
        </div>
        <div className="testimonial-slide">
          <p>"Nate was so great to work with! He was very patient with us as we looked into three different houses. 
             He has great knowledge in the real estate field and had great recommendations for us when it came to 
             finding out how much to offer, who to go through with inspections and consultations. 
             If we ever need to purchase or sell another home we would absolutely reach out to Nate again."</p>
          <h3>- Sandra Virgen</h3>
        </div>
        <div className="testimonial-slide">
          <p>"Nate was very helpful during the entirety of our home buying experience. 
             He was easy to talk to, straight forward with communication, and always responded in a timely manner."</p>
          <h3>- Tritan Aberle</h3>
        </div>
        <div className="testimonial-slide">
          <p>"Nate is very knowledgeable about properties in the White Salmon area and the community of White Salmon. 
             Nate is very friendly and was always able to take us to a showing. 
             We felt really lucky that we were able to connect with him and he made our home buying journey 
             feel easy and fun."</p>
          <h3>- Sam Moss</h3>
        </div>
      </div>
      <button className="prev-btn" onClick={() => handlePrev()}>❮</button>
      <button className="next-btn" onClick={() => handleNext()}>❯</button>
    </div>
    </div>
  );

  function handlePrev() {
    const slides = document.querySelectorAll(".testimonial-slide");
    let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains("active"));
    slides[currentIndex].classList.remove("active");
    currentIndex = currentIndex > 0 ? currentIndex - 1 : slides.length - 1;
    slides[currentIndex].classList.add("active");
  }

  function handleNext() {
    const slides = document.querySelectorAll(".testimonial-slide");
    let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains("active"));
    slides[currentIndex].classList.remove("active");
    currentIndex = currentIndex < slides.length - 1 ? currentIndex + 1 : 0;
    slides[currentIndex].classList.add("active");
  }
}

