import { pool } from '../config/db.js';

// Get current user's bookings
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    // Join with venues table to return the venue name
    const query = `
      SELECT r.*, v.name as venue_name, v.location, v.type as venue_type 
      FROM reservations r
      JOIN venues v ON r.venue_id = v.id
      WHERE r.user_id = ?
      ORDER BY r.reservation_date ASC, r.start_time ASC
    `;

    const [reservations] = await pool.query(query, [userId]);
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error while fetching bookings.' });
  }
};

// Cancel an existing reservation (updates status)
export const cancelReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.id;

    // First check if the reservation exists and belongs to user
    const [existing] = await pool.query('SELECT * FROM reservations WHERE id = ?', [reservationId]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    if (existing[0].user_id !== userId) {
      return res.status(403).json({ message: 'You can only cancel your own reservations.' });
    }

    if (existing[0].status === 'cancelled') {
        return res.status(400).json({ message: 'Reservation is already cancelled.' });
    }

    await pool.query('UPDATE reservations SET status = ? WHERE id = ?', ['cancelled', reservationId]);

    res.json({ message: 'Reservation cancelled successfully.' });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: 'Server error while cancelling reservation.' });
  }
};
