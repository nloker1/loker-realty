import React from 'react';

const MarketDashboard = () => {
  // Replace with your ACTUAL Streamlit URL
  const streamlitUrl = "https://gorge-dashboard.streamlit.app/?embed=true";

  return (
    <div className="dashboard-container" style={{ height: "100vh", width: "100%" }}>
      <iframe
        src={streamlitUrl}
        title="Gorge Real Estate Analytics"
        width="100%"
        height="100%"
        frameBorder="0"
        style={{
          border: "none",
          borderRadius: "8px", // Optional: rounded corners
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" // Optional: subtle shadow
        }}
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default MarketDashboard;