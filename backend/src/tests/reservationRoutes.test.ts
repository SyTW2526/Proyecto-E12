import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { router } from '../routes/reservationRoutes';
import * as reservationService from '../services/reservationService';

// Mock del servicio de reservas
vi.mock('../services/reservationService', () => ({
  createReservation: vi.fn(),
  getReservationsByUser: vi.fn(),
  cancelReservation: vi.fn(),
  getReservationsByGarage: vi.fn(),
}));

const app = express();
app.use(express.json());
app.use('/api/reservas', router);

describe('Reservation Routes - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/reservas', () => {
    it('debería crear una reserva correctamente', async () => {
      const mockReservation = {
        id: 1,
        usuario_id: 1,
        garaje_id: 1,
        fecha_inicio: '2025-11-20T10:00:00Z',
        fecha_fin: '2025-11-20T12:00:00Z',
        estado: 'pendiente' as const,
      };

      vi.mocked(reservationService.createReservation).mockResolvedValue(mockReservation);

      const response = await request(app)
        .post('/api/reservas')
        .send({
          usuario_id: 1,
          garaje_id: 1,
          fecha_inicio: '2025-11-20T10:00:00Z',
          fecha_fin: '2025-11-20T12:00:00Z',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockReservation);
      expect(reservationService.createReservation).toHaveBeenCalledWith(
        1,
        1,
        '2025-11-20T10:00:00Z',
        '2025-11-20T12:00:00Z'
      );
    });

    it('debería devolver 400 si faltan campos obligatorios', async () => {
      const response = await request(app)
        .post('/api/reservas')
        .send({
          usuario_id: 1,
          // Faltan garaje_id, fecha_inicio y fecha_fin
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('campos obligatorios');
      expect(reservationService.createReservation).not.toHaveBeenCalled();
    });

    it('debería manejar errores del servicio', async () => {
      vi.mocked(reservationService.createReservation).mockRejectedValue(
        new Error('Service error')
      );

      const response = await request(app)
        .post('/api/reservas')
        .send({
          usuario_id: 1,
          garaje_id: 1,
          fecha_inicio: '2025-11-20T10:00:00Z',
          fecha_fin: '2025-11-20T12:00:00Z',
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('debería crear una reserva sin todos los campos opcionales', async () => {
      const mockReservation = {
        id: 1,
        usuario_id: 1,
        garaje_id: 1,
        fecha_inicio: '2025-11-20T10:00:00Z',
        fecha_fin: '2025-11-20T12:00:00Z',
        estado: 'pendiente' as const,
      };

      vi.mocked(reservationService.createReservation).mockResolvedValue(mockReservation);

      const response = await request(app)
        .post('/api/reservas')
        .send({
          usuario_id: 1,
          garaje_id: 1,
          fecha_inicio: '2025-11-20T10:00:00Z',
          fecha_fin: '2025-11-20T12:00:00Z',
        });

      expect(response.status).toBe(201);
      expect(response.body.estado).toBe('pendiente');
    });
  });

  describe('GET /api/reservas/:user_id', () => {
    it('debería devolver las reservas de un usuario', async () => {
      const mockReservations = [
        {
          id: 1,
          usuario_id: 1,
          garaje_id: 1,
          fecha_inicio: '2025-11-20T10:00:00Z',
          fecha_fin: '2025-11-20T12:00:00Z',
          estado: 'pendiente' as const,
        },
        {
          id: 2,
          usuario_id: 1,
          garaje_id: 2,
          fecha_inicio: '2025-11-21T10:00:00Z',
          fecha_fin: '2025-11-21T12:00:00Z',
          estado: 'activa' as const,
        },
      ];

      vi.mocked(reservationService.getReservationsByUser).mockResolvedValue(mockReservations);

      const response = await request(app).get('/api/reservas/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReservations);
      expect(response.body).toHaveLength(2);
      expect(reservationService.getReservationsByUser).toHaveBeenCalledWith(1);
    });

    it('debería devolver 404 si no hay reservas para el usuario', async () => {
      vi.mocked(reservationService.getReservationsByUser).mockResolvedValue([]);

      const response = await request(app).get('/api/reservas/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No se encontraron reservas');
    });

    it('debería manejar errores del servicio', async () => {
      vi.mocked(reservationService.getReservationsByUser).mockRejectedValue(
        new Error('Service error')
      );

      const response = await request(app).get('/api/reservas/1');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/reservas/:id/cancel', () => {
    it('debería cancelar una reserva correctamente', async () => {
      const mockCancelledReservation = {
        id: 1,
        usuario_id: 1,
        garaje_id: 1,
        fecha_inicio: '2025-11-20T10:00:00Z',
        fecha_fin: '2025-11-20T12:00:00Z',
        estado: 'cancelada' as const,
      };

      vi.mocked(reservationService.cancelReservation).mockResolvedValue(
        mockCancelledReservation
      );

      const response = await request(app).put('/api/reservas/1/cancel');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCancelledReservation);
      expect(response.body.estado).toBe('cancelada');
      expect(reservationService.cancelReservation).toHaveBeenCalledWith(1);
    });

    it('debería devolver 404 si la reserva no existe', async () => {
      vi.mocked(reservationService.cancelReservation).mockResolvedValue(null);

      const response = await request(app).put('/api/reservas/999/cancel');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('no encontrada');
    });

    it('debería manejar errores del servicio', async () => {
      vi.mocked(reservationService.cancelReservation).mockRejectedValue(
        new Error('Service error')
      );

      const response = await request(app).put('/api/reservas/1/cancel');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/reservas/spot/:garaje_id', () => {
    it('debería devolver las reservas de un garaje', async () => {
      const mockReservations = [
        {
          id: 1,
          usuario_id: 1,
          garaje_id: 1,
          fecha_inicio: '2025-11-20T10:00:00Z',
          fecha_fin: '2025-11-20T12:00:00Z',
          estado: 'pendiente' as const,
        },
        {
          id: 2,
          usuario_id: 2,
          garaje_id: 1,
          fecha_inicio: '2025-11-21T10:00:00Z',
          fecha_fin: '2025-11-21T12:00:00Z',
          estado: 'activa' as const,
        },
      ];

      vi.mocked(reservationService.getReservationsByGarage).mockResolvedValue(mockReservations);

      const response = await request(app).get('/api/reservas/spot/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReservations);
      expect(response.body).toHaveLength(2);
      expect(reservationService.getReservationsByGarage).toHaveBeenCalledWith(1);
    });

    it('debería devolver 404 si no hay reservas para el garaje', async () => {
      vi.mocked(reservationService.getReservationsByGarage).mockResolvedValue([]);

      const response = await request(app).get('/api/reservas/spot/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No se encontraron reservas');
    });

    it('debería manejar errores del servicio', async () => {
      vi.mocked(reservationService.getReservationsByGarage).mockRejectedValue(
        new Error('Service error')
      );

      const response = await request(app).get('/api/reservas/spot/1');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
