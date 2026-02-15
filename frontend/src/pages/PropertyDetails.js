import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PropertyDetails.css';

const PropertyDetails = () => {
    const { mls_number } = useParams();
    const [listing, setListing] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [loading, setLoading] = useState(true);

    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // --- FETCH LOGIC ---
    useEffect(() => {
        const isLocal = window.location.hostname === 'localhost';
        const apiBase = isLocal ? 'http://localhost:8000/api/listings' : '/api/listings';

        setLoading(true);

        fetch(`${apiBase}/${mls_number}`)
            .then(res => {
                if (!res.ok) throw new Error("Listing not found");
                return res.json();
            })
            .then(data => {
                // 1. FILTER: Remove images where is_private is true
                if (data.images) {
                    data.images = data.images.filter(img => !img.is_private);
                }
                setListing(data);
                // 2. Set Main Image (safely using the filtered list)
                setMainImage(data.images?.[0]?.url || data.photo_url);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error:", err);
                setLoading(false);
            });
    }, [mls_number]);

    // --- KEYBOARD SUPPORT (Escape to Close, Arrows to Navigate) ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isLightboxOpen) return;
            
            if (e.key === 'Escape') setIsLightboxOpen(false);
            if (e.key === 'ArrowRight') handleNext(e);
            if (e.key === 'ArrowLeft') handlePrev(e);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, listing, mainImage]); // Dependencies ensure state is fresh

    // --- GALLERY LOGIC ---
    const handleNext = (e) => {
        e.stopPropagation();
        if (!listing.images || listing.images.length === 0) return;
        const currentIndex = listing.images.findIndex(img => img.url === mainImage);
        const nextIndex = (currentIndex + 1) % listing.images.length;
        setMainImage(listing.images[nextIndex].url);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        if (!listing.images || listing.images.length === 0) return;
        const currentIndex = listing.images.findIndex(img => img.url === mainImage);
        const prevIndex = (currentIndex - 1 + listing.images.length) % listing.images.length;
        setMainImage(listing.images[prevIndex].url);
    };

    if (loading) return <div className="loading-state">Loading Property Details...</div>;
    if (!listing) return <div className="error-state">Property not found. <Link to="/map">Return to Map</Link></div>;

    const priceFormatted = listing.price?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

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
                    
                    <Link to="/map" className="back-link">← Back to Map</Link>
                    
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

                    {/* Add onClick here to trigger lightbox */}
                    <img 
                        src={mainImage || listing.photo_url} 
                        alt="Property Main" 
                        className="main-hero-img" 
                        onClick={() => setIsLightboxOpen(true)} // <--- TRIGGER
                        style={{ cursor: 'zoom-in' }} // UX Hint
                    />
                    
                    {/* Left Arrow */}
                    {listing.images?.length > 1 && (
                        <button className="gallery-arrow left" onClick={handlePrev}>&#10094;</button>
                    )}

                    <img src={mainImage || listing.photo_url} alt="Property Main" className="main-hero-img" />

                    {/* Right Arrow */}
                    {listing.images?.length > 1 && (
                        <button className="gallery-arrow right" onClick={handleNext}>&#10095;</button>
                    )}
                </div>
                
                {/* Thumbnails */}
                <div className="details-container">
                    {listing.images?.length > 1 && (
                        <div className="thumb-scroll-container">
                            <div className="thumb-bar">
                                {listing.images.map((img, i) => (
                                    i < 30 && (
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
                                <span className={`status-badge ${listing.internal_status?.toLowerCase()}`}>
                                    {listing.internal_status || 'Active'}
                                </span>
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
                                <div className="fact-row"><span>Type:</span> <strong>{listing.property_type}</strong></div>
                                <div className="fact-row"><span>Year Built:</span> <strong>{listing.year_built}</strong></div>
                                <div className="fact-row"><span>Lot Size:</span> <strong>{listing.acreage || 'N/A'} Acres</strong></div>
                                <div className="fact-row"><span>MLS #:</span> <strong>{listing.mls_number}</strong></div>
                            </div>
                        </div>

                        <div className="divider"></div>

                        <div className="listing-attribution">
                            <div className="agent-info">
                                <p className="small-text">Listed by: {listing.list_agent_name}: {listing.attribution_contact}, {listing.listing_brokerage} </p>
                            <div className="source-row">
                                <span className="small-text">Source: RMLS™</span>
                                <img src="/rmls_logo.jpg" alt="RMLS Logo" className="compliance-logo-source" /> 
                            </div>
                            </div>
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

                    </div>

                    {/* --- RIGHT COLUMN (Sticky) --- */}
                    <aside className="right-column">
                        <div className="sticky-contact-card">
                            <div className="card-header">
                                <h3>Request a Tour</h3>
                            </div>
                            
                            <div className="contact-form">
                                <a href="tel:+15413997756" className="primary-btn contact-link">
                                    📞 Call to Schedule
                                </a>
                                <a 
                                    href={`sms:+15413997756?body=${encodeURIComponent(`Hi Nate, I'm interested in scheduling a showing for the property at ${listing.is_address_exposed ? listing.address : `MLS# ${listing.mls_number}`}. When are you available?`)}`} 
                                    className="secondary-btn contact-link"
                                >
                                    💬 Text to Schedule
                                </a>
                                <p className="contact-phone-display">(541) 399-7756</p>
                            </div>

 
                        </div>
                    </aside>

                </div>
            </main>
        </div>
    );
};

export default PropertyDetails;