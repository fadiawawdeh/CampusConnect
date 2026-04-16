import { pool } from '../config/db.js';
import { fallbackVenues, ids, isDbUnavailable } from '../utils/fallbackStore.js';

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
    if (isDbUnavailable(error)) {
      const newVenue = {
        id: ids.nextVenueId(),
        name,
        location,
        capacity,
        type: type || 'other'
      };
      fallbackVenues.push(newVenue);
      return res.status(201).json({
        message: 'Venue created successfully',
        venueId: newVenue.id,
      });
    }
    console.error('Error creating venue:', error);
    res.status(500).json({ message: 'Server error while creating venue.' });
  }
};

export const getVenues = async (req, res) => {
  try {
    const [venues] = await pool.query('SELECT * FROM venues ORDER BY name ASC');
    res.json(venues);
  } catch (error) {
    if (isDbUnavailable(error)) {
      const sortedVenues = [...fallbackVenues].sort((a, b) => a.name.localeCompare(b.name));
      return res.json(sortedVenues);
    }
    console.error('Error fetching venues:', error);
    res.status(500).json({ message: 'Server error while fetching venues.' });
  }
};
