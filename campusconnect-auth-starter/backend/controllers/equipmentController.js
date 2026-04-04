import { pool } from '../config/db.js';

export const createEquipmentRequest = async (req, res) => {
  try {
    const { reservation_id, projector, microphone, extra_chairs_count } = req.body;

    // The teammate's reservation system must provide the reservation_id
    if (!reservation_id) {
      return res.status(400).json({ message: 'Reservation ID is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO equipment_requests (reservation_id, projector, microphone, extra_chairs_count) VALUES (?, ?, ?, ?)',
      [
        reservation_id,
        projector ? 1 : 0,
        microphone ? 1 : 0,
        extra_chairs_count || 0
      ]
    );

    res.status(201).json({
      message: 'Equipment request saved successfully',
      requestId: result.insertId
    });
  } catch (error) {
    console.error('Error creating equipment request:', error);
    res.status(500).json({ message: 'Server error saving equipment request' });
  }
};
