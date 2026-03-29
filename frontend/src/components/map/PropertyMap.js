// ==========================================
// 1. IMPORTS
// ==========================================
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PropertyMap.css';

import FilterBar from './FilterBar';
import Header from '../../components/layout/Header';
import { createSlug } from '../../utils/slugify';


// ==========================================
// 2. HELPER: MAP EVENTS
// ==========================================
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
// 4. HELPER: BUILD API URL WITH FILTERS
// ==========================================
const buildApiUrl = (baseUrl, filters = {}) => {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    
    // Handle multiple cities
    if (filters.cities && Array.isArray(filters.cities)) {
        filters.cities.forEach(city => params.append('cities', city));
    }

    if (filters.propertyType) params.append('property_type', filters.propertyType);
    if (filters.minBeds) params.append('min_beds', filters.minBeds);
    if (filters.minBaths) params.append('min_baths', filters.minBaths);
    if (filters.minPrice) params.append('min_price', filters.minPrice);
    if (filters.maxPrice) params.append('max_price', filters.maxPrice);
    if (filters.minSqft) params.append('min_sqft', filters.minSqft);
    if (filters.maxSqft) params.append('max_sqft', filters.maxSqft);
    if (filters.minAcres) params.append('min_acres', filters.minAcres);
    if (filters.maxAcres) params.append('max_acres', filters.maxAcres);

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

// ==========================================
// 5. MAIN COMPONENT: PROPERTY MAP
// ==========================================
const PropertyMap = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Convert searchParams back to a filters object for convenience
  const currentFilters = useMemo(() => {
      const filters = { status: searchParams.get('status') || 'Active' };
      if (searchParams.get('search')) filters.search = searchParams.get('search');
      if (searchParams.getAll('cities').length > 0) filters.cities = searchParams.getAll('cities');
      if (searchParams.get('property_type')) filters.propertyType = searchParams.get('property_type');
      if (searchParams.get('min_beds')) filters.minBeds = searchParams.get('min_beds');
      if (searchParams.get('min_baths')) filters.minBaths = searchParams.get('min_baths');
      if (searchParams.get('min_price')) filters.minPrice = searchParams.get('min_price');
      if (searchParams.get('max_price')) filters.maxPrice = searchParams.get('max_price');
      if (searchParams.get('min_sqft')) filters.minSqft = searchParams.get('min_sqft');
      if (searchParams.get('max_sqft')) filters.maxSqft = searchParams.get('max_sqft');
      if (searchParams.get('min_acres')) filters.minAcres = searchParams.get('min_acres');
      if (searchParams.get('max_acres')) filters.maxAcres = searchParams.get('max_acres');
      return filters;
  }, [searchParams]);

  const isLocal = window.location.hostname === 'localhost';
  const apiBase = isLocal ? 'http://localhost:8000/api/listings' : '/api/listings';

  // ==========================================
  // 6. FETCH LISTINGS (reusable)
  // ==========================================
  const fetchListings = useCallback((filters = { status: 'Active' }) => {
    setLoading(true);
    setSelectedListing(null);

    const url = buildApiUrl(apiBase, filters);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching listings:', err);
        setListings([]);
        setLoading(false);
      });
  }, [apiBase]);

  // Initial load AND whenever URL search params change
  useEffect(() => {
    fetchListings(currentFilters);
  }, [fetchListings, currentFilters]);

  // ==========================================
  // 7. FILTER HANDLER
  // ==========================================
  const handleSearch = (filters) => {
      // Sync UI filters back to URL
      const newParams = new URLSearchParams();
      if (filters.status) newParams.set('status', filters.status);
      if (filters.search) newParams.set('search', filters.search);
      if (filters.cities && Array.isArray(filters.cities)) {
          filters.cities.forEach(city => newParams.append('cities', city));
      }
      if (filters.propertyType) newParams.set('property_type', filters.propertyType);
      if (filters.minBeds) newParams.set('min_beds', filters.minBeds);
      if (filters.minBaths) newParams.set('min_baths', filters.minBaths);
      if (filters.minPrice) newParams.set('min_price', filters.minPrice);
      if (filters.maxPrice) newParams.set('max_price', filters.maxPrice);
      if (filters.minSqft) newParams.set('min_sqft', filters.minSqft);
      if (filters.maxSqft) newParams.set('max_sqft', filters.maxSqft);
      if (filters.minAcres) newParams.set('min_acres', filters.minAcres);
      if (filters.maxAcres) newParams.set('max_acres', filters.maxAcres);
      
      setSearchParams(newParams);
      // fetchListings(filters); // No need to fetch manually, useEffect above will trigger on searchParams change
  };

  return (
    <div className="map-wrapper">
      <div className="map-header-container">
        <Header />
      </div>

      {/* FILTER BAR — above the map */}
      <FilterBar
        onSearch={handleSearch}
        resultCount={loading ? undefined : listings.length}
        loading={loading}
        initialFilters={currentFilters}
      />

      {/* THE MAP */}
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

        {listings
          .filter(property => property.lat && property.lon)
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

      {/* POPUP CARD */}
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
