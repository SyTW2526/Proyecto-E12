import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import pool from '../db/pool.js';
import jwt from 'jsonwebtoken';

// Mock del pool de base de datos
vi.mock('../db/pool', () => ({
  default: {
    query: vi.fn(),
  },
}));

// Mock del middleware protect
vi.mock('../middleware/auth.js', () => ({
  protect: async (req: any, res: any, next: any) => {
    // Simular usuario autenticado
    req.user = { id: 1, email: 'test@test.com', nombre: 'Test User' };
    next();
  },
}));

// Mock de axios para evitar llamadas reales a la API de geocodificación
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: [{
        lat: '40.4168',
        lon: '-3.7038'
      }]
    })
  }
}));

import { router } from '../routes/garageRoutes.js';

const app = express();
app.use(express.json());
// Middleware para simular cookies
app.use((req, res, next) => {
  const token = jwt.sign({ id: 1 }, 'test-secret');
  req.cookies = { token };
  next();
});
app.use('/api/garages', router);

describe('Garage Routes - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/garages', () => {
    it('debería crear un garaje correctamente con todos los campos', async () => {
      const mockGarage = {
        id: 1,
        propietario_id: 1,
        direccion: 'Calle Test 123',
        descripcion: 'Garaje de prueba',
        imagen_garaje: null,
        precio: '15.50',
        disponible: true,
        fecha_creacion: new Date().toISOString(),
      };

      vi.mocked(pool.query).mockResolvedValue({
        rows: [mockGarage],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app)
        .post('/api/garages')
        .send({
          direccion: 'Calle Test 123',
          descripcion: 'Garaje de prueba',
          precio: 15.50,
          disponible: true,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockGarage);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('debería devolver 400 si faltan campos obligatorios', async () => {
      const response = await request(app)
        .post('/api/garages')
        .send({
          direccion: 'Calle Test 123',
          // Falta propietario_id y precio
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('campos requeridos');
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('debería manejar errores de base de datos', async () => {
      vi.mocked(pool.query).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/garages')
        .send({
          propietario_id: 1,
          direccion: 'Calle Test 123',
          precio: 15.50,
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('debería crear un garaje con disponible=true por defecto', async () => {
      const mockGarage = {
        id: 1,
        propietario_id: 1,
        direccion: 'Calle Test 123',
        descripcion: null,
        imagen_garaje: null,
        precio: '15.50',
        disponible: true,
        fecha_creacion: new Date().toISOString(),
      };

      vi.mocked(pool.query).mockResolvedValue({
        rows: [mockGarage],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app)
        .post('/api/garages')
        .send({
          propietario_id: 1,
          direccion: 'Calle Test 123',
          precio: 15.50,
          // No se especifica disponible
        });

      expect(response.status).toBe(201);
      expect(response.body.disponible).toBe(true);
    });
  });

  describe('GET /api/garages', () => {
    it('debería devolver todos los garajes sin filtros', async () => {
      const mockGarages = [
        {
          id: 1,
          propietario_id: 1,
          direccion: 'Calle Test 123',
          precio: '15.50',
          disponible: true,
        },
        {
          id: 2,
          propietario_id: 2,
          direccion: 'Avenida Principal 456',
          precio: '20.00',
          disponible: false,
        },
      ];

      vi.mocked(pool.query).mockResolvedValue({
        rows: mockGarages,
        command: 'SELECT',
        rowCount: 2,
        oid: 0,
        fields: [],
      });

      const response = await request(app).get('/api/garages');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGarages);
      expect(response.body).toHaveLength(2);
    });

    it('debería filtrar garajes por disponibilidad', async () => {
      const mockGarages = [
        {
          id: 1,
          propietario_id: 1,
          direccion: 'Calle Test 123',
          precio: '15.50',
          disponible: true,
        },
      ];

      vi.mocked(pool.query).mockResolvedValue({
        rows: mockGarages,
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app).get('/api/garages?disponible=true');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].disponible).toBe(true);
    });

    it('debería filtrar garajes por rango de precio', async () => {
      const mockGarages = [
        {
          id: 1,
          propietario_id: 1,
          direccion: 'Calle Test 123',
          precio: '15.50',
          disponible: true,
        },
      ];

      vi.mocked(pool.query).mockResolvedValue({
        rows: mockGarages,
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app).get('/api/garages?precio_min=10&precio_max=20');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('debería devolver 404 si no hay garajes', async () => {
      vi.mocked(pool.query).mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const response = await request(app).get('/api/garages');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/garages/:id', () => {
    it('debería devolver un garaje por ID', async () => {
      const mockGarage = {
        id: 1,
        propietario_id: 1,
        direccion: 'Calle Test 123',
        precio: '15.50',
        disponible: true,
      };

      vi.mocked(pool.query).mockResolvedValue({
        rows: [mockGarage],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app).get('/api/garages/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGarage);
      expect(response.body.id).toBe(1);
    });

    it('debería devolver 404 si el garaje no existe', async () => {
      vi.mocked(pool.query).mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const response = await request(app).get('/api/garages/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('no encontrado');
    });
  });

  describe('PATCH /api/garages/:id', () => {
    it('debería actualizar un garaje correctamente', async () => {
      const mockUpdatedGarage = {
        id: 1,
        propietario_id: 1,
        direccion: 'Calle Actualizada 123',
        precio: '20.00',
        disponible: false,
      };

      vi.mocked(pool.query).mockResolvedValue({
        rows: [mockUpdatedGarage],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app)
        .patch('/api/garages/1')
        .send({
          direccion: 'Calle Actualizada 123',
          precio: 20.00,
          disponible: false,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedGarage);
    });

    it('debería devolver 400 si no se proporcionan campos', async () => {
      // Mock de la query de verificación
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [{ id: 1, propietario_id: 1 }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app)
        .patch('/api/garages/1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debería devolver 400 si se intenta actualizar campos no permitidos', async () => {
      // Mock de la query de verificación
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [{ id: 1, propietario_id: 1 }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app)
        .patch('/api/garages/1')
        .send({
          id: 999, // Campo no permitido
          propietario_id: 2, // Campo no permitido
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('al menos un campo');
    });

    it('debería devolver 404 si el garaje no existe', async () => {
      vi.mocked(pool.query).mockResolvedValue({
        rows: [],
        command: 'UPDATE',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const response = await request(app)
        .patch('/api/garages/999')
        .send({
          precio: 20.00,
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/garages/:id', () => {
    it('debería eliminar un garaje correctamente', async () => {
      const mockDeletedGarage = {
        id: 1,
        propietario_id: 1,
        direccion: 'Calle Test 123',
        precio: '15.50',
        disponible: true,
      };

      vi.mocked(pool.query).mockResolvedValue({
        rows: [mockDeletedGarage],
        command: 'DELETE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app).delete('/api/garages/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDeletedGarage);
    });

    it('debería devolver 404 si el garaje no existe', async () => {
      vi.mocked(pool.query).mockResolvedValue({
        rows: [],
        command: 'DELETE',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const response = await request(app).delete('/api/garages/999');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/garages/:id/reservations', () => {
    it('debería devolver las reservas de un garaje', async () => {
      const mockReservations = [
        {
          id: 1,
          garaje_id: 1,
          usuario_id: 2,
          fecha_inicio: '2025-11-01',
          fecha_fin: '2025-11-02',
          usuario_nombre: 'Juan Pérez',
          usuario_email: 'juan@test.com',
        },
      ];

      vi.mocked(pool.query).mockResolvedValue({
        rows: mockReservations,
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app).get('/api/garages/1/reservations');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReservations);
      expect(response.body).toHaveLength(1);
    });
  });

  describe('GET /api/garages/:id/reviews', () => {
    it('debería devolver las reseñas de un garaje', async () => {
      const mockReviews = [
        {
          id: 1,
          garaje_id: 1,
          usuario_id: 2,
          calificacion: 5,
          comentario: 'Excelente',
          usuario_nombre: 'Juan Pérez',
        },
      ];

      vi.mocked(pool.query).mockResolvedValue({
        rows: mockReviews,
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app).get('/api/garages/1/reviews');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReviews);
      expect(response.body).toHaveLength(1);
    });
  });
});
