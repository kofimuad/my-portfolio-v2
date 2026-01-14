import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import BlogManager from './BlogManager';
import ProjectManager from './ProjectManager';
import AboutManager from './AboutManager';
import ContactSubmissions from './ContactSubmissions';
import '../styles/admin.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('blogs');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <nav className="admin-tabs">
        <button
          className={activeTab === 'blogs' ? 'active' : ''}
          onClick={() => setActiveTab('blogs')}
        >
          Blogs
        </button>
        <button
          className={activeTab === 'projects' ? 'active' : ''}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </button>
        <button
          className={activeTab === 'about' ? 'active' : ''}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
        <button
          className={activeTab === 'contacts' ? 'active' : ''}
          onClick={() => setActiveTab('contacts')}
        >
          Contact Submissions
        </button>
      </nav>

      <div className="admin-content">
        {activeTab === 'blogs' && <BlogManager />}
        {activeTab === 'projects' && <ProjectManager />}
        {activeTab === 'about' && <AboutManager />}
        {activeTab === 'contacts' && <ContactSubmissions />}
      </div>
    </div>
  );
}