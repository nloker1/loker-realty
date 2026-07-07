import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import './Blog.css';


const Blog = () => {
  // Example blog posts data
  const blogPosts = [
    {
      id: "june-market-update-2026"
      title:"June Market Report: Hood River + White Salmon"
      date: "July 7, 2026"
    }
    {
      id: "may-market-update-2026",
      title: "May Market Report: Hood River + White Salmon",
      date: "June 8, 2026"
    },
    {
      id: "decoding-white-salmon-r2-zone",
      title: "Decoding White Salmons R2 Zone",
      date: "May 27, 2026"
    },
    {
      id: "wyers-end-buyer-guide",
      title: "Wyers End Buyers Guide",
      date: "May 14, 2026"
    },
    {
      id: "klickitat-adu-changes-2026",
      title: "Klickitat County: Proposed ADU Changes April 2026",
      date: "Apr 22, 2026"
    },
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