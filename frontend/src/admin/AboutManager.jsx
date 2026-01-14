import { useState, useEffect } from 'react';
import { aboutAPI } from '../utils/api';
import '../styles/admin.css';

export default function AboutManager() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    bio: '',
    skills: [],
    hobbies: [],
  });
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [hobbyInput, setHobbyInput] = useState('');

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      const response = await aboutAPI.getAll();
      if (response.data && response.data.length > 0) {
        const aboutData = response.data[0];
        setFormData({
          bio: aboutData.bio,
          skills: aboutData.skills,
          hobbies: aboutData.hobbies,
        });
        setAbout(aboutData);
      }
    } catch (err) {
      setError('Failed to fetch about section');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBioChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      bio: e.target.value,
    }));
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addHobby = () => {
    if (hobbyInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        hobbies: [...prev.hobbies, hobbyInput.trim()],
      }));
      setHobbyInput('');
    }
  };

  const removeHobby = (index) => {
    setFormData((prev) => ({
      ...prev,
      hobbies: prev.hobbies.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (about) {
        await aboutAPI.update(about.id, formData);
      } else {
        await aboutAPI.create(formData);
      }
      fetchAbout();
      setError('');
    } catch (err) {
      setError('Failed to save about section');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading about section...</div>;

  return (
    <div className="manager">
      <h2>About Section Manager</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="manager-form">
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={handleBioChange}
            rows="6"
            required
          />
        </div>

        <div className="form-group">
          <label>Skills</label>
          <div className="list-input">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Enter a skill and press Add"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <button type="button" onClick={addSkill} className="btn-add">
              Add Skill
            </button>
          </div>
          <div className="tags-list">
            {formData.skills.map((skill, index) => (
              <span key={index} className="tag">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="remove-tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Hobbies</label>
          <div className="list-input">
            <input
              type="text"
              value={hobbyInput}
              onChange={(e) => setHobbyInput(e.target.value)}
              placeholder="Enter a hobby and press Add"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
            />
            <button type="button" onClick={addHobby} className="btn-add">
              Add Hobby
            </button>
          </div>
          <div className="tags-list">
            {formData.hobbies.map((hobby, index) => (
              <span key={index} className="tag">
                {hobby}
                <button
                  type="button"
                  onClick={() => removeHobby(index)}
                  className="remove-tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Save About Section
          </button>
        </div>
      </form>
    </div>
  );
}