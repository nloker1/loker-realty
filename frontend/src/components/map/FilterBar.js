import React, { useState, useCallback, useEffect } from 'react';
import './FilterBar.css';

const FilterBar = ({ onSearch, resultCount, loading, initialFilters = {} }) => {
    const [search, setSearch] = useState(initialFilters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activePriceInput, setActivePriceInput] = useState(null);
    const [activeSqftInput, setActiveSqftInput] = useState(null);
    const [selectedCities, setSelectedCities] = useState(initialFilters.cities || []);
    const [propertyType, setPropertyType] = useState(initialFilters.propertyType || '');
    const [minBeds, setMinBeds] = useState(initialFilters.minBeds || '');
    const [minBaths, setMinBaths] = useState(initialFilters.minBaths || '');
    const [priceRange, setPriceRange] = useState(
        (initialFilters.minPrice || initialFilters.maxPrice) 
        ? `${initialFilters.minPrice || ''}-${initialFilters.maxPrice || ''}` 
        : ''
    );
    const [sqftRange, setSqftRange] = useState(
        (initialFilters.minSqft || initialFilters.maxSqft) 
        ? `${initialFilters.minSqft || ''}-${initialFilters.maxSqft || ''}` 
        : ''
    );
    const [acresRange, setAcresRange] = useState(
        (initialFilters.minAcres || initialFilters.maxAcres) 
        ? `${initialFilters.minAcres || ''}-${initialFilters.maxAcres || ''}` 
        : ''
    );

    // Update local state if initialFilters changes (e.g. from Browser Back button)
    useEffect(() => {
        setSearch(initialFilters.search || '');
        setSelectedCities(initialFilters.cities || []);
        setPropertyType(initialFilters.propertyType || '');
        setMinBeds(initialFilters.minBeds || '');
        setMinBaths(initialFilters.minBaths || '');
        setPriceRange(
            (initialFilters.minPrice || initialFilters.maxPrice) 
            ? `${initialFilters.minPrice || ''}-${initialFilters.maxPrice || ''}` 
            : ''
        );
        setSqftRange(
            (initialFilters.minSqft || initialFilters.maxSqft) 
            ? `${initialFilters.minSqft || ''}-${initialFilters.maxSqft || ''}` 
            : ''
        );
        setAcresRange(
            (initialFilters.minAcres || initialFilters.maxAcres) 
            ? `${initialFilters.minAcres || ''}-${initialFilters.maxAcres || ''}` 
            : ''
        );
    }, [initialFilters]);
    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

    const parseRange = (val) => {
        if (!val) return {};
        const [min, max] = val.split('-');
        const result = {};
        if (min) result.min = min;
        if (max) result.max = max;
        return result;
    };


    const handlePriceSelect = (value) => {
        const currentMin = priceRange.split('-')[0] || '';
        const currentMax = priceRange.split('-')[1] || '';
        
        let newRange;
        if (activePriceInput === 'min') {
            newRange = `${value}-${currentMax}`;
        } else {
            newRange = `${currentMin}-${value}`;
        }
        
        setPriceRange(newRange === '-' ? '' : newRange);
        setActivePriceInput(null); // Close the dropdown after they pick a number
    };

    const handleSqftSelect = (value) => {
        const currentMin = sqftRange.split('-')[0] || '';
        const currentMax = sqftRange.split('-')[1] || '';
        
        let newRange;
        if (activeSqftInput === 'min') {
            newRange = `${value}-${currentMax}`;
        } else {
            newRange = `${currentMin}-${value}`;
        }
        
        setSqftRange(newRange === '-' ? '' : newRange);
        setActiveSqftInput(null); // Close the dropdown
    };

    // Generates common square footage increments
    const sqftIncrements = [
        500, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000, 3500, 4000, 5000
    ];

    const buildFilters = useCallback((overrides = {}) => {
        const merged = {
            search, selectedCities, propertyType, minBeds, minBaths, priceRange, sqftRange, acresRange,
            ...overrides
        };
        const price = parseRange(merged.priceRange);
        const sqft = parseRange(merged.sqftRange);
        const acres = parseRange(merged.acresRange);

        return {
            status: 'Active',
            search: (merged.search || '').trim() || undefined,
            cities: merged.selectedCities && merged.selectedCities.length > 0 ? merged.selectedCities : undefined,
            propertyType: merged.propertyType || undefined,
            minBeds: merged.minBeds || undefined,
            minBaths: merged.minBaths || undefined,
            minPrice: price.min || undefined,
            maxPrice: price.max || undefined,
            minSqft: sqft.min || undefined,
            maxSqft: sqft.max || undefined,
            minAcres: acres.min || undefined,
            maxAcres: acres.max || undefined,
        };
    }, [search, selectedCities, propertyType, minBeds, minBaths, priceRange, sqftRange, acresRange]);

    // Auto-apply: every dropdown change triggers a fetch
    const handleFilterChange = (setter, key) => (e) => {
        const val = e.target.value;
        setter(val);
        onSearch(buildFilters({ [key]: val }));
    };

    const handleCityChange = (e) => {
        const city = e.target.value;
        if (!city) return;

        let newCities;
        if (selectedCities.includes(city)) {
            newCities = selectedCities.filter(c => c !== city);
        } else {
            newCities = [...selectedCities, city];
        }
        
        setSelectedCities(newCities);
        onSearch(buildFilters({ selectedCities: newCities }));
        
        // Reset the select value so the same city can be toggled again
        // e.target.value = "";
    };

    // Text search submits on Enter
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSearch(buildFilters());
        }
    };

    const handleSaveSearch = async () => {
        if (!email || !email.includes('@')) {
            setSaveMessage({ type: 'error', text: 'Please enter a valid email address.' });
            return;
        }

        setIsSaving(true);
        setSaveMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/saved-searches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    criteria: buildFilters()
                }),
            });

            if (response.ok) {
                setSaveMessage({ type: 'success', text: 'Success! You will be notified of new matches.' });
                // Optional: Close modal after 2 seconds
                setTimeout(() => setIsModalOpen(false), 2000);
            } else {
                setSaveMessage({ type: 'error', text: 'Failed to save search. Please try again.' });
            }
        } catch (error) {
            setSaveMessage({ type: 'error', text: 'Network error. Please check your connection.' });
        } finally {
            setIsSaving(false);
        }
    };

    // Count active filters for the badge
    const activeCount = [propertyType, minBeds, minBaths, priceRange, sqftRange, acresRange, search, ...selectedCities]
        .filter(Boolean).length;

    return (
        <div className="filter-bar">
            {/* Search row (Desktop only) */}
            <div className="filter-search-row">
                <div className="filter-search-box">
                    <svg className="filter-search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search address, MLS..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="filter-search-input"
                    />
                    {search && (
                        <button
                            type="button"
                            className="filter-search-clear"
                            onClick={() => {
                                setSearch('');
                                onSearch(buildFilters({ search: '' }));
                            }}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>

            </div>

            {/* Scrollable pill row */}
            <div className="filter-pill-row">
                <div className="filter-pill-scroll">

                    <button 
                        className="filter-pill" 
                        style={{ background: '#1a5091', color: 'white', border: 'none' }} /* Force it to look good temporarily */
                        onClick={() => setIsModalOpen(true)}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        <span className="filter-pill-label" style={{marginLeft: '6px', color: 'white'}}>Filters</span>
                    </button>

                    <button 
                        className="filter-pill" 
                        style={{ background: '#fff', color: '#1a5091', border: '1px solid #1a5091', fontWeight: '600' }} 
                        onClick={() => {
                            setIsModalOpen(true);
                            setSaveMessage({ type: '', text: '' }); // Clear any old messages
                        }}
                    >
                        <span className="filter-pill-label">Create Alert 🔔</span>
                    </button>

                   {/* --- THE "FILTERS" MODAL --- */}
                    {isModalOpen && (
                        <div className="filter-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    
                            {/* Stop background clicks from closing it */}
                            <div className="filter-modal-content" onClick={(e) => e.stopPropagation()}>
                                
                                {/* Header */}
                                <div className="filter-modal-header">
                                    <h3>Filters</h3>
                                    <button className="filter-modal-close" onClick={() => setIsModalOpen(false)}>×</button>
                                </div>

                                {/* Body - Where the dropdowns live */}
                                <div className="filter-modal-body">
                                    
                                    <div className="filter-section">
                                        <h4>Cities</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {[
                                                'Hood River', 'White Salmon', 'The Dalles', 'Bingen', 'Lyle', 
                                                'Odell', 'Mt Hood Prkdl', 'Mosier', 'Cascade Locks', 'Stevenson', 
                                                'Trout Lake', 'BZ Corner', 'Dallesport', 'Underwood'
                                            ].map(city => (
                                                <button
                                                    key={city}
                                                    type="button"
                                                    onClick={() => handleCityChange({ target: { value: city } })}
                                                    style={{
                                                        padding: '8px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '14px',
                                                        border: '1px solid #d1d5db',
                                                        background: selectedCities.includes(city) ? '#1a5091' : '#fff',
                                                        color: selectedCities.includes(city) ? '#fff' : '#374151',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {city === 'Mt Hood Prkdl' ? 'Parkdale' : city}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="filter-section">
                                        <h4>Property Type</h4>
                                        <select 
                                            className="modal-select"
                                            value={propertyType} 
                                            onChange={handleFilterChange(setPropertyType, 'propertyType')}
                                            style={{ width: '100%', height: '44px', padding: '0 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                                        >
                                            <option value="">Any Type</option>
                                            <option value="Residential">Residential</option>
                                            <option value="Land">Land</option>
                                            <option value="Multi-Family">Multi-Family</option>
                                            <option value="Manufactured">Manufactured</option>
                                            <option value="Commercial">Commercial</option>
                                        </select>
                                    </div>

                                {/* --- CUSTOM REACT PRICE DROPDOWN --- */}
                                    <div className="filter-section">
                                        <h4>Price Range</h4>
                                        {/* Wrapper with position: relative so the dropdown anchors here */}
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                
                                                {/* MINIMUM INPUT */}
                                                <div style={{ flex: 1, position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280' }}>$</span>
                                                    <input 
                                                        type="number" 
                                                        placeholder="Min"
                                                        value={priceRange.split('-')[0] || ''}
                                                        style={{ width: '100%', height: '44px', padding: '0 12px 0 24px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
                                                        onFocus={() => setActivePriceInput('min')}
                                                        onBlur={() => setActivePriceInput(null)}
                                                        onChange={(e) => {
                                                            const currentMax = priceRange.split('-')[1] || '';
                                                            const newRange = `${e.target.value}-${currentMax}`;
                                                            setPriceRange(newRange === '-' ? '' : newRange);
                                                        }}
                                                    />
                                                </div>

                                                <span style={{ color: '#9ca3af' }}>-</span>

                                                {/* MAXIMUM INPUT */}
                                                <div style={{ flex: 1, position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280' }}>$</span>
                                                    <input 
                                                        type="number" 
                                                        placeholder="Max"
                                                        value={priceRange.split('-')[1] || ''}
                                                        style={{ width: '100%', height: '44px', padding: '0 12px 0 24px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
                                                        onFocus={() => setActivePriceInput('max')}
                                                        onBlur={() => setActivePriceInput(null)}
                                                        onChange={(e) => {
                                                            const currentMin = priceRange.split('-')[0] || '';
                                                            const newRange = `${currentMin}-${e.target.value}`;
                                                            setPriceRange(newRange === '-' ? '' : newRange);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* --- THE CUSTOM DROPDOWN MENU --- */}
                                            {activePriceInput && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '52px', // Drops it right below the inputs
                                                    // Align left if Min is clicked, align right if Max is clicked
                                                    left: activePriceInput === 'min' ? '0' : 'auto',
                                                    right: activePriceInput === 'max' ? '0' : 'auto',
                                                    width: 'calc(50% - 4px)', // Take up exactly half the width
                                                    maxHeight: '220px',
                                                    overflowY: 'auto',
                                                    background: '#fff',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                    zIndex: 1000,
                                                }}>
                                                    {/* Generating 50k increments */}
                                                    {[
                                                        50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000,
                                                        550000, 600000, 650000, 700000, 750000, 800000, 850000, 900000, 950000, 1000000,
                                                        1250000, 1500000, 2000000, 3000000, 4000000, 5000000
                                                    ].map(price => (
                                                        <button
                                                            key={price}
                                                            type="button"
                                                            // onMouseDown fires before the input's onBlur event, making sure the click registers
                                                            onMouseDown={() => handlePriceSelect(price)}
                                                            style={{
                                                                display: 'block',
                                                                width: '100%',
                                                                padding: '12px 16px',
                                                                textAlign: 'left',
                                                                background: 'none',
                                                                border: 'none',
                                                                borderBottom: '1px solid #f3f4f6',
                                                                fontSize: '14px',
                                                                color: '#374151',
                                                                cursor: 'pointer'
                                                            }}
                                                            onMouseOver={(e) => e.target.style.background = '#f9fafb'}
                                                            onMouseOut={(e) => e.target.style.background = 'none'}
                                                        >
                                                            ${price.toLocaleString()}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* --- END PRICE FILTER --- */}

                                    <div className="filter-section">
                                        <h4>Bedrooms</h4>
                                        <select 
                                            className="modal-select"
                                            value={minBeds} 
                                            onChange={handleFilterChange(setMinBeds, 'minBeds')}
                                        >
                                            <option value="">Any Beds</option>
                                            <option value="1">1+ Beds</option>
                                            <option value="2">2+ Beds</option>
                                            <option value="3">3+ Beds</option>
                                            <option value="4">4+ Beds</option>
                                            <option value="5">5+ Beds</option>
                                        </select>
                                    </div>

                                    <div className="filter-section">
                                        <h4>Bathrooms</h4>
                                        <select 
                                            className="modal-select"
                                            value={minBaths} 
                                            onChange={handleFilterChange(setMinBaths, 'minBaths')}
                                        >
                                            <option value="">Any Baths</option>
                                            <option value="1">1+ Baths</option>
                                            <option value="2">2+ Baths</option>
                                            <option value="3">3+ Baths</option>
                                            <option value="4">4+ Baths</option>
                                        </select>
                                    </div>

                                    {/* --- CUSTOM REACT SQFT DROPDOWN --- */}
                                    <div className="filter-section">
                                        <h4>Building Square Feet</h4>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                
                                                {/* MINIMUM INPUT */}
                                                <div style={{ flex: 1, position: 'relative' }}>
                                                    <input 
                                                        type="number" 
                                                        placeholder="Min"
                                                        value={sqftRange.split('-')[0] || ''}
                                                        /* Padding left changed to 12px since there is no dollar sign */
                                                        style={{ width: '100%', height: '44px', padding: '0 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
                                                        onFocus={() => setActiveSqftInput('min')}
                                                        onBlur={() => setActiveSqftInput(null)}
                                                        onChange={(e) => {
                                                            const currentMax = sqftRange.split('-')[1] || '';
                                                            const newRange = `${e.target.value}-${currentMax}`;
                                                            setSqftRange(newRange === '-' ? '' : newRange);
                                                        }}
                                                    />
                                                </div>

                                                <span style={{ color: '#9ca3af' }}>-</span>

                                                {/* MAXIMUM INPUT */}
                                                <div style={{ flex: 1, position: 'relative' }}>
                                                    <input 
                                                        type="number" 
                                                        placeholder="Max"
                                                        value={sqftRange.split('-')[1] || ''}
                                                        style={{ width: '100%', height: '44px', padding: '0 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
                                                        onFocus={() => setActiveSqftInput('max')}
                                                        onBlur={() => setActiveSqftInput(null)}
                                                        onChange={(e) => {
                                                            const currentMin = sqftRange.split('-')[0] || '';
                                                            const newRange = `${currentMin}-${e.target.value}`;
                                                            setSqftRange(newRange === '-' ? '' : newRange);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* --- THE CUSTOM DROPDOWN MENU --- */}
                                            {activeSqftInput && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '52px',
                                                    left: activeSqftInput === 'min' ? '0' : 'auto',
                                                    right: activeSqftInput === 'max' ? '0' : 'auto',
                                                    width: 'calc(50% - 4px)', 
                                                    maxHeight: '220px',
                                                    overflowY: 'auto',
                                                    background: '#fff',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                    zIndex: 1000,
                                                }}>
                                                    {sqftIncrements.map(sqft => (
                                                        <button
                                                            key={sqft}
                                                            type="button"
                                                            onMouseDown={() => handleSqftSelect(sqft)}
                                                            style={{
                                                                display: 'block',
                                                                width: '100%',
                                                                padding: '12px 16px',
                                                                textAlign: 'left',
                                                                background: 'none',
                                                                border: 'none',
                                                                borderBottom: '1px solid #f3f4f6',
                                                                fontSize: '14px',
                                                                color: '#374151',
                                                                cursor: 'pointer'
                                                            }}
                                                            onMouseOver={(e) => e.target.style.background = '#f9fafb'}
                                                            onMouseOut={(e) => e.target.style.background = 'none'}
                                                        >
                                                            {sqft.toLocaleString()} sqft
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* --- END SQFT FILTER --- */}

                                    {/* --- ACRES FILTER --- */}
                                    <div className="filter-section">
                                        <h4>Lot Size (Acres)</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1 }}>
                                                <input 
                                                    type="number" 
                                                    placeholder="Min Acres"
                                                    value={acresRange.split('-')[0] || ''}
                                                    style={{ width: '100%', height: '44px', padding: '0 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
                                                    onChange={(e) => {
                                                        const currentMax = acresRange.split('-')[1] || '';
                                                        const newRange = `${e.target.value}-${currentMax}`;
                                                        setAcresRange(newRange === '-' ? '' : newRange);
                                                    }}
                                                />
                                            </div>
                                            <span style={{ color: '#9ca3af' }}>-</span>
                                            <div style={{ flex: 1 }}>
                                                <input 
                                                    type="number" 
                                                    placeholder="Max Acres"
                                                    value={acresRange.split('-')[1] || ''}
                                                    style={{ width: '100%', height: '44px', padding: '0 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
                                                    onChange={(e) => {
                                                        const currentMin = acresRange.split('-')[0] || '';
                                                        const newRange = `${currentMin}-${e.target.value}`;
                                                        setAcresRange(newRange === '-' ? '' : newRange);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* --- END ACRES FILTER --- */}

                                    <div className="filter-section save-alert-section" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px solid #f3f4f6' }}>
                                        <h4 style={{ color: '#1a5091', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            Save this Search 🔔
                                        </h4>
                                        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                                            Get emailed when a new property matches these filters.
                                        </p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <input 
                                                type="email" 
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                style={{ width: '100%', height: '44px', padding: '0 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
                                            />
                                            <button 
                                                className="modal-apply-btn"
                                                style={{ width: '100%', background: '#1a5091' }}
                                                onClick={handleSaveSearch}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? 'Saving...' : 'Save Search & Notify Me'}
                                            </button>
                                            {saveMessage.text && (
                                                <p style={{ 
                                                    fontSize: '14px', 
                                                    marginTop: '8px', 
                                                    textAlign: 'center',
                                                    color: saveMessage.type === 'error' ? '#dc2626' : '#059669',
                                                    fontWeight: '500'
                                                }}>
                                                    {saveMessage.text}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                </div>

                                {/* Footer */}
                                <div className="filter-modal-footer">
                                    {/* For now, just a done button to close it */}
                                    <div style={{ flex: 1 }}></div>
                                    <button className="modal-apply-btn" 
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            // Trigger search with the new price when they hit Done
                                            onSearch(buildFilters({ priceRange: priceRange === '-' ? '' : priceRange }));
                                        }}
                                    >
                                        Apply
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* Clear all — only shows when filters are active */}
                    {activeCount > 0 && (
                        <button
                            type="button"
                            className="filter-pill filter-pill-clear"
                            onClick={() => {
                                setSearch('');
                                setSelectedCities([]);
                                setPropertyType('');
                                setMinBeds('');
                                setMinBaths('');
                                setPriceRange('');
                                setSqftRange('');
                                onSearch({ status: 'Active' });
                            }}
                        >
                            <span className="filter-pill-label">Clear All</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
