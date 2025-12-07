import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { pool } from '../db/pool.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock del pool de base de datos
vi.mock('../db/pool', () => ({
  pool: {
    query: vi.fn(),
  },
}));

// Mock de bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

// Mock del middleware protect
vi.mock('../middleware/auth.js', () => ({
  protect: async (req: any, res: any, next: any) => {
    req.user = { 
      id: 1, 
      email: 'test@test.com', 
      nombre: 'Test User',
      fecha_creacion: new Date().toISOString()
    };
    next();
  },
}));

// Mock de multer
vi.mock('../utils/multer.js', () => ({
  upload: {
    single: () => (req: any, res: any, next: any) => {
      if (req.body.imagen) {
        req.file = {
          buffer: Buffer.from('fake-image-data'),
          mimetype: 'image/jpeg',
        };
      }
      next();
    },
  },
}));

// Mock de Resend
vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = {
        send: vi.fn().mockResolvedValue({ id: 'email-id' }),
      };
    },
  };
});

// Mock de React Email
vi.mock('@react-email/render', () => ({
  render: vi.fn().mockResolvedValue('<html>Email HTML</html>'),
}));

import { router } from '../routes/auth.js';

const app = express();
app.use(express.json());
app.use('/api/auth', router);

describe('Auth Routes - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('debería registrar un nuevo usuario correctamente', async () => {
      const mockUser = {
        id: 1,
        nombre: 'Test User',
        email: 'test@test.com',
        fecha_creacion: new Date().toISOString(),
      };

      vi.mocked(pool.query)
        .mockResolvedValueOnce({ rows: [], command: 'SELECT', rowCount: 0, oid: 0, fields: [] } as any) // Usuario no existe
        .mockResolvedValueOnce({ rows: [mockUser], command: 'INSERT', rowCount: 1, oid: 0, fields: [] } as any); // Crear usuario

      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test User',
          email: 'test@test.com',
          contrasena: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@test.com');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('debería devolver 400 si faltan campos requeridos', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test User',
          // Falta email y contraseña
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('All fields are required');
    });

    it('debería devolver 400 si el usuario ya existe', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [{ id: 1, email: 'test@test.com' }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      } as any);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test User',
          email: 'test@test.com',
          contrasena: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('debería hacer login correctamente con credenciales válidas', async () => {
      const mockUser = {
        id: 1,
        nombre: 'Test User',
        email: 'test@test.com',
        contrasena: 'hashed-password',
        fecha_creacion: new Date().toISOString(),
      };

      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [mockUser],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      } as any);

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          contrasena: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('debería devolver 400 si faltan campos', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          // Falta contraseña
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('All fields are required');
    });

    it('debería devolver 400 si el usuario no existe', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      } as any);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          contrasena: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('debería devolver 400 si la contraseña es incorrecta', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        contrasena: 'hashed-password',
      };

      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [mockUser],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      } as any);

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          contrasena: 'wrongpassword',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('debería devolver los datos del usuario autenticado', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('email', 'test@test.com');
      expect(response.body).toHaveProperty('nombre', 'Test User');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('debería hacer logout correctamente', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('PUT /api/auth/updateUser', () => {
    it('debería actualizar el perfil del usuario correctamente', async () => {
      const updatedUser = {
        id: 1,
        nombre: 'Updated Name',
        email: 'updated@test.com',
        fecha_creacion: new Date().toISOString(),
      };

      vi.mocked(pool.query)
        .mockResolvedValueOnce({ rows: [], command: 'SELECT', rowCount: 0, oid: 0, fields: [] } as any) // Email no existe
        .mockResolvedValueOnce({ rows: [updatedUser], command: 'UPDATE', rowCount: 1, oid: 0, fields: [] } as any); // Actualizar

      const response = await request(app)
        .put('/api/auth/updateUser')
        .send({
          nombre: 'Updated Name',
          email: 'updated@test.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Perfil actualizado exitosamente');
      expect(response.body.user.nombre).toBe('Updated Name');
    });

    it('debería devolver 400 si faltan campos requeridos', async () => {
      const response = await request(app)
        .put('/api/auth/updateUser')
        .send({
          nombre: 'Updated Name',
          // Falta email
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Nombre y email son requeridos');
    });

    it('debería devolver 400 si el email ya está en uso', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [{ id: 2, email: 'existing@test.com' }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      } as any);

      const response = await request(app)
        .put('/api/auth/updateUser')
        .send({
          nombre: 'Test User',
          email: 'existing@test.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('El email ya está en uso');
    });

    it('debería actualizar el perfil con imagen', async () => {
      const updatedUser = {
        id: 1,
        nombre: 'Updated Name',
        email: 'updated@test.com',
        imagen_perfil: Buffer.from('fake-image-data'),
        fecha_creacion: new Date().toISOString(),
      };

      vi.mocked(pool.query)
        .mockResolvedValueOnce({ rows: [], command: 'SELECT', rowCount: 0, oid: 0, fields: [] } as any)
        .mockResolvedValueOnce({ rows: [updatedUser], command: 'UPDATE', rowCount: 1, oid: 0, fields: [] } as any);

      const response = await request(app)
        .put('/api/auth/updateUser')
        .send({
          nombre: 'Updated Name',
          email: 'updated@test.com',
          imagen: 'fake-image-data',
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('imagen');
    });
  });
});
