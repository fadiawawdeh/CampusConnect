# CampusConnect Sprint 1 Security Starter (Corrected)

This version follows the **first 7 security PBIs from the PBIList sheet**.

## Covered PBIs
1. Security | Administrator Login
2. Security | Logout
3. Security | Create Account
4. Security | Role-Based Login
5. Security | Delete Account
6. Security | Edit Account
7. Security | Reset Password

## Notes
- The Sprint 1 sheet and the master PBIList do not fully match.
- This implementation follows **PBIList**, because that is where the first 7 backlog items appear.
- Forgot-password email flow is included because it is required to reach Reset Password cleanly in the UI.

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
