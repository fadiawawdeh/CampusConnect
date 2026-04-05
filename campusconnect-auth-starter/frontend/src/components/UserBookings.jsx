import React, { useState, useEffect } from 'react';
import './UserBookings.css';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reservations/my-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch bookings');
      
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reservations/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Cancellation failed');
      
      // Update UI immediately
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="bookings-loader">Loading your bookings...</div>;

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h2>My Bookings</h2>
        <p>Manage all your upcoming and past venue reservations.</p>
      </div>

      {error && <div className="bookings-error">{error}</div>}

      {bookings.length === 0 && !error ? (
        <div className="bookings-empty">
          <svg className="bookings-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p>You have no reservations yet.</p>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => {
            const isCancelled = booking.status === 'cancelled';
            const isActive = booking.status === 'upcoming' || booking.status === 'pending_approval';

            return (
              <div key={booking.id} className={`booking-card ${isCancelled ? 'cancelled' : ''}`}>
                <div className="booking-card-header">
                  <h3 className="booking-event-name">{booking.event_name}</h3>
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="booking-details">
                  <div className="detail-item">
                    <strong>Venue:</strong> {booking.venue_name} ({booking.venue_type.replace('_', ' ')})
                  </div>
                  <div className="detail-item">
                    <strong>Location:</strong> {booking.location}
                  </div>
                  <div className="detail-item">
                    <strong>Date:</strong> {new Date(booking.reservation_date).toLocaleDateString()}
                  </div>
                  <div className="detail-item time">
                    <strong>Time:</strong> {booking.start_time.substring(0,5)} - {booking.end_time.substring(0,5)}
                  </div>
                </div>

                {isActive && (
                  <div className="booking-actions">
                    <button 
                      className="cancel-btn" 
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel Reservation
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserBookings;
