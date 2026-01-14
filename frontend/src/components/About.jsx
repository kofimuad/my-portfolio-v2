import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { aboutAPI, contactAPI, handleApiError } from '../utils/api';

export default function About() {
  const [searchParams] = useSearchParams();
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

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

  // Scroll to contact form if query param is set
  useEffect(() => {
    if (searchParams.get('scroll') === 'contact') {
      setTimeout(() => {
        const contactElement = document.querySelector('.contact-form-container');
        if (contactElement) {
          contactElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess(false);

    try {
      await contactAPI.submit(formData);
      setFormSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      // Hide success message after 5 seconds
      setTimeout(() => setFormSuccess(false), 5000);
    } catch (err) {
      setFormError(handleApiError(err));
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div className="page-container"><p className="loading">Loading...</p></div>;

  return (
    <div className="page-container about-page">
      <div className="page-header">
        <h1># About Me</h1>
      </div>

      <div className="about-content">
        <div className="bio-section">
          <h2># Bio</h2>
          <p>{about && about.bio}</p>
        </div>

        <div className="skills-section">
          <h2># Skills</h2>
          <div className="skills-list">
            {about && about.skills && about.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="hobbies-section">
          <h2># Hobbies & Interests</h2>
          <ul>
            {about && about.hobbies && about.hobbies.map((hobby, index) => (
              <li key={index}>{hobby}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="contact-form-container">
        <h2>Let's Work Together</h2>
        <p>I'm always open to discussing new projects, creative ideas, or opportunities to bring your vision to life.</p>
        
        <form onSubmit={handleSubmit} className="contact-form">
          {formSuccess && (
            <div className="success-message">
              Thank you! Your message has been sent successfully.
            </div>
          )}
          {formError && <div className="error-message">{formError}</div>}

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows="5"
              placeholder="Your message here..."
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={formLoading}>
            {formLoading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}