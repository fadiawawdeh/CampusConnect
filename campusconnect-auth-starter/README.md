# CampusConnect Sprint 1 (Security)


## Covered PBIs
1. Security | Administrator Login
2. Security | Logout
3. Security | Create Account
4. Security | Role-Based Login
5. Security | Delete Account
6. Security | Edit Account
7. Security | Reset Password


## Stack
- Frontend: React
- Backend: Node.js + Express
- Database: MySQL

## Main auth features
- Manual admin seed in database
- Registration with mandatory fields from the backlog
- University email validation
- Email verification
- Role-based login
- Admin-only login
- Logout
- Edit account
- Delete account
- Forgot password email
- Reset password via token link


## Local development email behavior
If SMTP is not configured in `backend/.env`, registration and forgot-password still work in development mode.
The API returns a verification or reset link directly, and the frontend shows that link on screen.
This avoids the `ECONNREFUSED 127.0.0.1:587` error when no local mail server exists.

---

## CampusConnect Sprint 1 (Venue & Reservation Management)
*Implemented by Ali Kanjo*

### Covered PBIs
1. Venue Management | Add Campus Venue
2. Reservation Management | View My Bookings
3. Reservation Management | Cancel Reservation

### Main Sprint 1 Features
- **Database Schema Updates:** Added the `venues` and `reservations` tables to `schema.sql` with correct field types and ENUMs (upcoming, cancelled, pending_approval).
- **Backend APIs:**
  - `POST /api/venues` (Admin only)
  - `GET /api/reservations/my-bookings`
  - `PUT /api/reservations/:id/cancel`
- **Frontend Components:**
  - `AdminAddVenue.jsx` + `AdminAddVenue.css`
  - `UserBookings.jsx` + `UserBookings.css`
- **Security Validation:** Ensure users can only cancel their own created reservations via JWT token matching.
