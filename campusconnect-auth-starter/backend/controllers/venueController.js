import { pool } from '../config/db.js';

export const createVenue = async (req, res) => {
  const { name, location, capacity, type } = req.body;

  if (!name || !location || !capacity) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO venues (name, location, capacity, type) VALUES (?, ?, ?, ?)',
      [name, location, capacity, type || 'other']
    );

    res.status(201).json({
      message: 'Venue created successfully',
      venueId: result.insertId,
    });
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ message: 'Server error while creating venue.' });
  }
};

export const getVenues = async (req, res) => {
  try {
    const [venues] = await pool.query('SELECT * FROM venues ORDER BY name ASC');
    res.json(venues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ message: 'Server error while fetching venues.' });
  }
};
