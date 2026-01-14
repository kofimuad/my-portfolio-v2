import { Link } from 'react-router-dom';
import '../styles/pages.css';

export default function Hidden() {
  return (
    <div className="page-container hidden-page">
      <div className="page-header">
        <h1>セカンドライフ</h1>
        <p>Second Life Unlocked</p>
      </div>
      <div style={{ textAlign: 'center', color: '#aaa', marginTop: '50px' }}>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>
          You've discovered the hidden realm...
        </p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          This space is reserved for future secrets.
        </p>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '30px' }}>
          Return Home
        </Link>
      </div>
    </div>
  );
}