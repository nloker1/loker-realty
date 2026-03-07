import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// Pages
import Home from './pages/Home';
import Contact from './pages/Contact';
import Listings from './pages/Listings';
import Dashboard from './pages/MarketDashboard';
import CityMarketHub from './pages/CityMarketHub';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import PropertyDetails from './pages/PropertyDetails';
import PropertyMap from './components/map/PropertyMap';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import './App.css'; // Temporarily commented out for troubleshooting

function App() {
  return (
    <Router>
      <div className="App">
        <Routes> {/* Wrap Route components inside Routes */}
          <Route exact path="/" element={<Home />} />
          <Route path="/properties" element={<Listings />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/map" element={<PropertyMap />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/market/:cityId" element={<CityMarketHub />} />  
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog-posts/:id" element={<BlogPost />} /> {/* Route for individual blog posts */}
          <Route path="/property/:slug/:mls_number" element={<PropertyDetails />} />          {/* other routes */}
        </Routes>
      </div>
    </Router>
  );
}

const PropertyMapPage = () => (
  <>
    <Header /> 
    <div className="map-page-container">
      <PropertyMap />
    </div>
    {/* You might want to omit the Footer on the map page for a cleaner "app" feel */}
  </>
);


export default App;