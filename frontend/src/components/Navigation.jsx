import { Link, useLocation } from 'react-router-dom';
import '../styles/navigation.css';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <ul className="nav-menu">
          <li>
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className={`nav-link ${isActive('/about')}`}>
              About
            </Link>
          </li>
          <li>
            <Link to="/blog" className={`nav-link ${isActive('/blog')}`}>
              Blog
            </Link>
          </li>
          <li>
            <Link to="/projects" className={`nav-link ${isActive('/projects')}`}>
              Projects
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}