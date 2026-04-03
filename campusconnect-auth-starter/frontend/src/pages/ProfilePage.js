import { useEffect, useState } from 'react';
import api from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      }));
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.put('/me', form);
      const response = await api.get('/me');
      setUser(response.data.user);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    }
  };

  const handleDelete = async () => {
    setMessage('');
    setError('');
    try {
      await api.delete('/me', { data: { password: deletePassword } });
      await logout();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'Arial' }}>
      <h2>Edit Account</h2>
      <form onSubmit={handleUpdate}>
        {['firstName', 'lastName', 'email', 'phoneNumber', 'currentPassword', 'newPassword'].map((field) => (
          <input
            key={field}
            style={{ width: '100%', marginBottom: 12, padding: 10 }}
            type={field.toLowerCase().includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
            placeholder={field}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          />
        ))}
        <button type="submit" style={{ padding: 10 }}>Update Profile</button>
      </form>

      <hr style={{ margin: '30px 0' }} />
      <h3>Delete Account</h3>
      <input
        style={{ width: '100%', marginBottom: 12, padding: 10 }}
        type="password"
        placeholder="Confirm password"
        value={deletePassword}
        onChange={(e) => setDeletePassword(e.target.value)}
      />
      <button onClick={handleDelete} style={{ padding: 10, background: '#b71c1c', color: 'white' }}>
        Delete Account
      </button>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </div>
  );
}
