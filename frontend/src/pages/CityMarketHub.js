import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
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
        <h1 className="hub-title">{cityName} Real Estate Hub</h1>
        <p className="hub-subtitle">
            Live market analytics and top agent performance for {cityName}. 
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

        {/* CHART SECTION */}
        <div className="chart-wrapper">
          <h3 className="chart-title">12-Month Median Price Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280" 
                fontSize={12} 
                tickLine={false} 
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value / 1000}k`} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#000000" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#00000', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* SECTION 2: TOP REALTORS */}
      <section className="hub-section">
        <h2 className="section-title">
          Top Performing Realtors in {cityName}
        </h2>
        <p className="section-description">
          Ranked by total transaction volume (sales) in {cityName} over the last 12 months.
        </p>

        <div className="table-wrapper">
          <table className="realtor-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Agent Name</th>
                <th>Total Volume</th>
                <th>Transactions</th>
              </tr>
            </thead>
            <tbody>
              {topRealtors.map((agent, index) => (
                <tr key={agent.id || index}>
                  <td>#{index + 1}</td>
                  <td className="agent-name">{agent.name}</td>
                  <td>{agent.volume}</td>
                  <td>{agent.transactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </article>
    </div>
  );
};

export default CityMarketHub;