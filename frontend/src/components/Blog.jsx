import { useEffect, useState } from 'react';
import { blogsAPI } from '../utils/api';
import '../styles/pages.css';

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await blogsAPI.getAll();
        setBlogs(response.data);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container blog-page">
      <div className="page-header">
        <h1>My Blog</h1>
        <p>Thoughts, tutorials, and insights on web development</p>
      </div>

      {selectedBlog ? (
        <div className="blog-detail">
          <button 
            className="btn-back"
            onClick={() => setSelectedBlog(null)}
          >
            ← Back to List
          </button>
          <article>
            <h2>{selectedBlog.title}</h2>
            <p className="blog-meta">
              {new Date(selectedBlog.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <div className="blog-content">
              {selectedBlog.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
      ) : (
        <div className="blogs-list">
          {blogs.length === 0 ? (
            <p>No blog posts yet.</p>
          ) : (
            blogs.map((blog) => (
              <article key={blog.id} className="blog-card">
                <h3>{blog.title}</h3>
                <p className="blog-meta">
                  {new Date(blog.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="blog-excerpt">{blog.excerpt}</p>
                <button
                  className="read-more"
                  onClick={() => setSelectedBlog(blog)}
                >
                  Read More →
                </button>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}