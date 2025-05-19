import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import './Blog.css';


const Blog = () => {
  // Example blog posts data
  const blogPosts = [

    {
      id:5,
      title: "How I saved my first client over $10,000 in Commission Fees!",
      date: "May 19, 2025"
    },

    {
      id:4,
      title: "The Insider's Guide to Real Estate in the Columbia River Gorge",
      date: "Feb 6, 2025"
    }



  ];

  return (
    <div>
      <Header />
      <div className="blog-post-content">
      <div className="blog-posts">
      <h1>Knowledge Hub</h1>
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