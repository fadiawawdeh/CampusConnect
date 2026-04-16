import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { pool } from '../config/db.js';
import { generateToken } from '../utils/generateToken.js';
import { sendEmail } from '../utils/email.js';
import { fallbackUsers, ids, isDbUnavailable } from '../utils/fallbackStore.js';

const normalizeEmail = (email) => email?.trim().toLowerCase();

const ensureUniversityEmail = (email) => {
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid university email.');
  }
};

export const registerUser = async ({
  firstName,
  lastName,
  birthDate,
  birthCountry,
  birthCity,
  gender,
  address,
  phoneNumber,
  universityEmail,
  role,
  password,
  confirmPassword
}) => {
  if (
    !firstName ||
    !lastName ||
    !birthDate ||
    !birthCountry ||
    !birthCity ||
    !gender ||
    !universityEmail ||
    !password ||
    !confirmPassword
  ) {
    throw new Error('All mandatory registration fields must be filled.');
  }

  const normalizedEmail = normalizeEmail(universityEmail);
  ensureUniversityEmail(normalizedEmail);

  if (!['student', 'staff', 'club_organizer'].includes(role)) {
    throw new Error('Invalid role selected.');
  }

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  if (password.trim().length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  const passwordHash = await bcrypt.hash(password.trim(), 10);

  try {
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (existing.length) {
      throw new Error('This email is already registered.');
    }

    await pool.execute(
      `INSERT INTO users (
        first_name,
        last_name,
        birth_date,
        birth_country,
        birth_city,
        gender,
        address,
        phone_number,
        email,
        password_hash,
        role,
        is_verified,
        verification_token
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NULL)`,
      [
        firstName.trim(),
        lastName.trim(),
        birthDate,
        birthCountry.trim(),
        birthCity.trim(),
        gender,
        address?.trim() || null,
        phoneNumber?.trim() || null,
        normalizedEmail,
        passwordHash,
        role
      ]
    );
  } catch (error) {
    if (!isDbUnavailable(error)) {
      throw error;
    }

    const existingLocalUser = fallbackUsers.find((user) => user.email === normalizedEmail);
    if (existingLocalUser) {
      throw new Error('This email is already registered.');
    }

    fallbackUsers.push({
      id: ids.nextUserId(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      role,
      phone_number: phoneNumber?.trim() || null
    });
  }

  return {
    email: normalizedEmail,
    role,
    verificationUrl: null,
    emailMode: 'disabled'
  };
};

export const verifyEmailToken = async (token) => {
  if (!token) throw new Error('Verification token is required.');

  const [rows] = await pool.execute(
    'SELECT id FROM users WHERE verification_token = ?',
    [token]
  );

  if (!rows.length) throw new Error('Invalid or expired verification token.');

  await pool.execute(
    'UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?',
    [rows[0].id]
  );
};

export const loginUser = async ({ email, password, requiredRole = null }) => {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const normalizedEmail = normalizeEmail(email);

  let user = null;
  try {
    const [rows] = await pool.execute(
      'SELECT id, first_name, last_name, email, password_hash, role, is_verified FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (!rows.length) {
      throw new Error('Invalid email or password.');
    }

    user = rows[0];
  } catch (error) {
    if (!isDbUnavailable(error)) {
      throw error;
    }
    user = fallbackUsers.find((item) => item.email === normalizedEmail) || null;
    if (!user) {
      throw new Error('Invalid email or password.');
    }
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordCorrect) {
    throw new Error('Invalid email or password.');
  }

  if (requiredRole && user.role !== requiredRole) {
    throw new Error(`This login is only for ${requiredRole}.`);
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
    email: user.email
  });

  return {
    token,
    user: {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role
    }
  };
};

export const sendForgotPasswordEmail = async ({ email }) => {
  if (!email) throw new Error('Email is required.');

  const normalizedEmail = normalizeEmail(email);

  const [rows] = await pool.execute(
    'SELECT id, email FROM users WHERE email = ?',
    [normalizedEmail]
  );

  if (!rows.length) {
    throw new Error('No account found with that email.');
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await pool.execute(
    'UPDATE users SET reset_password_token = ?, reset_password_expires_at = ? WHERE id = ?',
    [hashedToken, expiresAt, rows[0].id]
  );

  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

  const emailResult = await sendEmail({
    to: normalizedEmail,
    subject: 'Reset your CampusConnect password',
    html: `
      <h2>Password Reset</h2>
      <p>You asked to reset your password.</p>
      <p>Click the link below to continue:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 30 minutes.</p>
    `,
    fallbackUrl: resetUrl
  });

  return {
    resetUrl: emailResult.fallbackUrl,
    emailMode: emailResult.mode
  };
};

export const resetPassword = async ({ token, newPassword, confirmPassword }) => {
  if (!token) throw new Error('Reset token is required.');
  if (!newPassword || !confirmPassword) {
    throw new Error('Both password fields are required.');
  }
  if (newPassword !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }
  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const [rows] = await pool.execute(
    'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires_at > NOW()',
    [hashedToken]
  );

  if (!rows.length) {
    throw new Error('Invalid or expired reset token.');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await pool.execute(
    `UPDATE users
     SET password_hash = ?, reset_password_token = NULL, reset_password_expires_at = NULL
     WHERE id = ?`,
    [passwordHash, rows[0].id]
  );
};

export const updateProfile = async (
  userId,
  { firstName, lastName, phoneNumber, email, currentPassword, newPassword }
) => {
  const [rows] = await pool.execute(
    'SELECT id, email, password_hash FROM users WHERE id = ?',
    [userId]
  );

  if (!rows.length) {
    throw new Error('User not found.');
  }

  const currentUser = rows[0];

  let nextEmail = currentUser.email;

  if (email && normalizeEmail(email) !== currentUser.email.toLowerCase()) {
    const normalizedEmail = normalizeEmail(email);
    ensureUniversityEmail(normalizedEmail);

    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND id <> ?',
      [normalizedEmail, userId]
    );

    if (existing.length) {
      throw new Error('This email is already used by another account.');
    }

    nextEmail = normalizedEmail;
  }

  let nextPasswordHash = currentUser.password_hash;

  if (newPassword) {
    if (!currentPassword) {
      throw new Error('Current password is required to set a new password.');
    }

    const matches = await bcrypt.compare(currentPassword, currentUser.password_hash);

    if (!matches) {
      throw new Error('Current password is incorrect.');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    nextPasswordHash = await bcrypt.hash(newPassword, 10);
  }

  await pool.execute(
    `UPDATE users
     SET first_name = COALESCE(?, first_name),
         last_name = COALESCE(?, last_name),
         phone_number = ?,
         email = ?,
         password_hash = ?
     WHERE id = ?`,
    [firstName || null, lastName || null, phoneNumber || null, nextEmail, nextPasswordHash, userId]
  );
};

export const deleteUserAccount = async (userId, password) => {
  if (!password) {
    throw new Error('Password confirmation is required.');
  }

  const [rows] = await pool.execute(
    'SELECT password_hash FROM users WHERE id = ?',
    [userId]
  );

  if (!rows.length) {
    throw new Error('User not found.');
  }

  const matches = await bcrypt.compare(password, rows[0].password_hash);

  if (!matches) {
    throw new Error('Password is incorrect.');
  }

  await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
};