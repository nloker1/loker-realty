import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PropertyMap.css';

// --- HELPER: Handles clicks on the empty map background ---
function MapEvents({ clearSelection }) {
  const map = useMap();
  useEffect(() => {
    map.on('click', () => clearSelection());
    return () => map.off('click', () => clearSelection());
  }, [map, clearSelection]);
  return null;
}

// --- HELPER: Creates the "Price Pill" Marker Icon ---
const createPriceIcon = (price, isSelected) => {
    const formattedPrice = price >= 1000000 
      ? `$${(price / 1000000).toFixed(1)}M` 
      : `$${Math.round(price / 1000)}k`;
   
    return L.divIcon({
      // Adds 'selected' class if clicked (turns black)
      className: `custom-price-marker ${isSelected ? 'selected' : ''}`, 
      html: `<span>${formattedPrice}</span>`,
      iconSize: [60, 26],
      iconAnchor: [30, 13], 
    });
};

const PropertyMap = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    // Environment detection
    const isLocal = window.location.hostname === 'localhost';
    const apiUrl = isLocal ? 'http://localhost:8000/api/listings' : '/api/listings';

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch((err) => {
          console.error("Error fetching listings:", err);
          setLoading(false);
      });
  }, []);

  if (loading) return <div className="map-loading">Loading Properties...</div>;

  return (
    <div className="map-wrapper">
      
      {/* Dev Disclaimer (Optional - remove when live) */}
      <div className="dev-disclaimer">
         <span className="warning-icon">⚠️</span>
         <p><strong>DEV MODE:</strong> TEST DATA ONLY.</p>
      </div>

      <MapContainer 
        center={[43.3665, -124.2179]} 
        zoom={12} 
        scrollWheelZoom={true}
        className="leaflet-container"
        zoomControl={false} // We hide default zoom to avoid UI clutter on mobile
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Clicking the map background closes the active card */}
        <MapEvents clearSelection={() => setSelectedListing(null)} />

        {listings.map((property) => {
            const isSelected = selectedListing?.mls_number === property.mls_number;
            
            return (
              <Marker 
                key={property.mls_number} 
                position={[property.lat, property.lon]}
                icon={createPriceIcon(property.price, isSelected)}
                zIndexOffset={isSelected ? 1000 : 0} // Selected pin always on top
                eventHandlers={{
                    click: (e) => {
                        // Stop click from hitting the map background
                        L.DomEvent.stopPropagation(e.originalEvent);
                        setSelectedListing(property);
                    }
                }}
              />
            );
        })}
      </MapContainer>

      {/* --- RESPONSIVE PROPERTY CARD --- */}
      {/* CSS determines if this is a "Bottom Sheet" (Mobile) or "Side Panel" (Desktop) */}
      {selectedListing && (
        <div className="property-card-container">
            <button className="close-card-btn" onClick={() => setSelectedListing(null)}>×</button>
            
          <div className="card-image-wrapper">
              {/* 1. ADD THE CLASS HERE */}
              <img 
                  className="main-property-photo"  /* <-- Add this class */
                  src={selectedListing.photo_url} 
              />

              {/* 2. Status Badge (Unchanged) */}
              <span className="card-badge">
                  {selectedListing.internal_status || 'Active'}
              </span>

              {/* 3. RMLS Logo (Unchanged) */}
              <img 
                  src="/rmls_logo.jpg" 
                  alt="RMLS" 
                  className="rmls-logo-overlay" 
              />
          </div>
            <div className="card-content">
                <div className="card-header-row">
                    {/* SAFE GUARD: Check if price exists before formatting */}
                    <div className="card-price">
                        {selectedListing.price 
                            ? `$${selectedListing.price.toLocaleString()}` 
                            : 'Price Upon Request'}
                    </div>
                </div>
                
                <div className="card-stats">
                    {/* SAFE GUARDS: specific checks for missing data */}
                    {selectedListing.beds || 0} bds | 
                    {' '}{selectedListing.baths || 0} ba | 
                    {' '}{selectedListing.sqft ? selectedListing.sqft.toLocaleString() : '—'} sqft
                </div>
                
                <div className="card-address">
                    {selectedListing.address}, {selectedListing.city}
                </div>
                
                <p className="card-broker">{selectedListing.listing_brokerage}</p>
                
                <button 
                    className="view-details-btn"
                    onClick={() => navigate(`/listing/${selectedListing.mls_number}`)}
                >
                    View Details
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default PropertyMap;