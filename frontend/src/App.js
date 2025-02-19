import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AboutMe from './AboutMe';
import Contact from './Contact';
import Home from './Home';
import Blog from './Blog'
import BlogPost from './BlogPost'
import './App.css'; // Temporarily commented out for troubleshooting

function App() {
  return (
    <Router>
      <div className="App">
        <Routes> {/* Wrap Route components inside Routes */}
          <Route exact path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog-posts/:id" element={<BlogPost />} /> {/* Route for individual blog posts */}
          {/* other routes */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;