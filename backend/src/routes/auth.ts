import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { pool } from '../db/pool.js';
import { protect } from '../middleware/auth.js';

export const router = express.Router();
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
  }
});

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
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
  
  const userData = newUser.rows[0];
  
  // Convertir imagen BYTEA a base64 si existe
  if (userData.imagen_perfil) {
    userData.imagen = `data:image/jpeg;base64,${userData.imagen_perfil.toString('base64')}`;
    delete userData.imagen_perfil;
  }
  
  return res.status(201).json({ user: userData });
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
  // Convertir imagen BYTEA a base64 si existe
  if (userData.imagen_perfil) {
    userData.imagen = `data:image/jpeg;base64,${userData.imagen_perfil.toString('base64')}`;
    delete userData.imagen_perfil;
  }
  
  return res.status(200).json({ user: userData });
});

// Me
router.get('/me', protect, async (req, res) => {
  const user = (req as any).user;
  
  // Convertir imagen BYTEA a base64 si existe
  if (user.imagen_perfil) {
    user.imagen = `data:image/jpeg;base64,${user.imagen_perfil.toString('base64')}`;
    delete user.imagen_perfil;
  }
  
  res.json(user);
});

// Logout User
router.post('/logout', (req, res) => {
  res.cookie('token', '', { ...cookieOptions, maxAge: 1 });
  return res.status(200).json({ message: 'Logged out successfully' });
});

// Update Profile
router.put('/updateUser', protect, upload.single('imagen'), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { nombre, email } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }

    // Verificar si el email ya existe (y no es del usuario actual)
    const emailExists = await pool.query(
      'SELECT * FROM usuario WHERE email = $1 AND id != $2',
      [email, userId]
    );

    if (emailExists.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está en uso' });
    }

    // Construir la consulta de actualización
    let updateQuery = 'UPDATE usuario SET nombre = $1, email = $2';
    const queryParams: any[] = [nombre, email];
    
    // Si hay una imagen nueva, agregarla a la consulta como BYTEA
    if (req.file) {
      updateQuery += ', imagen_perfil = $3 WHERE id = $4 RETURNING id, nombre, email, imagen_perfil, fecha_creacion';
      queryParams.push(req.file.buffer, userId);
    } else {
      updateQuery += ' WHERE id = $3 RETURNING id, nombre, email, imagen_perfil, fecha_creacion';
      queryParams.push(userId);
    }

    // Ejecutar la actualización
    const result = await pool.query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updatedUser = result.rows[0];
    
    // Convertir la imagen BYTEA a base64 si existe
    if (updatedUser.imagen_perfil) {
      updatedUser.imagen = `data:image/jpeg;base64,${updatedUser.imagen_perfil.toString('base64')}`;
      delete updatedUser.imagen_perfil;
    }

    return res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});