import { useState } from 'react';
import api from '../api/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setResetUrl('');
    try {
      const response = await api.post('/forgot-password', { email });
      setMessage(response.data.message);
      setResetUrl(response.data.resetUrl || '');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email.');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', fontFamily: 'Arial' }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          style={{ width: '100%', marginBottom: 12, padding: 10 }}
          type="email"
          placeholder="University email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" style={{ width: '100%', padding: 10 }}>Send Reset Link</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {resetUrl && (
        <p>
          Development reset link: <a href={resetUrl}>{resetUrl}</a>
        </p>
      )}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </div>
  );
}
