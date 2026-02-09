// ==========================================
// 1. IMPORTS
// ==========================================
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PropertyMap.css';

// ARCHITECTURE NOTE: You are importing FilterBar here, but NOT using it below.
// You are currently using the old 'SearchBar' defined inside this file instead.
import FilterBar from '../../components/map/FilterBar'; 
import Header from '../../components/layout/Header';
import { createSlug } from '../../utils/slugify';


// ==========================================
// 2. HELPER: MAP EVENTS
// ==========================================
// This invisible component sits inside the map. 
// When you click empty space (grass/water), it triggers 'clearSelection' 
// to close the popup card.
function MapEvents({ clearSelection }) {
  const map = useMap();
  useEffect(() => {
    map.on('click', () => clearSelection());
    return () => map.off('click', () => clearSelection());
  }, [map, clearSelection]);
  return null;
}

// ==========================================
// 3. HELPER: CUSTOM MARKER ICONS
// ==========================================
// This creates the little HTML "Pills" showing the price ($500k).
// CRITICAL MISSING PIECE: This version doesn't handle Status Colors yet. 
// It only checks 'isSelected' (Green) or default (Blue).
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

// ==========================================
// 4. THE OLD SEARCH BAR (CLIENT-SIDE)
// ==========================================
// ⚠️ PROBLEM AREA: This component creates the search bar inside the map.
// It filters the 'listings' array using Javascript (.filter).
// This restricts you to ONLY searching what is already downloaded.
// It cannot see "Sold" listings because they aren't downloaded by default.
const SearchBar = ({ listings, onSelectListing }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const map = useMap(); // Allows this bar to fly the map around

    const handleInputChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        // This filters the LOCAL data in memory.
        if (term.length > 0) {
            const matches = listings.filter(property => 
                (property.address && property.address.toLowerCase().includes(term.toLowerCase())) ||
                (property.mls_number && property.mls_number.toString().includes(term)) ||
                (property.city && property.city.toLowerCase().includes(term.toLowerCase()))
            );
            setSuggestions(matches.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const handleSelect = (property) => {
        setSearchTerm('');   
        setSuggestions([]);  
        onSelectListing(property); 

        // Smooth animation to the selected pin
        map.flyTo([property.lat, property.lon], 16, {
            animate: true,
            duration: 1.5 
        });
    };

    return (
        // The UI for the pill-shaped search bar
        <div className="search-container">
            <div className="search-box">
                <span className="search-icon">🔍</span>
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Address, City, Zip, or MLS..." 
                    value={searchTerm}
                    onChange={handleInputChange}
                />
            </div>
            {/* Dropdown suggestions list */}
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

// ==========================================
// 5. MAIN COMPONENT: PROPERTY MAP
// ==========================================
const PropertyMap = () => {
  // STATE MANAGEMENT
  const [listings, setListings] = useState([]); // Holds all the pins
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null); // Which popup is open?
  const navigate = useNavigate();

  // ==========================================
  // 6. INITIAL DATA FETCH
  // ==========================================
  // ⚠️ PROBLEM AREA: This useEffect runs once on load.
  // It hits '/api/listings' with NO parameters.
  // This downloads ALL Active listings (~500+).
  // It does NOT have a way to ask for "Sold" or "Pending".
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
        <div className="map-header-container">
          <Header />
        </div>

      {/* THE MAP CONTAINER
         This holds everything: Tiles, Markers, and the SearchBar 
      */}
      <MapContainer 
        center={[45.7276, -121.4865]} 
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
        
        {/* ⚠️ ARCHITECTURAL CONFLICT: 
           You are using 'SearchBar' (defined above).
           This puts the search bar INSIDE the map.
           We want to DELETE this line and put <FilterBar /> ABOVE the map instead.
        */}
        <SearchBar 
            listings={listings} 
            onSelectListing={setSelectedListing} 
        />

        {/* RENDERING THE PINS
           This loops through your 'listings' state and draws a marker for each one.
        */}
        {listings
            .filter(property => property.lat && property.lon) // Safety check for bad data
            .map((property) => {
            const isSelected = selectedListing?.mls_number === property.mls_number;
            
            return (
              <Marker 
                key={property.mls_number} 
                position={[property.lat, property.lon]}
                // Creates the price icon
                icon={createPriceIcon(property.price, isSelected)}
                // Brings selected pin to front (z-index)
                zIndexOffset={isSelected ? 1000 : 0}
                eventHandlers={{
                    click: (e) => {
                        L.DomEvent.stopPropagation(e.originalEvent); // Stop click from hitting map background
                        setSelectedListing(property); // Open the popup
                    }
                }}
              />
            );
        })}
      </MapContainer>

      {/* THE POPUP CARD
         This sits 'absolute' positioned over the map.
         It only shows up if 'selectedListing' is not null.
      */}
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
                  {selectedListing.status || 'Active'}
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
                    onClick={() => {
                        const slug = createSlug(selectedListing.address, selectedListing.city, selectedListing.zipcode);
                        navigate(`/property/${slug}/${selectedListing.mls_number}`);
                    }}
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