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
    demo_link: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setError('');
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    setUploadingImage(true);
    try {
      const formDataWithImage = new FormData();
      formDataWithImage.append('file', imageFile);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Upload to backend API using relative path
      const response = await fetch('/api/projects/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataWithImage,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          // Response wasn't JSON
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Upload response:', data);
      
      if (!data.image_url && !data.url) {
        throw new Error('No image URL in response');
      }
      
      // Use the URL returned from backend (Cloudinary URL)
      const imageUrl = data.image_url || data.url;
      console.log('Image URL from backend:', imageUrl);
      
      return imageUrl;
    } catch (err) {
      setError(`Image upload error: ${err.message}`);
      console.error('Upload error:', err);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = formData.image_url;

      // Upload image if a new file was selected
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          return; // Error already set in uploadImage
        }
      }

      const projectData = {
        title: formData.title,
        description: formData.description,
        image_url: imageUrl,
        github_link: formData.github_link,
        demo_link: formData.demo_link,
      };

      console.log('Sending project data:', projectData);

      if (editingId) {
        console.log('Updating project:', editingId);
        await projectsAPI.update(editingId, projectData);
      } else {
        console.log('Creating new project');
        await projectsAPI.create(projectData);
      }

      resetForm();
      fetchProjects();
    } catch (err) {
      setError('Failed to save project');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      github_link: '',
      demo_link: '',
    });
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (project) => {
    console.log('Editing project:', project);
    setFormData({
      title: project.title,
      description: project.description,
      image_url: project.image_url,
      github_link: project.github_link,
      demo_link: project.demo_link || '',
    });
    setImagePreview(project.image_url);
    setImageFile(null);
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
    resetForm();
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
            <label htmlFor="image">Project Image</label>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
            <label htmlFor="image" className="file-input-label">
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploadingImage}
                style={{ display: 'none' }}
              />
              <span className="file-input-button">
                {imageFile ? `${imageFile.name} selected` : 'Choose Image File'}
              </span>
            </label>
            <small>Supported formats: JPG, PNG, GIF. Max size: 5MB</small>
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

          <div className="form-group">
            <label htmlFor="demo_link">Demo Link (Optional)</label>
            <input
              id="demo_link"
              type="url"
              name="demo_link"
              value={formData.demo_link}
              onChange={handleInputChange}
              placeholder="https://example.com/demo"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={uploadingImage}>
              {uploadingImage ? 'Uploading...' : editingId ? 'Update' : 'Create'}
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
              <div className="project-links">
                {project.demo_link && (
                  <a href={project.demo_link} target="_blank" rel="noopener noreferrer">
                    Live Project
                  </a>
                )}
                <a href={project.github_link} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </div>
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