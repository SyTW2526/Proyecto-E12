import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';
import { protect } from '../middleware/auth.js';

export const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const generateToken = (userId: number) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

// Register a new user
router.post('/register', async (req, res) => {
  const { nombre, email, contrasena } = req.body;

  if (!nombre || !email || !contrasena) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const userExists = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
  
  if (userExists.rows.length > 0) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedContrasena = await bcrypt.hash(contrasena, 10);

  const newUser = await pool.query(
    'INSERT INTO usuario (nombre, email, contrasena) VALUES ($1, $2, $3) RETURNING *',
    [nombre, email, hashedContrasena]
  );

  const token = generateToken(newUser.rows[0].id);
  res.cookie('token', token, cookieOptions);
  return res.status(201).json({ user: newUser.rows[0] });
});

// Login User
router.post('/login', async (req, res) => {
  const { email, contrasena } = req.body;

  if (!email || !contrasena) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const user = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
  
  if (user.rows.length === 0) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const userData = user.rows[0];
  const isMatch = await bcrypt.compare(contrasena, userData.contrasena);

  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(userData.id);
  res.cookie('token', token, cookieOptions);
  return res.status(200).json({ user: userData });
});

// Me
router.get('/me', protect, async (req, res) => {
  res.json((req as any).user);
});

// Logout User
router.post('/logout', (req, res) => {
  res.cookie('token', '', { ...cookieOptions, maxAge: 1 });
  return res.status(200).json({ message: 'Logged out successfully' });
});