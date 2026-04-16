import { pool } from '../config/db.js';
import { fallbackReservations, fallbackVenues, ids, isDbUnavailable } from '../utils/fallbackStore.js';

export const createReservation = async (req, res) => {
  const userId = req.user.id;
  const { venueId, eventName, reservationDate, startTime, endTime } = req.body;

  try {
    if (!venueId || !eventName || !reservationDate || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide all reservation fields.' });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ message: 'End time must be after start time.' });
    }

    const [venues] = await pool.query('SELECT id FROM venues WHERE id = ?', [venueId]);
    if (!venues.length) {
      return res.status(404).json({ message: 'Selected venue was not found.' });
    }

    const [conflicts] = await pool.query(
      `SELECT id
       FROM reservations
       WHERE venue_id = ?
         AND reservation_date = ?
         AND status <> 'cancelled'
         AND NOT (end_time <= ? OR start_time >= ?)
       LIMIT 1`,
      [venueId, reservationDate, startTime, endTime]
    );

    if (conflicts.length) {
      return res.status(409).json({ message: 'This venue is already booked for that time slot.' });
    }

    const [result] = await pool.query(
      `INSERT INTO reservations (user_id, venue_id, event_name, reservation_date, start_time, end_time, status)
       VALUES (?, ?, ?, ?, ?, ?, 'upcoming')`,
      [userId, venueId, eventName.trim(), reservationDate, startTime, endTime]
    );

    return res.status(201).json({
      message: 'Reservation created successfully.',
      reservationId: result.insertId
    });
  } catch (error) {
    if (isDbUnavailable(error)) {
      const venue = fallbackVenues.find((item) => item.id === Number(venueId));
      if (!venue) {
        return res.status(404).json({ message: 'Selected venue was not found.' });
      }

      const hasConflict = fallbackReservations.some(
        (reservation) =>
          reservation.venue_id === Number(venueId) &&
          reservation.reservation_date === reservationDate &&
          reservation.status !== 'cancelled' &&
          !(reservation.end_time <= startTime || reservation.start_time >= endTime)
      );
      if (hasConflict) {
        return res.status(409).json({ message: 'This venue is already booked for that time slot.' });
      }

      const id = ids.nextReservationId();
      fallbackReservations.push({
        id,
        user_id: userId,
        venue_id: Number(venueId),
        event_name: eventName.trim(),
        reservation_date: reservationDate,
        start_time: startTime,
        end_time: endTime,
        status: 'upcoming',
        venue_name: venue.name,
        location: venue.location,
        venue_type: venue.type
      });

      return res.status(201).json({ message: 'Reservation created successfully.', reservationId: id });
    }
    console.error('Error creating reservation:', error);
    return res.status(500).json({ message: 'Server error while creating reservation.' });
  }
};

// Get current user's bookings
export const getMyBookings = async (req, res) => {
  const userId = req.user.id;

  try {
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
    if (isDbUnavailable(error)) {
      const reservations = fallbackReservations
        .filter((reservation) => reservation.user_id === userId)
        .sort((a, b) => {
          const first = `${a.reservation_date} ${a.start_time}`;
          const second = `${b.reservation_date} ${b.start_time}`;
          return first.localeCompare(second);
        });
      return res.json(reservations);
    }
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error while fetching bookings.' });
  }
};

// Cancel an existing reservation (updates status)
export const cancelReservation = async (req, res) => {
  const reservationId = req.params.id;
  const userId = req.user.id;

  try {
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
    if (isDbUnavailable(error)) {
      const reservation = fallbackReservations.find((item) => item.id === Number(reservationId));

      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found.' });
      }
      if (reservation.user_id !== userId) {
        return res.status(403).json({ message: 'You can only cancel your own reservations.' });
      }
      if (reservation.status === 'cancelled') {
        return res.status(400).json({ message: 'Reservation is already cancelled.' });
      }

      reservation.status = 'cancelled';
      return res.json({ message: 'Reservation cancelled successfully.' });
    }
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: 'Server error while cancelling reservation.' });
  }
};
