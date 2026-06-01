import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PropertyDetails.css';

import AlertSubscribeButton from '../components/AlertSubscribeButton';

const MAX_THUMBS = 30;

// Custom Marker for the Map
const icon = L.divIcon({
    className: 'property-marker',
    html: `<div class="marker-pin"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

const API_BASE = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/listings` : '/api/listings';

// Helper to format PascalCase/camelCase strings into "Spaced Words"
const formatPascalCase = (str) => {
    if (!str) return '';
    // 1. Special case: "minisplit" (handle common source typo)
    let formatted = str.replace(/minisplit/gi, 'Mini Split');
    // 2. Insert spaces before capital letters (e.g., SharedWell -> Shared Well)
    // but not at the start of the string.
    formatted = formatted.replace(/([a-z])([A-Z])/g, '$1 $2');
    return formatted;
};

const PropertyDetails = () => {
    const { mls_number } = useParams();
    const navigate = useNavigate(); // Add navigate

    const handleBackClick = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/map'); // Fallback if opened directly from email/link
        }
    };

    const [listing, setListing] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // --- FETCH LOGIC ---
    useEffect(() => {
        setLoading(true);
        setError(null);

        fetch(`${API_BASE}/${mls_number}`)
            .then(res => {
                if (res.status === 404) throw new Error("not_found");
                if (!res.ok) throw new Error("server_error");
                return res.json();
            })
            .then(data => {
                if (data.images) {
                    data.images = data.images.filter(img => !img.is_private);
                }
                setListing(data);
                setMainImage(data.images?.[0]?.url || data.photo_url);
                setLoading(false);

                // --- DYNAMIC SEO UPDATES ---
                const address = data.is_address_exposed ? data.address : `MLS# ${data.mls_number}`;
                const price = data.price?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
                const beds = data.beds || 0;
                const baths = data.baths || 0;
                const city = data.city || '';
                const state = data.state || '';

                // Update Page Title
                const fullAddress = `${address}, ${city}, ${state}`;
                document.title = `${fullAddress} | ${price} | Gorge Realty`;

                // Update Meta Description
                let metaDescription = document.querySelector('meta[name="description"]');
                if (!metaDescription) {
                    metaDescription = document.createElement('meta');
                    metaDescription.name = "description";
                    document.head.appendChild(metaDescription);
                }
                metaDescription.setAttribute("content", `View details for ${address} in ${city}, ${state}. ${beds} beds, ${baths} baths, priced at ${price}. Expert real estate service by Nate Loker.`);

                // --- 1. JSON-LD SCHEMA (SEO) ---
                let scriptTag = document.getElementById('property-schema');
                if (!scriptTag) {
                    scriptTag = document.createElement('script');
                    scriptTag.id = 'property-schema';
                    scriptTag.type = 'application/ld+json';
                    document.head.appendChild(scriptTag);
                }

                const schemaData = {
                    "@context": "https://schema.org",
                    "@type": "RealEstateListing",
                    "name": `${fullAddress} - MLS# ${data.mls_number}`,
                    "description": `Beautiful ${data.property_type} in ${city}, ${state}. ${beds} bedrooms, ${baths} bathrooms, ${data.sqft} sqft.`,
                    "url": window.location.href,
                    "image": data.images?.[0]?.url || data.photo_url,
                    "datePosted": data.last_updated,
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": data.address,
                        "addressLocality": city,
                        "addressRegion": state,
                        "addressCountry": "US"
                    },
                    "offers": {
                        "@type": "Offer",
                        "price": data.price,
                        "priceCurrency": "USD",
                        "availability": "https://schema.org/InStock"
                    }
                };
                scriptTag.text = JSON.stringify(schemaData);

                // --- 2. CANONICAL TAG (SEO) ---
                let canonicalTag = document.querySelector('link[rel="canonical"]');
                if (!canonicalTag) {
                    canonicalTag = document.createElement('link');
                    canonicalTag.rel = 'canonical';
                    document.head.appendChild(canonicalTag);
                }
                canonicalTag.setAttribute("href", window.location.href.split('?')[0]);

                // --- 3. OPEN GRAPH (SOCIAL) ---
                const setOgTag = (property, content) => {
                    let tag = document.querySelector(`meta[property="${property}"]`);
                    if (!tag) {
                        tag = document.createElement('meta');
                        tag.setAttribute("property", property);
                        document.head.appendChild(tag);
                    }
                    tag.setAttribute("content", content);
                };
                setOgTag("og:title", `${fullAddress} | ${price}`);
                setOgTag("og:description", `Check out this listing: ${beds} beds, ${baths} baths in ${city}. Presented by Nate Loker.`);
                setOgTag("og:image", data.images?.[0]?.url || data.photo_url);
                setOgTag("og:type", "website");
                setOgTag("og:url", window.location.href);
            })
            .catch(err => {
                console.error("Error:", err);
                setError(err.message === 'not_found' ? 'not_found' : 'error');
                setLoading(false);
            });
    }, [mls_number]);

    // --- BODY SCROLL LOCK ---
    useEffect(() => {
        if (isLightboxOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isLightboxOpen]);

    // --- GALLERY LOGIC (useCallback to avoid stale closures) ---
    const handleNext = useCallback((e) => {
        if (e) e.stopPropagation();
        if (!listing?.images?.length) return;
        setMainImage(prev => {
            const currentIndex = listing.images.findIndex(img => img.url === prev);
            const nextIndex = (currentIndex + 1) % listing.images.length;
            return listing.images[nextIndex].url;
        });
    }, [listing]);

    const handlePrev = useCallback((e) => {
        if (e) e.stopPropagation();
        if (!listing?.images?.length) return;
        setMainImage(prev => {
            const currentIndex = listing.images.findIndex(img => img.url === prev);
            const prevIndex = (currentIndex - 1 + listing.images.length) % listing.images.length;
            return listing.images[prevIndex].url;
        });
    }, [listing]);

    // --- KEYBOARD SUPPORT ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isLightboxOpen) return;
            if (e.key === 'Escape') setIsLightboxOpen(false);
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            // Reset metadata when leaving the page
            document.title = "Gorge Realty";
        };
    }, [isLightboxOpen, handleNext, handlePrev]);

    if (loading) return <div className="loading-state">Loading Property Details...</div>;
    if (error === 'not_found') return <div className="error-state">Property not found. <button className="back-link-btn" onClick={() => navigate('/map')}>Return to Map</button></div>;
    if (error || !listing) return <div className="error-state">Something went wrong loading this property. <button className="back-link-btn" onClick={() => navigate('/map')}>Return to Map</button></div>;

    const priceFormatted = listing.price?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    const handleShare = async () => {
        const shareData = {
            title: document.title,
            text: `Check out this listing on Gorge Realty: ${listing.address}`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <div className="details-page">
            {/* --- LIGHTBOX OVERLAY --- */}
            {isLightboxOpen && (
                <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
                    
                    {/* Close Button (Fixed to top right of screen) */}
                    <button className="lightbox-close-fixed" onClick={() => setIsLightboxOpen(false)}>
                        Close ×
                    </button>

                    {/* Scrollable Container */}
                    <div className="lightbox-scroll-container" onClick={(e) => e.stopPropagation()}>
                        {listing.images && listing.images.map((img, index) => (
                            <div key={index} className="lightbox-image-wrapper">
                                <img 
                                    src={img.url} 
                                    className="lightbox-feed-img" 
                                    alt={`Gallery ${index + 1}`} 
                                    loading="lazy" /* Good for performance! */
                                />
                                {/* Optional: Add a photo count overlay like "1 of 25" */}
                                <span className="image-counter-overlay">{index + 1} / {listing.images.length}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <nav className="details-nav">
                {/* Added 'details-nav-flex' class to handle the layout */}
                <div className="details-container details-nav-flex">
                    
                    <button className="back-link-btn" onClick={handleBackClick}>← Back to Map</button>
                    
                    {/* RIGHT SIDE: Branding Group */}
                    <div className="nav-branding">
                        <img src="/real-logo.png" alt="Real Broker Logo" className="nav-logo" />
                        <span className="brokerage-text">Real Broker, LLC</span>
                    </div>
                    
                </div>
            </nav>

            {/* --- MEDIA SECTION --- */}
            <div className="media-section">
                <div className="main-media-container">

                    <img 
                        src={mainImage || listing.photo_url} 
                        alt={`${listing.is_address_exposed ? listing.address : `MLS# ${listing.mls_number}`} - ${listing.city}, ${listing.state} Real Estate Listing`} 
                        className="main-hero-img clickable-hero" 
                        onClick={() => setIsLightboxOpen(true)}
                    />
                    
                    {/* Left Arrow */}
                    {listing.images?.length > 1 && (
                        <button className="gallery-arrow left" onClick={handlePrev}>&#10094;</button>
                    )}

                    {/* Right Arrow */}
                    {listing.images?.length > 1 && (
                        <button className="gallery-arrow right" onClick={handleNext}>&#10095;</button>
                    )}

                    {/* Image Counter Badge */}
                    {listing.images?.length > 1 && (
                        <span className="hero-image-count" onClick={() => setIsLightboxOpen(true)}>
                            📷 {listing.images.findIndex(img => img.url === mainImage) + 1} / {listing.images.length}
                        </span>
                    )}
                </div>
                
                {/* Thumbnails */}
                <div className="details-container">
                    {listing.images?.length > 1 && (
                        <div className="thumb-scroll-container">
                            <div className="thumb-bar">
                                {listing.images.map((img, i) => (
                                    i < MAX_THUMBS && (
                                    <div 
                                        key={i} 
                                        className={`thumb-item ${(mainImage === img.url) ? 'active' : ''}`}
                                        onClick={() => setMainImage(img.url)}
                                    >
                                        <img src={img.url} alt={`thumb ${i}`} />
                                    </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <main className="details-container details-content">
                <div className="zillow-layout-grid">
                    
                    {/* --- LEFT COLUMN (Scrollable) --- */}
                    <div className="left-column">
                        
                        {/* Header */}
                        <div className="listing-header">
                            <div className="price-status-row">
                                <h1 className="price-main">{priceFormatted}</h1>
                                <div className="header-actions">
                                    <div style={{ display: 'inline-block', marginRight: '8px' }}>
                                        <AlertSubscribeButton 
                                            alertType="property" 
                                            targetId={mls_number} 
                                            buttonText="🔔 Watch" 
                                        />
                                    </div>
                                    <button className="share-btn" onClick={handleShare} aria-label="Share property">
                                        <span className="share-icon">📤</span> Share
                                    </button>
                                    <span className={`status-badge ${(listing.status || listing.internal_status)?.toLowerCase()}`}>
                                        {listing.status || listing.internal_status || 'Active'}
                                    </span>
                                </div>
                            </div>
                        <div className="header-address">
                            <h2>
                                {listing.is_address_exposed 
                                    ? listing.address 
                                    : 'Undisclosed Address'}
                            </h2>
                        </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="stats-bar">
                             <div className="stat-item"><strong>{listing.beds}</strong> bds</div>
                             <div className="stat-divider">|</div>
                             <div className="stat-item"><strong>{listing.baths}</strong> ba</div>
                             <div className="stat-divider">|</div>
                             <div className="stat-item"><strong>{listing.sqft?.toLocaleString()}</strong> sqft</div>
                        </div>

                        <div className="divider"></div>

                        {/* Description */}
                        <div className="section-block">
                            <h3>Overview</h3>
                            <p className="remarks-text">{listing.public_remarks}</p>
                        </div>

                        <div className="divider"></div>

                        {/* Facts Grid */}
                        <div className="section-block">
                            <h3>Facts & Features</h3>
                            <div className="facts-grid">
                                <div className="fact-row"><span>Type:</span> <strong>{formatPascalCase(listing.property_type)}</strong></div>
                                <div className="fact-row"><span>Year Built:</span> <strong>{listing.year_built}</strong></div>
                                <div className="fact-row"><span>Lot Size:</span> <strong>{listing.acreage || 'N/A'} Acres</strong></div>
                                <div className="fact-row"><span>MLS #:</span> <strong>{listing.mls_number}</strong></div>
                            </div>
                        </div>

                        <div className="divider"></div>

                        {/* Utilities & Systems */}
                        <div className="section-block">
                            <h3>Utilities & Systems</h3>
                            <div className="facts-grid">
                                {listing.cooling && <div className="fact-row"><span>Cooling:</span> <strong>{formatPascalCase(listing.cooling)}</strong></div>}
                                {listing.heating && <div className="fact-row"><span>Heating:</span> <strong>{formatPascalCase(listing.heating)}</strong></div>}
                                {listing.fuel_description && <div className="fact-row"><span>Fuel:</span> <strong>{formatPascalCase(listing.fuel_description)}</strong></div>}
                                {listing.roof && <div className="fact-row"><span>Roof:</span> <strong>{formatPascalCase(listing.roof)}</strong></div>}
                                {listing.sewer && <div className="fact-row"><span>Sewer:</span> <strong>{formatPascalCase(listing.sewer)}</strong></div>}
                                {listing.water_source && <div className="fact-row"><span>Water:</span> <strong>{formatPascalCase(listing.water_source)}</strong></div>}
                                {listing.utilities && <div className="fact-row"><span>Utilities:</span> <strong>{formatPascalCase(listing.utilities)}</strong></div>}
                            </div>
                        </div>

                        <div className="divider"></div>

                        {/* Map Section for Mobile (only visible on mobile) */}
                        <div className="section-block mobile-only-map">
                            <h3>Location</h3>
                            <div className="mini-map-container">
                                {listing.lat && listing.lon ? (
                                    <MapContainer 
                                        center={[listing.lat, listing.lon]} 
                                        zoom={14} 
                                        scrollWheelZoom={false}
                                        className="detail-leaflet-container"
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={[listing.lat, listing.lon]} icon={icon} />
                                    </MapContainer>
                                ) : (
                                    <div className="map-placeholder">
                                        Map location unavailable for this property.
                                    </div>
                                )}
                            </div>
                            <div className="map-address-footer">
                                <p><strong>{listing.is_address_exposed ? listing.address : 'Undisclosed Address'}</strong></p>
                                <p>{listing.city}, {listing.state} {listing.zipcode}</p>
                            </div>
                            <div className="divider"></div>
                        </div>

                        <div className="listing-attribution">
                            <div className="agent-info">
                                <p className="small-text">Listed by: {listing.list_agent_name}: {listing.attribution_contact}, {listing.listing_brokerage} </p>
                            <div className="source-row">
                                <span className="small-text">Source: RMLS™</span>
                                <img src="/rmls_logo.jpg" alt="RMLS Logo" className="compliance-logo-source" /> 
                            </div>
                            </div>
                        </div>

                    </div>

                    {/* --- RIGHT COLUMN (Sticky Map) --- */}
                    <aside className="right-column">
                        <div className="map-section-sticky">
                            <h3>Property Location</h3>
                            <div className="mini-map-container">
                                {listing.lat && listing.lon ? (
                                    <MapContainer 
                                        center={[listing.lat, listing.lon]} 
                                        zoom={14} 
                                        scrollWheelZoom={false}
                                        className="detail-leaflet-container"
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={[listing.lat, listing.lon]} icon={icon} />
                                    </MapContainer>
                                ) : (
                                    <div className="map-placeholder">
                                        Map location unavailable for this property.
                                    </div>
                                )}
                            </div>
                            <div className="map-address-footer">
                                <p><strong>{listing.is_address_exposed ? listing.address : 'Undisclosed Address'}</strong></p>
                                <p>{listing.city}, {listing.state} {listing.zipcode}</p>
                            </div>
                        </div>
                    </aside>

                </div>

                {/* --- RESTORED COMPLIANCE FOOTER --- */}
                <footer className="compliance-footer-inline">
                    <img src="/rmls_logo.jpg" alt="RMLS Logo" className="compliance-logo-small" /> 
                    <div className="compliance-text-block">
                        <p className="compliance-tiny">
                            The content relating to real estate for sale on this web site comes in part from the 
                            IDX program of the RMLS™ of Portland, Oregon. Real estate listings held by brokerage 
                            firms other than Real Broker, LLC are marked with the RMLS™ logo, 
                            and detailed information about these properties includes the names of the listing brokers.
                            Listing content is copyright © 2026 RMLS™, Portland, Oregon. 
                            IDX content is updated approximately every two hours. Some properties which appear 
                            for sale on this web site may subsequently have sold or may no longer be available. 
                            All information provided is deemed reliable but is not guaranteed and should be 
                            independently verified.
                        </p>
                        <p className="compliance-tiny">
                            <strong>Last Updated:</strong> {listing.last_updated ? new Date(listing.last_updated).toLocaleString() : 'N/A'}
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default PropertyDetails;