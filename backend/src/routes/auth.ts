import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';

const router = express.Router();

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
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const userExists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  
  if (userExists.rows.length > 0) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await pool.query(
    'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING *',
    [nombre, email, hashedPassword]
  );

  const token = generateToken(newUser.rows[0].id);
  res.cookie('token', token, cookieOptions);
  return res.status(201).json({ user: newUser.rows[0] });
});

