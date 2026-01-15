import React, { useState } from "react";
import "./RecentlySold.css";

const RecentlySold = () => {
  // Sample data for recently sold homes
  const homes = [
    {
      id: 1,
      image: "/601-lincoln-st/Drone-1.jpg",
      address: "601 Lincoln St. The Dalles, OR 97058",
      price: "$599,000",
      date: "5/9/25"
    },

    {
      id: 2,
      image: "6808-cooper-spur.jpg",
      address: "6808 Cooper Spur Rd Mt Hood Parkdale OR, 97041",
      price: "$586,000",
      date: "10/25/24"
    },
    {
      id: 3,
      image: "693-achor-ave.jpg",
      address: "693 Achor Ave. White Salmon, WA 98672",
      price: "$858,000",
      date: "10/15/24"
    },
    {
      id: 4,
      image: "878-hwy-142.jpg",
      address: "878 Highway 142, Klickitat, WA 98628",
      price: "$575,000",
      date: "8/30/24"
    },
    {
      id: 5,
      image: "520-wyers-st.jpg",
      address: "520 SE Wyers St, White Salmon, WA 98672",
      price: "$705,000",
      date: "8/15/24"
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? homes.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === homes.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="recently-sold-wrapper">
    <div className="recently-sold-container">
      <h1 className="section-header">Recently Sold Homes</h1>
      <div className="recently-sold-slider">
        <div className="recently-sold-slide">
          <img
            src={homes[currentIndex].image}
            alt={homes[currentIndex].address}
            className="home-image"
          />
          <h2 className="home-address">{homes[currentIndex].address}</h2>
          <p className="home-price">Price: {homes[currentIndex].price} Date: {homes[currentIndex].date} </p>
        </div>
      </div>
      <button className="prev-btn" onClick={handlePrev}>❮</button>
      <button className="next-btn" onClick={handleNext}>❯</button>
    </div>
    </div>
  );
};

export default RecentlySold;
