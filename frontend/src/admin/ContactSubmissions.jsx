import { useState, useEffect } from 'react';
import { contactAPI } from '../utils/api';
import '../styles/admin.css';

export default function ContactSubmissions() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactAPI.getAll();
      setContacts(response.data);
    } catch (err) {
      setError('Failed to fetch contact submissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await contactAPI.delete(id);
        fetchContacts();
      } catch (err) {
        setError('Failed to delete submission');
        console.error(err);
      }
    }
  };

  if (loading) return <div className="loading">Loading submissions...</div>;

  return (
    <div className="manager">
      <h2>Contact Form Submissions</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="submissions-list">
        {contacts.length === 0 ? (
          <p>No contact submissions yet.</p>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className="submission-card">
              <h3>{contact.name}</h3>
              <p className="email">
                <strong>Email:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </p>
              <p className="message">
                <strong>Message:</strong>
              </p>
              <p className="message-text">{contact.message}</p>
              <p className="date">
                Submitted: {new Date(contact.created_at).toLocaleDateString()} at{' '}
                {new Date(contact.created_at).toLocaleTimeString()}
              </p>
              <button
                className="btn-delete"
                onClick={() => handleDelete(contact.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}