import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './HomeDetails.css';

const HomeDetails = () => {
    const { mls_number } = useParams();
    const [listing, setListing] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [loading, setLoading] = useState(true);

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
                setListing(data);
                setMainImage(data.images?.[0]?.url || data.photo_url);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error:", err);
                setLoading(false);
            });
    }, [mls_number]);

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
            <nav className="details-nav">
                <div className="details-container">
                    <Link to="/map" className="back-link">← Back to Search Map</Link>
                </div>
            </nav>

            {/* --- MEDIA SECTION --- */}
            <div className="media-section">
                <div className="main-media-container">
                    
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
                                <h2>{listing.address}</h2>
                                <p>{listing.city}, OR</p>
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

                        {/* --- RESTORED COMPLIANCE FOOTER --- */}
                        <footer className="compliance-footer-inline">
                            <img src="/rmls_logo.jpg" alt="RMLS Logo" className="compliance-logo-small" /> 
                            <div className="compliance-text-block">
                                <p className="compliance-tiny">
                                    The content relating to real estate for sale on this web site comes in part from the 
                                    IDX program of the RMLS™ of Portland, Oregon. Real estate listings held by brokerage 
                                    firms other than Real Broker, LLC are marked with the RMLS™ logo, 
                                    and detailed information about these properties includes the names of the listing brokers.
                                </p>
                                <p className="compliance-tiny">
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
                                <p>Choose a time to see this home</p>
                            </div>
                            
                            <div className="contact-form">
                                <button className="primary-btn" onClick={() => window.location.href = "tel:+15415550123"}>
                                    Schedule Viewing
                                </button>
                                <button className="secondary-btn">Ask a Question</button>
                            </div>

                            <div className="agent-info">
                                <p className="small-text">Listing Courtesy of:</p>
                                <p className="broker-name">{listing.listing_brokerage}</p>
                                <p className="small-text">Source: RMLS™</p>
                            </div>
                        </div>
                    </aside>

                </div>
            </main>

            {/* Mobile Footer */}
            <div className="mobile-sticky-action">
                <div className="mobile-price">{priceFormatted}</div>
                <button className="mobile-contact-btn" onClick={() => window.location.href = "tel:+15415550123"}>
                    Contact Agent
                </button>
            </div>
        </div>
    );
};

export default HomeDetails;