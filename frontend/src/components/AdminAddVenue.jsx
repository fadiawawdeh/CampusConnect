import React, { useState } from 'react';
import './AdminAddVenue.css';

const AdminAddVenue = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
    type: 'other'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity, 10),
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create venue');
      }

      setMessage('Venue successfully created! Available for bookings.');
      setFormData({ name: '', location: '', capacity: '', type: 'other' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="venue-admin-container">
      <div className="venue-admin-card">
        <h2 className="venue-admin-title">Add Campus Venue</h2>
        <p className="venue-admin-subtitle">Register a new bookable space to the platform</p>

        {error && <div className="venue-alert venue-alert-error">{error}</div>}
        {message && <div className="venue-alert venue-alert-success">{message}</div>}

        <form onSubmit={handleSubmit} className="venue-form">
          <div className="venue-form-group">
            <label htmlFor="name">Venue Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              placeholder="e.g. Main Auditorium" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="venue-form-group">
            <label htmlFor="location">Location / Building</label>
            <input 
              type="text" 
              id="location" 
              name="location" 
              placeholder="e.g. Engineering Block B" 
              value={formData.location} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="venue-form-row">
            <div className="venue-form-group half">
              <label htmlFor="capacity">Capacity (Persons)</label>
              <input 
                type="number" 
                id="capacity" 
                name="capacity" 
                min="1" 
                value={formData.capacity} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="venue-form-group half">
              <label htmlFor="type">Venue Type</label>
              <select 
                id="type" 
                name="type" 
                value={formData.type} 
                onChange={handleChange}
              >
                <option value="auditorium">Auditorium</option>
                <option value="lab">Laboratory</option>
                <option value="sports_hall">Sports Hall</option>
                <option value="study_room">Study Room</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <button type="submit" className="venue-submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Venue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAddVenue;
