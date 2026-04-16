import bcrypt from 'bcryptjs';

export const isDbUnavailable = (error) => error?.code === 'ECONNREFUSED';

let nextUserId = 2;
let nextVenueId = 3;
let nextReservationId = 1;
let nextEquipmentRequestId = 1;

export const fallbackUsers = [
  {
    id: 1,
    first_name: 'System',
    last_name: 'Administrator',
    email: 'admin@campusconnect.local',
    password_hash: bcrypt.hashSync('Admin123!', 10),
    role: 'admin',
    phone_number: null
  }
];

export const fallbackVenues = [
  { id: 1, name: 'Main Auditorium', location: 'Building A', capacity: 200, type: 'auditorium' },
  { id: 2, name: 'Study Room 101', location: 'Library Floor 1', capacity: 20, type: 'study_room' }
];

export const fallbackReservations = [];
export const fallbackEquipmentRequests = [];

export const ids = {
  nextUserId: () => nextUserId++,
  nextVenueId: () => nextVenueId++,
  nextReservationId: () => nextReservationId++,
  nextEquipmentRequestId: () => nextEquipmentRequestId++
};
