import {
  registerUser,
  verifyEmailToken,
  loginUser,
  sendForgotPasswordEmail,
  resetPassword,
  updateProfile,
  deleteUserAccount
} from '../services/authService.js';
import { pool } from '../config/db.js';

const handleError = (res, error, fallback = 400) => res.status(fallback).json({ message: error.message || 'Something went wrong.' });

export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      message: result.emailMode === 'development'
        ? 'Registration successful. Email sending is disabled locally, so use the verification link below.'
        : 'Registration successful. Please check your email.',
      user: result,
      verificationUrl: result.verificationUrl || null
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    await verifyEmailToken(req.query.token);
    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    handleError(res, error);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const result = await sendForgotPasswordEmail(req.body);
    res.json({
      message: result.emailMode === 'development'
        ? 'Password reset email is disabled locally, so use the reset link below.'
        : 'Password reset email sent successfully.',
      resetUrl: result.resetUrl || null
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    await resetPassword(req.body);
    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    handleError(res, error);
  }
};

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    res.json({ message: 'Login successful.', ...result });
  } catch (error) {
    handleError(res, error, 401);
  }
};

export const adminLogin = async (req, res) => {
  try {
    const result = await loginUser({ ...req.body, requiredRole: 'admin' });
    res.json({ message: 'Admin login successful.', ...result });
  } catch (error) {
    handleError(res, error, 401);
  }
};

export const logout = async (_req, res) => res.json({ message: 'Logout successful. Remove token on client side.' });

export const getMe = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, first_name, last_name, email, role, phone_number FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    const user = rows[0];
    res.json({ user: { id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email, role: user.role, phoneNumber: user.phone_number } });
  } catch (error) {
    handleError(res, error, 500);
  }
};

export const updateMe = async (req, res) => {
  try {
    await updateProfile(req.user.id, req.body);
    res.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteMe = async (req, res) => {
  try {
    await deleteUserAccount(req.user.id, req.body.password);
    res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    handleError(res, error);
  }
};
