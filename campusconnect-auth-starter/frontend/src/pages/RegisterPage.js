import { useState } from 'react';
import api from '../api/authApi';

const initialForm = {
  firstName: '',
  lastName: '',
  birthDate: '',
  birthCountry: '',
  birthCity: '',
  gender: 'prefer_not_to_say',
  address: '',
  phoneNumber: '',
  universityEmail: '',
  role: 'student',
  password: '',
  confirmPassword: ''
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setVerificationUrl('');
    try {
      const response = await api.post('/register', form);
      setMessage(response.data.message);
      setVerificationUrl(response.data.verificationUrl || '');
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div style={{ maxWidth: 650, margin: '40px auto', fontFamily: 'Arial' }}>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        {[
          ['firstName', 'First Name', 'text'],
          ['lastName', 'Last Name', 'text'],
          ['birthDate', 'Birth Date', 'date'],
          ['birthCountry', 'Birth Place / Country', 'text'],
          ['birthCity', 'Birth Place / City', 'text'],
          ['address', 'Address (optional)', 'text'],
          ['phoneNumber', 'Phone Number (optional)', 'text'],
          ['universityEmail', 'University Email', 'email'],
          ['password', 'Password', 'password'],
          ['confirmPassword', 'Confirm Password', 'password']
        ].map(([field, label, type]) => (
          <input key={field} style={{ width: '100%', marginBottom: 12, padding: 10 }} type={type} placeholder={label} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
        ))}

        <select style={{ width: '100%', marginBottom: 12, padding: 10 }} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
          <option value="prefer_not_to_say">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <select style={{ width: '100%', marginBottom: 12, padding: 10 }} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="club_organizer">Club Organizer</option>
        </select>

        <button type="submit" style={{ width: '100%', padding: 10 }}>Register</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {verificationUrl && (
        <p>
          Development verification link: <a href={verificationUrl}>{verificationUrl}</a>
        </p>
      )}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </div>
  );
}
