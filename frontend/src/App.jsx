import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Navigation from './components/Navigation';
import Home from './components/Home';
import About from './components/About';
import Blog from './components/Blog';
import Projects from './components/Projects';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import Hidden from './components/Hidden';
import './styles/navigation.css';
import './styles/pages.css';
import './styles/home.css';
import './styles/admin.css';

function App() {
  const { isAuthenticated, loading } = useAuth();
  const [showRiddleModal, setShowRiddleModal] = useState(false);
  const [riddleAnswer, setRiddleAnswer] = useState('');
  const [riddleError, setRiddleError] = useState('');
  const navigate = useNavigate();

  // Riddle: "What am I? I have a face but no eyes. I have a head but no body. What am I?"
  // Answer: "coin" or "clock"
  const RIDDLE_QUESTION = "What am I? I have a city but no houses, forests but no trees, and water but no fish.";
  const RIDDLE_ANSWERS = ['map', 'a map'];

  const handleRiddleCheck = () => {
    const answer = riddleAnswer.toLowerCase().trim();
    if (RIDDLE_ANSWERS.includes(answer)) {
      setShowRiddleModal(false);
      setRiddleAnswer('');
      navigate('/hidden');
    } else {
      setRiddleError('Wrong answer... Try again.');
      setTimeout(() => setRiddleError(''), 2000);
    }
  };

  const openRiddleModal = (e) => {
    e.preventDefault();
    setShowRiddleModal(true);
    setRiddleAnswer('');
    setRiddleError('');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Routes>
      <Route
        path="*"
        element={
          <>
            <Navigation onHiddenClick={openRiddleModal} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/projects" element={<Projects />} />
              <Route
                path="/admin-secret-panel"
                element={
                  isAuthenticated ? <AdminDashboard /> : <AdminLogin />
                }
              />
              <Route path="/hidden" element={<Hidden />} />
            </Routes>

            {/* Riddle Modal */}
            {showRiddleModal && (
              <div className="riddle-modal-overlay">
                <div className="riddle-modal">
                  <button
                    className="riddle-close"
                    onClick={() => setShowRiddleModal(false)}
                  >
                    ×
                  </button>
                  <h2>Answer The Riddle</h2>
                  <p>{RIDDLE_QUESTION}</p>
                  <input
                    type="text"
                    value={riddleAnswer}
                    onChange={(e) => setRiddleAnswer(e.target.value)}
                    placeholder="Your answer..."
                    onKeyPress={(e) =>
                      e.key === 'Enter' && handleRiddleCheck()
                    }
                    autoFocus
                  />
                  {riddleError && (
                    <p className="riddle-error">{riddleError}</p>
                  )}
                  <button
                    className="riddle-submit"
                    onClick={handleRiddleCheck}
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </>
        }
      />
    </Routes>
  );
}

export default App;