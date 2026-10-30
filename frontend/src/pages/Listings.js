import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { createSlug } from '../utils/slugify';
import ListingsMap from '../components/map/ListingsMap';
import './Listings.css'; 

const Listings = ({ embedded = false }) => {
  const [activeListings, setActiveListings] = useState([]);
  const [soldListings, setSoldListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const navigate = useNavigate();

  const isLocal = window.location.hostname === 'localhost';
  const apiBase = isLocal ? 'http://localhost:8000/api/listings' : '/api/listings';

  useEffect(() => {
    const fetchMyListings = async () => {
      setLoading(true);
      try {
        // Fetch Active
        const response = await fetch(`${apiBase}?status=Active&agent_name=Nate Loker`);
        const myActive = await response.json();
        setActiveListings(myActive);

        // Fetch Sold
        const soldResponse = await fetch(`${apiBase}?status=Sold&agent_name=Nate Loker`);
        const mySold = await soldResponse.json();
        setSoldListings(mySold);

      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, [apiBase]);

  const listingsToShow = activeTab === 'active' ? activeListings : soldListings;

  return (
    <div className={embedded ? "listings-embedded" : "listings-page"}>
      {!embedded && <Header />}
      
      <main className="listings-container">
        <header className="listings-hero">
          <h2>My Listings:</h2>
        </header>

        <div className="listings-controls">
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active ({activeListings.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'sold' ? 'active' : ''}`}
              onClick={() => setActiveTab('sold')}
            >
              Sold ({soldListings.length})
            </button>
          </div>
          
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
            >
              Map View
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading listings...</div>
        ) : viewMode === 'map' ? (
          <ListingsMap listings={listingsToShow} />
        ) : (
          <div className="listings-grid">
            {listingsToShow.length > 0 ? (
              listingsToShow.map((property) => (
                <div key={property.mls_number} className="property-card" onClick={() => {
                  const slug = createSlug(property.address, property.city, property.zipcode);
                  navigate(`/property/${slug}/${property.mls_number}`);
                }}>
                  <div className="card-image-wrapper">
                    <img src={property.photo_url} alt={property.address} />
                    <span className={`card-badge ${property.status?.toLowerCase()}`}>
                      {property.status}
                    </span>
                  </div>
                  <div className="card-content">
                    <h3 className="card-price">${property.price.toLocaleString()}</h3>
                    <p className="card-address">{property.address}</p>
                    <p className="card-city">{property.city}, {property.zipcode}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No listings found in this category.</div>
            )}
          </div>
        )}
      </main>

      {!embedded && <Footer />}
    </div>
  );
};

export default Listings;
