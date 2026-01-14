// src/components/ThemeToggle.jsx
import { useTheme } from '../context/ThemeContext';
import '../styles/theme-toggle.css';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      aria-label="Toggle dark/light mode"
      title={isDark ? 'Light Mode' : 'Dark Mode'}
    >
      {isDark ? '(❁´◡`❁)' : '(✿◡‿◡)'}
    </button>
  );
}