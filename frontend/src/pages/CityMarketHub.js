import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import Header from '../components/layout/Header';
import './CityMarketHub.css'; 

// --- 1. CUSTOM TOOLTIP COMPONENT ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; 
    return (
      <div className="custom-tooltip">
        <p className="tooltip-date">{label}</p>
        <p className="tooltip-price">
          ${data.price.toLocaleString()}
        </p>
        {data.count !== undefined && (
          <p className="tooltip-volume">
            {data.count} Sales Recorded
          </p>
        )}
      </div>
    );
  }
  return null;
};

const CityMarketHub = () => {
  // 1. HOOKS
  const { cityId } = useParams(); 
  const [marketData, setMarketData] = useState(null);
  const [topRealtors, setTopRealtors] = useState([]);
  const [trendData, setTrendData] = useState([]); 
  const [recentListings, setRecentListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. VARIABLE DEFINITIONS (MUST BE HERE, BEFORE RETURNS)
  // We define cityName immediately so it's available for the loading screen
  const cityName = cityId
    ? cityId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Unknown City';

  // 3. EFFECT (FETCH DATA)
  useEffect(() => {
    const fetchData = async () => {
      if (!cityId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Ensure this URL matches your FastAPI server (e.g., http://localhost:8000)
        // If using a proxy, just /api/market/... is fine.
        const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'; // Fallback just in case
        const response = await fetch(`${API_URL}/api/market/${cityId}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        setMarketData(data.marketData);
        setTrendData(data.trendData);
        setTopRealtors(data.topRealtors);
        setRecentListings(data.recentListings || []);
        
      } catch (err) {
        console.error("Failed to fetch market data", err);
        setError("Could not load market data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [cityId]);
  
  // 4. CONDITIONAL RETURNS (LOADING / ERROR)
  // These use 'cityName', so they must come AFTER 'cityName' is defined
  if (!cityId) return <div className="hub-error">Please select a city.</div>;
  
  if (isLoading) {
    return <div className="hub-loading">Loading live market data for {cityName}...</div>;
  }
  
  if (error) return <div className="hub-error">{error}</div>;
  
  // Safety check: if data is still null for some reason, don't crash
  if (!marketData) return null;

  // 5. MAIN RENDER
  return (
    <div className="bg-gray-50 min-h-screen">
    <Header /> 
    <article className="hub-container">
      <header className="hub-header">
        <h1 className="hub-title text-center">{cityName} Analytics Hub</h1>
        <p className="hub-subtitle text-center">
            Live real estate analytics for {cityName}. 
        </p>
      </header>

      {/* SECTION 1: MARKET STATS */}
      <section className="hub-section">
        <h2 className="section-title">Current Market Snapshot</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-title">Median Home Price</h3>
            <p className="stat-value">
                ${marketData.medianPrice.toLocaleString()}
            </p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">Median Days on Market</h3>
            <p className="stat-value">
                {marketData.daysOnMarket} Days
            </p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">Active Inventory</h3>
            <p className="stat-value">
                {marketData.activeListings} Homes
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: RECENTLY LISTED */}
      <section className="hub-section">
        <h2 className="section-title">Recently Listed in {cityName}</h2>
        <p className="section-description">
          New properties hitting the market in the last 30 days and their current status.
        </p>
        
        <div className="recent-listings-vertical">
          {recentListings.length > 0 ? (
            recentListings.map((listing) => (
              <Link 
                to={`/property/${listing.address_slug}/${listing.mls_number}`} 
                key={listing.mls_number} 
                className="recent-listing-row"
              >
                <div className="row-image-wrapper">
                  <img 
                    src={listing.photo_url || '/api/placeholder/400/300'} 
                    alt={listing.address} 
                    className="row-image"
                  />
                  <div className={`status-badge-mini badge-${listing.status.toLowerCase()}`}>
                    {listing.status}
                  </div>
                </div>
                <div className="row-content">
                  <div className="row-main">
                    <div className="row-price">
                      ${listing.price.toLocaleString()}
                    </div>
                    <div className="row-address">
                      {listing.address}
                    </div>
                  </div>
                  <div className="row-details">
                    <span className="row-stats">
                      {listing.beds} bds | {listing.baths} ba | {listing.sqft} sqft
                    </span>
                    <span className="row-dom">
                      {listing.dom} Days on Market
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-recent">No new listings in the last 30 days.</div>
          )}
        </div>
      </section>

      {/* SECTION 3: TOP REALTORS */}
      <section className="hub-section">
        <h2 className="section-title">
          Top Realtors in {cityName}
        </h2>
        <p className="section-description">
          Ranked by total transaction volume (sales) in {cityName} over the last 12 months.
        </p>

        <div className="realtor-list">
          {topRealtors.map((agent, index) => (
            <div key={agent.id || index} className="realtor-card">
              <div className="realtor-rank">#{index + 1}</div>
              <div className="realtor-info">
                <div className="agent-name">{agent.name}</div>
                <div className="realtor-stats-row">
                  <div className="realtor-stat">
                    <span className="realtor-label">Volume:</span>
                    <span className="realtor-value">{agent.volume}</span>
                  </div>
                  <div className="realtor-stat">
                    <span className="realtor-label">Sales:</span>
                    <span className="realtor-value">{agent.transactions}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: CHART SECTION */}
      <section className="hub-section">
        <h2 className="section-title">Market Trends</h2>
        <p className="section-description">
          12-month median price movement for {cityName}.
        </p>
        <div className="chart-wrapper">
          <h3 className="chart-title">12-Month Median Price Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#9ca3af" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value / 1000}k`} 
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#000000" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorPrice)"
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} 
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

    </article>
    </div>
  );
};

export default CityMarketHub;