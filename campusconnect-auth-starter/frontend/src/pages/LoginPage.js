import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ admin = false }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login(form, admin);
      if (admin || result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', fontFamily: 'Arial' }}>
      <h2>{admin ? 'Administrator Login' : 'Role-Based Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          style={{ width: '100%', marginBottom: 12, padding: 10 }}
          type="email"
          placeholder="University email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          style={{ width: '100%', marginBottom: 12, padding: 10 }}
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit" style={{ width: '100%', padding: 10 }}>Login</button>
      </form>
      {!admin && <p style={{ marginTop: 12 }}><Link to="/forgot-password">Forgot my password</Link></p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </div>
  );
}
