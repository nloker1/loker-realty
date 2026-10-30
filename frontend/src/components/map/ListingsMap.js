import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { createSlug } from '../../utils/slugify';
import 'leaflet/dist/leaflet.css';
import './ListingsMap.css';

// Fix for default Leaflet icon paths in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ListingsMap = ({ listings }) => {
  const navigate = useNavigate();
  
  // Calculate center of map based on listings, or default to Hood River
  const center = listings.length > 0 && listings[0].lat && listings[0].lon
    ? [listings[0].lat, listings[0].lon]
    : [45.7276, -121.4865];

  return (
    <div className="listings-map-container">
      <MapContainer center={center} zoom={10} scrollWheelZoom={false} className="listings-leaflet-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {listings.filter(listing => listing.lat && listing.lon).map(listing => (
          <Marker key={listing.mls_number} position={[listing.lat, listing.lon]}>
            <Popup>
              <div 
                className="map-popup-card"
                onClick={() => {
                  const slug = createSlug(listing.address, listing.city, listing.zipcode);
                  navigate(`/property/${slug}/${listing.mls_number}`);
                }}
                style={{ cursor: 'pointer' }}
              >
                <img src={listing.photo_url} alt={listing.address} style={{ width: '100%', borderRadius: '4px' }} />
                <h4 style={{ margin: '8px 0 4px' }}>${listing.price?.toLocaleString()}</h4>
                <p style={{ margin: 0, fontSize: '12px' }}>{listing.address}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{listing.city}, {listing.zipcode}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ListingsMap;
