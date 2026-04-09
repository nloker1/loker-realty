import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import './Blog.css';


const Blog = () => {
  // Example blog posts data
  const blogPosts = [
    {
      id: "klickitat-land-subdivision",
      title: "Comprehensive Guide to Subdividing Land in Klickitat County",
      date: "Apr 8, 2026"
    }
  ];

  return (
    <div>
      <Header />
      <div className="blog-post-content">
      <div className="blog-posts">
      <h1>Education</h1>
        {blogPosts.map(post => (
          <div key={post.id} className="blog-post">
            <h2>
              <Link to={`/blog-posts/${post.id}`}>{post.title}</Link>
            </h2>
            <p>{post.date}</p>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

export default Blog;