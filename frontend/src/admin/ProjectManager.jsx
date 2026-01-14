import { useState, useEffect } from 'react';
import { projectsAPI } from '../utils/api';
import '../styles/admin.css';

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    github_link: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (err) {
      setError('Failed to fetch projects');
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
        await projectsAPI.update(editingId, formData);
      } else {
        await projectsAPI.create(formData);
      }
      setFormData({
        title: '',
        description: '',
        image_url: '',
        github_link: '',
      });
      setEditingId(null);
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      setError('Failed to save project');
      console.error(err);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      description: project.description,
      image_url: project.image_url,
      github_link: project.github_link,
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsAPI.delete(id);
        fetchProjects();
      } catch (err) {
        setError('Failed to delete project');
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      github_link: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div className="manager">
      <h2>Project Manager</h2>
      {error && <div className="error-message">{error}</div>}

      {!showForm ? (
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + New Project
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="manager-form">
          <h3>{editingId ? 'Edit Project' : 'Create New Project'}</h3>

          <div className="form-group">
            <label htmlFor="title">Project Title</label>
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
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="5"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image_url">Image URL</label>
            <input
              id="image_url"
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="github_link">GitHub Link</label>
            <input
              id="github_link"
              type="url"
              name="github_link"
              value={formData.github_link}
              onChange={handleInputChange}
              placeholder="https://github.com/user/repo"
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
        {projects.length === 0 ? (
          <p>No projects yet. Create your first one!</p>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="item-card">
              {project.image_url && (
                <img src={project.image_url} alt={project.title} className="project-img" />
              )}
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <a href={project.github_link} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <div className="item-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(project)}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(project.id)}
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