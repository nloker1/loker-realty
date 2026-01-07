import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PropertyMap.css';

/**
 * Creates a Zillow-style price pill marker
 * Returns an L.divIcon
 */
const createPriceIcon = (price) => {
    const formattedPrice = price >= 1000000 
      ? `$${(price / 1000000).toFixed(1)}M` 
      : `$${Math.round(price / 1000)}k`;
  
    return L.divIcon({
      className: 'custom-price-marker',
      html: `<span>${formattedPrice}</span>`,
      iconSize: [60, 26],
      iconAnchor: [30, 13], // Anchor point is the center of the pill
    });
};

const PropertyMap = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/listings')
      .then((response) => response.json())
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching listings:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="map-loading">Loading Properties...</div>;

  return (
    <div className="map-wrapper">
      <div className="dev-disclaimer">
            <span className="warning-icon">⚠️</span>
            <p><strong>DEVELOPMENT MODE:</strong> TEST DATA ONLY. NOT FOR EXTERNAL USE. PLEASE COME BACK SHORTLY FOR LIVE LISTINGS.</p>
        </div>
      <MapContainer 
        center={[43.3665, -124.2179]} 
        zoom={12} 
        scrollWheelZoom={true}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {listings.map((property) => (
          <Marker 
            key={property.mls_number} 
            position={[property.lat, property.lon]}
            icon={createPriceIcon(property.price)}
          >
            <Popup minWidth={300} maxWidth={300}>
              <div className="popup-card">
                <div className="popup-image-container">
                  <img src={property.photo_url} alt={property.address} className="popup-img" />
                  <div className="popup-logo-badge">
                    <img src="/rmls_logo.jpg" alt="RMLS" />
                  </div>
                </div>

                <div className="popup-info">
                  <div className="popup-price-tag">${(property.price || 0).toLocaleString()}</div>
                  <h3 className="popup-address-text">{property.address}</h3>
                  <p className="popup-broker-text">{property.listing_brokerage || 'RMLS Member Office'}</p>
                  
                  <button className="popup-action-btn" onClick={() => window.open(`/listing/${property.mls_number}`, '_blank')}>
                    View Details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;