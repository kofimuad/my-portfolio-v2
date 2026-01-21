import { useEffect, useState } from 'react';
import { projectsAPI } from '../utils/api';
import '../styles/pages.css';

// Helper function to convert relative URLs to absolute
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative path, prepend the backend URL
  const backendUrl = 'https://my-portfolio-v2-r6ow.onrender.com';
  return `${backendUrl}${imageUrl}`;
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectsAPI.getAll();
        setProjects(response.data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container projects-page">
      <div className="page-header">
        <h1>My Projects</h1>
        <p>A showcase of my recent work and portfolio pieces</p>
      </div>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <p>No projects yet.</p>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="project-card">
              {project.image_url && (
                <img 
                  src={getFullImageUrl(project.image_url)} 
                  alt={project.title} 
                  onError={(e) => {
                    console.error('Failed to load image:', getFullImageUrl(project.image_url));
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="project-info">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="project-links">
                  {project.demo_link && project.demo_link.trim() ? (
                    <a
                      href={project.demo_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      View Project →
                    </a>
                  ) : null}
                  <a
                    href={project.github_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    View on GitHub →
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}