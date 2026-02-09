import React, { useState } from 'react';
import './FilterBar.css'; // We will make this next

const FilterBar = ({ onSearch }) => {
    // Local state for the inputs (what the user is typing)
    const [search, setSearch] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [status, setStatus] = useState("Active");

    // When "Search" is clicked, pass the data up to the parent
    const handleSubmit = (e) => {
        e.preventDefault(); // Stop page reload
        onSearch({ search, minPrice, maxPrice, status });
    };

    return (
        <form className="zillow-filter-bar" onSubmit={handleSubmit}>
            {/* 1. MAIN SEARCH (Large) */}
            <div className="filter-group search-group">
                <input 
                    type="text" 
                    placeholder="Address, City, Zip..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="z-input search-input"
                />
            </div>

            {/* 2. STATUS (Dropdown) */}
            <div className="filter-group">
                <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="z-select"
                >
                    <option value="Active">For Sale</option>
                    <option value="Pending">Pending</option>
                    <option value="Sold">Sold</option>
                </select>
            </div>

            {/* 3. PRICE (Min - Max) */}
            <div className="filter-group price-group">
                <input 
                    type="number" 
                    placeholder="Min Price" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="z-input price-input"
                />
                <span className="dash">—</span>
                <input 
                    type="number" 
                    placeholder="Max Price" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="z-input price-input"
                />
            </div>

            {/* 4. SUBMIT BUTTON */}
            <button type="submit" className="z-button">
                Search
            </button>
        </form>
    );
};

export default FilterBar;