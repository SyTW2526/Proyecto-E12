// routes/reservationRoutes.ts
import express from 'express';
import {
  createReservation,
  getReservationsByUser,
  cancelReservation,
  getReservationsByGarage,
} from '../services/reservationService';

const router = express.Router();

/**
 * POST /api/reservas
 * Crear una nueva reserva
 */
router.post('/', async (req, res) => {
  try {
    const { usuario_id, garaje_id, fecha_inicio, fecha_fin } = req.body;

    if (!usuario_id || !garaje_id || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    const reservation = await createReservation(usuario_id, garaje_id, fecha_inicio, fecha_fin);
    res.status(201).json(reservation);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error al crear la reserva.' });
  }
});

/**
 * GET /api/reservas/:user_id
 * Obtiene todas las reservas de un usuario
 */
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const reservations = await getReservationsByUser(Number(user_id));

    if (reservations.length === 0) {
      return res.status(404).json({ message: 'No se encontraron reservas para este usuario.' });
    }

    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error al obtener las reservas.' });
  }
});

/**
 * PUT /api/reservas/:id/cancel
 * Cancela una reserva existente
 */
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await cancelReservation(Number(id));

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada.' });
    }

    res.status(200).json(reservation);
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ error: 'Error al cancelar la reserva.' });
  }
});

/**
 * GET /api/reservas/spot/:garaje_id
 * Obtiene las reservas asociadas a un garaje
 */
router.get('/spot/:garaje_id', async (req, res) => {
  try {
    const { garaje_id } = req.params;
    const reservations = await getReservationsByGarage(Number(garaje_id));

    if (reservations.length === 0) {
      return res.status(404).json({ message: 'No se encontraron reservas para este garaje.' });
    }

    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error al obtener reservas del garaje:', error);
    res.status(500).json({ error: 'Error al obtener reservas del garaje.' });
  }
});

export default router;
