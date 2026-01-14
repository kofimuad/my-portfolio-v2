import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

export default function Home() {
  const [showRiddleModal, setShowRiddleModal] = useState(false);
  const [riddleAnswer, setRiddleAnswer] = useState('');
  const [riddleError, setRiddleError] = useState('');
  const navigate = useNavigate();

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

  return (
    <div className="home-page">
      <section className="hero">
        {/* Profile Picture - Replace src with your image path */}
        <figure className="profile-figure">
          <img 
            src="/hoodie_cap.jpg" 
            alt="profile_pic" 
            className="profile_pic"
          />
        </figure>

        <div className="hero-content">
          <h1 className="name">Bismark A. Agyei</h1>
          <p className="title">Full Stack Web Developer</p>
          
          <div className="btn-container">
            <a href="/assets/resume.pdf" target="_blank" className="btn btn-primary">
              Resume
            </a>
            <a href="/about#contact" className="btn btn-secondary">
              Contact
            </a>
          </div>

          <a 
            href="#" 
            onClick={openRiddleModal}
            className="hidden-link"
            title="Secrets..."
          >
            セカンドライフ
          </a>
        </div>
      </section>

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
              onKeyPress={(e) => e.key === 'Enter' && handleRiddleCheck()}
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
    </div>
  );
}