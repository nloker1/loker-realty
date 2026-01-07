import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './HomeDetails.css';

const HomeDetails = () => {
    const { mls_number } = useParams(); // Matches the :mls_number in App.js
    const [listing, setListing] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Detect environment
        const isLocal = window.location.hostname === 'localhost';
        
        // 2. Set the base URL
        const apiBase = isLocal 
            ? 'http://localhost:8000/api/listings' 
            : '/api/listings';

        setLoading(true);

        // 3. Fetch using the dynamic base + the MLS number
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

    if (loading) return <div className="loading-state">Loading Property Details...</div>;
    if (!listing) return <div className="error-state">Property not found. <Link to="/map">Return to Map</Link></div>;

    return (
        <div className="details-page">
            <nav className="details-nav">
                <div className="details-container">
                    <Link to="/map" className="back-link">← Back to Search Map</Link>
                </div>
            </nav>

            <main className="details-container details-content">
                <div className="details-header">
                    <div className="header-info">
                        <h1>{listing.address}</h1>
                        <p className="sub-address">{listing.city}, OR</p>
                    </div>
                    <div className="header-pricing">
                        <p className="price-text">${listing.price?.toLocaleString()}</p>
                        <p className="mls-label">MLS ID: #{listing.mls_number}</p>
                    </div>
                </div>

                <div className="details-layout-grid">
                    <div className="main-column">
                        {/* Hero Image Section */}
                        <div className="hero-viewport">
                            <img src={mainImage} alt="Property" />
                        </div>

                        {/* Thumbnail Bar */}
                        {listing.images?.length > 0 && (
                            <div className="thumb-bar">
                                {listing.images.slice(0, 5).map((img, i) => (
                                    <div 
                                        key={i} 
                                        className={`thumb-item ${mainImage === img.url ? 'active' : ''}`}
                                        onClick={() => setMainImage(img.url)}
                                    >
                                        <img src={img.url} alt={`View ${i}`} />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="info-card stats-row">
                            <div className="stat"><strong>{listing.beds || '—'}</strong><span>Beds</span></div>
                            <div className="stat"><strong>{listing.baths || '—'}</strong><span>Baths</span></div>
                            <div className="stat"><strong>{listing.sqft?.toLocaleString() || '—'}</strong><span>Sq Ft</span></div>
                            <div className="stat"><strong>{listing.year_built || '—'}</strong><span>Year Built</span></div>
                        </div>

                        <div className="info-card">
                            <h2>Description</h2>
                            <p className="remarks-text">{listing.public_remarks}</p>
                        </div>
                    </div>

                    <aside className="side-column">
                        <div className="contact-card">
                            <h3>Interested?</h3>
                            <p>Contact us to schedule a tour or get more info.</p>
                            <button className="primary-btn">Contact Agent</button>
                            <div className="broker-line">
                                Listing Courtesy of:<br />
                                <strong>{listing.listing_brokerage}</strong>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
            <footer className="compliance-footer">
    <div className="compliance-content">
        <img src="/rmls_logo.jpg" alt="RMLS Logo" className="compliance-logo" />
        <div className="compliance-text">
            <p>
                The content relating to real estate for sale on this web site comes in part from the 
                IDX program of the RMLS™ of Portland, Oregon. Real estate listings held by brokerage 
                firms other than Real Broker, LLC are marked with the RMLS™ logo, 
                and detailed information about these properties includes the names of the listing brokers.
            </p>
            <p>
                Listing content is copyright © 2026 RMLS™, Portland, Oregon. 
                IDX content is updated approximately every two hours. Some properties which appear 
                for sale on this web site may subsequently have sold or may no longer be available. 
                All information provided is deemed reliable but is not guaranteed and should be 
                independently verified.
            </p>
            <p className="last-updated">
                <strong>Last Updated:</strong> {new Date(listing.last_updated).toLocaleString()}
            </p>
        </div>
    </div>
</footer>
        </div>

    );
};

export default HomeDetails;