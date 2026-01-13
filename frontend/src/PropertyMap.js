import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PropertyMap.css';

// --- HELPER: Handles clicks on empty map ---
function MapEvents({ clearSelection }) {
  const map = useMap();
  useEffect(() => {
    map.on('click', () => clearSelection());
    return () => map.off('click', () => clearSelection());
  }, [map, clearSelection]);
  return null;
}

// --- HELPER: Creates Price Pill Icon ---
const createPriceIcon = (price, isSelected) => {
    const formattedPrice = price >= 1000000 
      ? `$${(price / 1000000).toFixed(1)}M` 
      : `$${Math.round(price / 1000)}k`;
    
    return L.divIcon({
      className: `custom-price-marker ${isSelected ? 'selected' : ''}`, 
      html: `<span>${formattedPrice}</span>`,
      iconSize: [60, 26],
      iconAnchor: [30, 13], 
    });
};

// --- NEW COMPONENT: Zillow-Style Search Bar ---
// We pass 'map' into this so it can control movement directly
const SearchBar = ({ listings, onSelectListing }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const map = useMap(); // Access the map instance

    // Filter listings as user types
    const handleInputChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.length > 0) {
            const matches = listings.filter(property => 
                (property.address && property.address.toLowerCase().includes(term.toLowerCase())) ||
                (property.mls_number && property.mls_number.toString().includes(term)) ||
                (property.city && property.city.toLowerCase().includes(term.toLowerCase()))
            );
            setSuggestions(matches.slice(0, 5)); // Limit to top 5 results
        } else {
            setSuggestions([]);
        }
    };

    // When user clicks a suggestion
    const handleSelect = (property) => {
        setSearchTerm('');   // Clear input
        setSuggestions([]);  // Clear dropdown
        onSelectListing(property); // Open the card

        // SMOOTH FLY-TO ANIMATION
        map.flyTo([property.lat, property.lon], 16, {
            animate: true,
            duration: 1.5 // Slower, smoother glide
        });
    };

    return (
        <div className="search-container">
            <div className="search-box">
                {/* Search Icon (using text for simplicity, can be SVG) */}
                <span className="search-icon">🔍</span>
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Address, City, Zip, or MLS..." 
                    value={searchTerm}
                    onChange={handleInputChange}
                />
            </div>

            {/* Dropdown Suggestions */}
            {suggestions.length > 0 && (
                <ul className="search-suggestions">
                    {suggestions.map(property => (
                        <li 
                            key={property.mls_number} 
                            className="suggestion-item"
                            onClick={() => handleSelect(property)}
                        >
                            <span>{property.address}, {property.city}</span>
                            <span className="suggestion-price">
                                {property.price ? `$${(property.price/1000).toFixed(0)}k` : ''}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const PropertyMap = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
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
      
      {/* Dev Disclaimer */}
      <div className="dev-disclaimer">
         <span className="warning-icon">⚠️</span>
         <p><strong>DEV MODE:</strong> TEST DATA ONLY.</p>
      </div>

      <MapContainer 
        center={[43.3665, -124.2179]} 
        zoom={12} 
        scrollWheelZoom={true}
        className="leaflet-container"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEvents clearSelection={() => setSelectedListing(null)} />
        
        {/* --- PLACE SEARCH BAR INSIDE MAPCONTAINER --- */}
        {/* Why inside? Because it needs access to 'useMap()' hook to flyTo() */}
        <SearchBar 
            listings={listings} 
            onSelectListing={setSelectedListing} 
        />

        {listings
            /* 1. INSERT FILTER HERE */
            .filter(property => property.lat && property.lon)
            
            /* 2. Then map over what is left */
            .map((property) => {
            const isSelected = selectedListing?.mls_number === property.mls_number;
            
            return (
              <Marker 
                key={property.mls_number} 
                position={[property.lat, property.lon]}
                icon={createPriceIcon(property.price, isSelected)}
                zIndexOffset={isSelected ? 1000 : 0}
                eventHandlers={{
                    click: (e) => {
                        L.DomEvent.stopPropagation(e.originalEvent);
                        setSelectedListing(property);
                    }
                }}
              />
            );
        })}
      </MapContainer>

      {/* --- RESPONSIVE PROPERTY CARD --- */}
      {selectedListing && (
        <div className="property-card-container">
            <button className="close-card-btn" onClick={() => setSelectedListing(null)}>×</button>
            
          <div className="card-image-wrapper">
              <img 
                  className="main-property-photo" 
                  src={selectedListing.photo_url} 
                  alt={selectedListing.address}
              />
              <span className="card-badge">
                  {selectedListing.internal_status || 'Active'}
              </span>
              <img 
                  src="/rmls_logo.jpg" 
                  alt="RMLS" 
                  className="rmls-logo-overlay" 
              />
          </div>
            <div className="card-content">
                <div className="card-header-row">
                    <div className="card-price">
                        {selectedListing.price 
                            ? `$${selectedListing.price.toLocaleString()}` 
                            : 'Price Upon Request'}
                    </div>
                </div>
                <div className="card-stats">
                    {selectedListing.beds || 0} bds | 
                    {' '}{selectedListing.baths || 0} ba | 
                    {' '}{selectedListing.sqft ? selectedListing.sqft.toLocaleString() : '—'} sqft
                </div>
                <div className="card-address">
                    {selectedListing.address}
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