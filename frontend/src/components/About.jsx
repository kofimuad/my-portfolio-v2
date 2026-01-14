import { useEffect, useState } from 'react';
import { aboutAPI } from '../utils/api';
import '../styles/pages.css';

export default function About() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const response = await aboutAPI.getAll();
        if (response.data && response.data.length > 0) {
          setAbout(response.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch about section:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) return <div className="page-container"><p>Loading...</p></div>;
  if (!about) return <div className="page-container"><p>About section not found</p></div>;

  return (
    <div className="page-container about-page">
      <div className="page-header">
        <h1>About Me</h1>
      </div>

      <div className="about-content">
        <div className="bio-section">
          <h2>Bio</h2>
          <p>{about.bio}</p>
        </div>

        <div className="skills-section">
          <h2>Skills</h2>
          <div className="skills-list">
            {about.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="hobbies-section">
          <h2>Hobbies & Interests</h2>
          <ul>
            {about.hobbies.map((hobby, index) => (
              <li key={index}>{hobby}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}