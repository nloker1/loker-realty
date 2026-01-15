import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'; // ✅ Import rehypeRaw to allow raw HTML
import '../markdown.css';

const BlogPost = () => {
  const { id } = useParams();
  const [postContent, setPostContent] = useState('');

  useEffect(() => {
    fetch(`/blog-posts/${id}.md`)
      .then(response => response.text())
      .then(text => setPostContent(text));
  }, [id]);

  return (
    <div className="blog-post-content">
      <ReactMarkdown className="markdown" rehypePlugins={[rehypeRaw]}>
        {postContent}
      </ReactMarkdown>
    </div>
  );
};

export default BlogPost;