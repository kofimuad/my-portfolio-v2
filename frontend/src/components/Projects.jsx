import { useEffect, useState } from 'react';
import { projectsAPI } from '../utils/api';
import '../styles/pages.css';

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
                <img src={project.image_url} alt={project.title} />
              )}
              <div className="project-info">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
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
          ))
        )}
      </div>
    </div>
  );
}