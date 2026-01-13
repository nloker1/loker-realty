import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Contact from './Contact';
import Home from './Home';
import Header from './Header';
import Blog from './Blog'
import BlogPost from './BlogPost'
import PropertyMap from './PropertyMap'; // Import your new map component
import HomeDetails from './HomeDetails';
import './App.css'; // Temporarily commented out for troubleshooting

function App() {
  return (
    <Router>
      <div className="App">
        <Routes> {/* Wrap Route components inside Routes */}
          <Route exact path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/map" element={<PropertyMapPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog-posts/:id" element={<BlogPost />} /> {/* Route for individual blog posts */}
          <Route path="/property/:slug/:mls_number" element={<HomeDetails />} />          {/* other routes */}
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