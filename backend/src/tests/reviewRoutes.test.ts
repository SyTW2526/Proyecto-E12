import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { router } from '../routes/reviewRoutes';
import pool from '../db/pool';

// Mock del pool de base de datos
vi.mock('../db/pool', () => ({
  default: {
    query: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/reviews', router);

describe('Review Routes - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/reviews', () => {
    it('debería crear una reseña correctamente', async () => {
      const mockReview = {
        id: 1,
        garaje_id: 1,
        usuario_id: 2,
        calificacion: 5,
        comentario: 'Excelente garaje',
        fecha_creacion: new Date().toISOString(),
      };

      vi.mocked(pool.query).mockResolvedValue({
        rows: [mockReview],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app)
        .post('/api/reviews')
        .send({
          garaje_id: 1,
          usuario_id: 2,
          calificacion: 5,
          comentario: 'Excelente garaje',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockReview);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('debería devolver 400 si faltan campos obligatorios', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .send({
          garaje_id: 1,
          // Faltan usuario_id y calificacion
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('campos requeridos');
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('debería devolver 400 si la calificación es menor que 1', async () => {
      // Nota: 0 es falsy, por lo que primero falla la validación de campo requerido
      // Usamos un string vacío o null para probar el rango
      const response = await request(app)
        .post('/api/reviews')
        .send({
          garaje_id: 1,
          usuario_id: 2,
          calificacion: -1, // Valor negativo para que pase la validación de existencia
          comentario: 'Test',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('entre 1 y 5');
    });

    it('debería devolver 400 si la calificación es mayor que 5', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .send({
          garaje_id: 1,
          usuario_id: 2,
          calificacion: 6,
          comentario: 'Test',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('entre 1 y 5');
    });

    it('debería manejar errores de base de datos', async () => {
      vi.mocked(pool.query).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/reviews')
        .send({
          garaje_id: 1,
          usuario_id: 2,
          calificacion: 5,
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/reviews', () => {
    it('debería devolver todas las reseñas sin filtros', async () => {
      const mockReviews = [
        {
          id: 1,
          garaje_id: 1,
          usuario_id: 2,
          calificacion: 5,
          comentario: 'Excelente',
          usuario_nombre: 'Juan',
          garaje_direccion: 'Calle Test',
        },
        {
          id: 2,
          garaje_id: 2,
          usuario_id: 3,
          calificacion: 4,
          comentario: 'Muy bien',
          usuario_nombre: 'María',
          garaje_direccion: 'Avenida Principal',
        },
      ];

      vi.mocked(pool.query).mockResolvedValue({
        rows: mockReviews,
        command: 'SELECT',
        rowCount: 2,
        oid: 0,
        fields: [],
      });

      const response = await request(app).get('/api/reviews');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReviews);
      expect(response.body).toHaveLength(2);
    });

    it('debería filtrar reseñas por garaje_id', async () => {
      const mockReviews = [
        {
          id: 1,
          garaje_id: 1,
          usuario_id: 2,
          calificacion: 5,
          comentario: 'Excelente',
        },
      ];

      vi.mocked(pool.query).mockResolvedValue({
        rows: mockReviews,
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app).get('/api/reviews?garaje_id=1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('debería filtrar reseñas por calificacion_min', async () => {
      const mockReviews = [
        {
          id: 1,
          garaje_id: 1,
          usuario_id: 2,
          calificacion: 5,
        },
      ];

      vi.mocked(pool.query).mockResolvedValue({
        rows: mockReviews,
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app).get('/api/reviews?calificacion_min=4');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('debería devolver 404 si no hay reseñas', async () => {
      vi.mocked(pool.query).mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const response = await request(app).get('/api/reviews');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/reviews/garaje/:garaje_id', () => {
    it('debería devolver las reseñas de un garaje específico', async () => {
      const mockReviews = [
        {
          id: 1,
          garaje_id: 1,
          usuario_id: 2,
          calificacion: 5,
          comentario: 'Excelente',
          usuario_nombre: 'Juan',
          usuario_email: 'juan@test.com',
          garaje_direccion: 'Calle Test',
        },
      ];

      vi.mocked(pool.query).mockResolvedValue({
        rows: mockReviews,
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app).get('/api/reviews/garaje/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReviews);
      expect(response.body).toHaveLength(1);
    });

    it('debería devolver 404 si no hay reseñas para el garaje', async () => {
      vi.mocked(pool.query).mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const response = await request(app).get('/api/reviews/garaje/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('No se encontraron reseñas');
    });
  });

  describe('PATCH /api/reviews/:id', () => {
    it('debería actualizar una reseña correctamente', async () => {
      const mockUpdatedReview = {
        id: 1,
        garaje_id: 1,
        usuario_id: 2,
        calificacion: 4,
        comentario: 'Actualizado',
      };

      vi.mocked(pool.query).mockResolvedValue({
        rows: [mockUpdatedReview],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app)
        .patch('/api/reviews/1')
        .send({
          calificacion: 4,
          comentario: 'Actualizado',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedReview);
    });

    it('debería devolver 400 si no se proporcionan campos', async () => {
      const response = await request(app)
        .patch('/api/reviews/1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debería devolver 400 si se intenta actualizar campos no permitidos', async () => {
      const response = await request(app)
        .patch('/api/reviews/1')
        .send({
          garaje_id: 2, // Campo no permitido
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('no permitida');
    });

    it('debería devolver 400 si la calificación está fuera de rango', async () => {
      const response = await request(app)
        .patch('/api/reviews/1')
        .send({
          calificacion: 6,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('entre 1 y 5');
    });

    it('debería devolver 404 si la reseña no existe', async () => {
      vi.mocked(pool.query).mockResolvedValue({
        rows: [],
        command: 'UPDATE',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const response = await request(app)
        .patch('/api/reviews/999')
        .send({
          calificacion: 4,
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    it('debería eliminar una reseña correctamente', async () => {
      const mockDeletedReview = {
        id: 1,
        garaje_id: 1,
        usuario_id: 2,
        calificacion: 5,
        comentario: 'Excelente',
      };

      vi.mocked(pool.query).mockResolvedValue({
        rows: [mockDeletedReview],
        command: 'DELETE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app).delete('/api/reviews/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDeletedReview);
    });

    it('debería devolver 404 si la reseña no existe', async () => {
      vi.mocked(pool.query).mockResolvedValue({
        rows: [],
        command: 'DELETE',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const response = await request(app).delete('/api/reviews/999');

      expect(response.status).toBe(404);
    });
  });
});
