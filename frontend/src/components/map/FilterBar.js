import React, { useState, useCallback } from 'react';
import './FilterBar.css';

const FilterBar = ({ onSearch, resultCount, loading }) => {
    const [search, setSearch] = useState('');
    const [selectedCities, setSelectedCities] = useState([]);
    const [propertyType, setPropertyType] = useState('');
    const [minBeds, setMinBeds] = useState('');
    const [minBaths, setMinBaths] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [sqftRange, setSqftRange] = useState('');

    const parseRange = (val) => {
        if (!val) return {};
        const [min, max] = val.split('-');
        const result = {};
        if (min) result.min = min;
        if (max) result.max = max;
        return result;
    };

    const buildFilters = useCallback((overrides = {}) => {
        const merged = {
            search, selectedCities, propertyType, minBeds, minBaths, priceRange, sqftRange,
            ...overrides
        };
        const price = parseRange(merged.priceRange);
        const sqft = parseRange(merged.sqftRange);

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
        };
    }, [search, selectedCities, propertyType, minBeds, minBaths, priceRange, sqftRange]);

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
        e.target.value = "";
    };

    // Text search submits on Enter
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSearch(buildFilters());
        }
    };

    // Count active filters for the badge
    const activeCount = [propertyType, minBeds, minBaths, priceRange, sqftRange, search, ...selectedCities]
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
                    {/* City filter (New pill for mobile/desktop) */}
                    <label className={`filter-pill ${selectedCities.length > 0 ? 'active' : ''}`}>
                        <select
                            value=""
                            onChange={handleCityChange}
                        >
                            <option value="">{selectedCities.length > 0 ? `${selectedCities.length} Cities` : 'City'}</option>
                            <option value="Hood River">Hood River {selectedCities.includes('Hood River') ? '✓' : ''}</option>
                            <option value="White Salmon">White Salmon {selectedCities.includes('White Salmon') ? '✓' : ''}</option>
                            <option value="The Dalles">The Dalles {selectedCities.includes('The Dalles') ? '✓' : ''}</option>
                            <option value="Bingen">Bingen {selectedCities.includes('Bingen') ? '✓' : ''}</option>
                            <option value="Lyle">Lyle {selectedCities.includes('Lyle') ? '✓' : ''}</option>
                            <option value="Odell">Odell {selectedCities.includes('Odell') ? '✓' : ''}</option>
                            <option value="Mt Hood Prkdl">Parkdale {selectedCities.includes('Mt Hood Prkdl') ? '✓' : ''}</option>
                            <option value="Mosier">Mosier {selectedCities.includes('Mosier') ? '✓' : ''}</option>
                            <option value="Cascade Locks">Cascade Locks {selectedCities.includes('Cascade Locks') ? '✓' : ''}</option>
                            <option value="Cook">Cook {selectedCities.includes('Cook') ? '✓' : ''}</option>
                            <option value="Stevenson">Stevenson {selectedCities.includes('Stevenson') ? '✓' : ''}</option>
                            <option value="Snowden">Snowden {selectedCities.includes('Snowden') ? '✓' : ''}</option>
                            <option value="Trout Lake">Trout Lake {selectedCities.includes('Trout Lake') ? '✓' : ''}</option>
                            <option value="BZ Corner">BZ Corner {selectedCities.includes('BZ Corner') ? '✓' : ''}</option>
                            <option value="Dallesport">Dallesport {selectedCities.includes('Dallesport') ? '✓' : ''}</option>
                            <option value="Home Valley">Home Valley {selectedCities.includes('Home Valley') ? '✓' : ''}</option>
                            <option value="Underwood">Underwood {selectedCities.includes('Underwood') ? '✓' : ''}</option>
                        </select>
                        <span className="filter-pill-label">
                            {selectedCities.length === 0 
                                ? 'City' 
                                : selectedCities.length === 1 
                                    ? selectedCities[0] 
                                    : `${selectedCities.length} Cities`}
                        </span>
                        <svg className="filter-pill-chevron" viewBox="0 0 12 12" width="10" height="10">
                            <path d="M3 4.5L6 7.5L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </label>

                    <label className={`filter-pill ${propertyType ? 'active' : ''}`}>
                        <select
                            value={propertyType}
                            onChange={handleFilterChange(setPropertyType, 'propertyType')}
                        >
                            <option value="">Home Type</option>
                            <option value="Residential">Residential</option>
                            <option value="Land">Land</option>
                            <option value="Multi-Family">Multi-Family</option>
                            <option value="Manufactured">Manufactured</option>
                            <option value="Commercial">Commercial</option>
                        </select>
                        <span className="filter-pill-label">
                            {propertyType || 'Home Type'}
                        </span>
                        <svg className="filter-pill-chevron" viewBox="0 0 12 12" width="10" height="10">
                            <path d="M3 4.5L6 7.5L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </label>

                    <label className={`filter-pill ${priceRange ? 'active' : ''}`}>
                        <select
                            value={priceRange}
                            onChange={handleFilterChange(setPriceRange, 'priceRange')}
                        >
                            <option value="">Price</option>
                            <option value="-200000">Under $200k</option>
                            <option value="200000-400000">$200k – $400k</option>
                            <option value="400000-600000">$400k – $600k</option>
                            <option value="600000-800000">$600k – $800k</option>
                            <option value="800000-1000000">$800k – $1M</option>
                            <option value="1000000-">$1M+</option>
                        </select>
                        <span className="filter-pill-label">
                            {priceRange ? {
                                '-200000': '< $200k',
                                '200000-400000': '$200k–$400k',
                                '400000-600000': '$400k–$600k',
                                '600000-800000': '$600k–$800k',
                                '800000-1000000': '$800k–$1M',
                                '1000000-': '$1M+',
                            }[priceRange] : 'Price'}
                        </span>
                        <svg className="filter-pill-chevron" viewBox="0 0 12 12" width="10" height="10">
                            <path d="M3 4.5L6 7.5L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </label>

                    <label className={`filter-pill ${minBeds ? 'active' : ''}`}>
                        <select
                            value={minBeds}
                            onChange={handleFilterChange(setMinBeds, 'minBeds')}
                        >
                            <option value="">Beds</option>
                            <option value="1">1+ Beds</option>
                            <option value="2">2+ Beds</option>
                            <option value="3">3+ Beds</option>
                            <option value="4">4+ Beds</option>
                            <option value="5">5+ Beds</option>
                        </select>
                        <span className="filter-pill-label">
                            {minBeds ? `${minBeds}+ Beds` : 'Beds'}
                        </span>
                        <svg className="filter-pill-chevron" viewBox="0 0 12 12" width="10" height="10">
                            <path d="M3 4.5L6 7.5L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </label>

                    <label className={`filter-pill ${minBaths ? 'active' : ''}`}>
                        <select
                            value={minBaths}
                            onChange={handleFilterChange(setMinBaths, 'minBaths')}
                        >
                            <option value="">Baths</option>
                            <option value="1">1+ Baths</option>
                            <option value="2">2+ Baths</option>
                            <option value="3">3+ Baths</option>
                            <option value="4">4+ Baths</option>
                        </select>
                        <span className="filter-pill-label">
                            {minBaths ? `${minBaths}+ Baths` : 'Baths'}
                        </span>
                        <svg className="filter-pill-chevron" viewBox="0 0 12 12" width="10" height="10">
                            <path d="M3 4.5L6 7.5L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </label>

                    <label className={`filter-pill ${sqftRange ? 'active' : ''}`}>
                        <select
                            value={sqftRange}
                            onChange={handleFilterChange(setSqftRange, 'sqftRange')}
                        >
                            <option value="">Sqft</option>
                            <option value="-1000">Under 1,000</option>
                            <option value="1000-1500">1,000–1,500</option>
                            <option value="1500-2000">1,500–2,000</option>
                            <option value="2000-3000">2,000–3,000</option>
                            <option value="3000-">3,000+</option>
                        </select>
                        <span className="filter-pill-label">
                            {sqftRange ? {
                                '-1000': '< 1,000',
                                '1000-1500': '1k–1.5k',
                                '1500-2000': '1.5k–2k',
                                '2000-3000': '2k–3k',
                                '3000-': '3,000+',
                            }[sqftRange] + ' sqft' : 'Sqft'}
                        </span>
                        <svg className="filter-pill-chevron" viewBox="0 0 12 12" width="10" height="10">
                            <path d="M3 4.5L6 7.5L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </label>

                    {/* Clear all — only shows when filters are active */}
                    {activeCount > 0 && (
                        <button
                            type="button"
                            className="filter-pill filter-pill-clear"
                            onClick={() => {
                                setPropertyType('');
                                setMinBeds('');
                                setMinBaths('');
                                setPriceRange('');
                                setSqftRange('');
                                onSearch({
                                    status: 'Active',
                                    search: search || undefined,
                                });
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
