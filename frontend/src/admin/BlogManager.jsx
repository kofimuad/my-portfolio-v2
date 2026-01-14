import { useState, useEffect } from 'react';
import { blogsAPI } from '../utils/api';
import '../styles/admin.css';

export default function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogsAPI.getAll();
      setBlogs(response.data);
    } catch (err) {
      setError('Failed to fetch blogs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await blogsAPI.update(editingId, formData);
      } else {
        await blogsAPI.create(formData);
      }
      setFormData({ title: '', excerpt: '', content: '' });
      setEditingId(null);
      setShowForm(false);
      fetchBlogs();
    } catch (err) {
      setError('Failed to save blog');
      console.error(err);
    }
  };

  const handleEdit = (blog) => {
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
    });
    setEditingId(blog.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogsAPI.delete(id);
        fetchBlogs();
      } catch (err) {
        setError('Failed to delete blog');
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', excerpt: '', content: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Loading blogs...</div>;

  return (
    <div className="manager">
      <h2>Blog Manager</h2>
      {error && <div className="error-message">{error}</div>}

      {!showForm ? (
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + New Blog Post
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="manager-form">
          <h3>{editingId ? 'Edit Blog' : 'Create New Blog'}</h3>

          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Excerpt</label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows="10"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn-secondary1" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="items-list">
        {blogs.length === 0 ? (
          <p>No blogs yet. Create your first one!</p>
        ) : (
          blogs.map((blog) => (
            <div key={blog.id} className="item-card">
              <h3>{blog.title}</h3>
              <p className="excerpt">{blog.excerpt}</p>
              <p className="date">
                Created: {new Date(blog.created_at).toLocaleDateString()}
              </p>
              <div className="item-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(blog)}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(blog.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}