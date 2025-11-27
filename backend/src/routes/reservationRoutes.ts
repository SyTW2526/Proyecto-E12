// routes/reservationRoutes.ts
import express from 'express';
// 🚨 Importar el middleware 'protect'
import { protect } from '../middleware/auth.js'; 

import {
  createReservation,
  getReservationsByUser,
  cancelReservation,
  getReservationsForOwnerGarages, 
  // getReservationsByGarage, 
} from '../services/reservationService.js';

export const router = express.Router();

/**
 * POST /api/reservas
 * Crear una nueva reserva
 */
router.post('/', protect, async (req, res) => { // ⬅️ Usando 'protect'
  try {
    // Usamos req.user.id proporcionado por el middleware 'protect'
    const usuario_id = req.user?.id; 
    if (!usuario_id) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
    const { garaje_id, fecha_inicio, fecha_fin } = req.body;

    if (!usuario_id || !garaje_id || !fecha_inicio || !fecha_fin) {
      // Nota: Si el usuario_id viene de req.user, esto nunca debería fallar
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    const precio_total = 0; // Set the appropriate value for precio_total
    const reservation = await createReservation(Number(usuario_id), Number(garaje_id), fecha_inicio, fecha_fin, precio_total);
    res.status(201).json(reservation);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error al crear la reserva.' });
  }
});

/**
 * GET /api/reservas/my-bookings
 * Obtiene las reservas que el usuario autenticado ha hecho (Cliente).
 */
router.get('/my-bookings', protect, async (req, res) => { // ⬅️ Usando 'protect'
  console.log("DEBUG req.user =", req.user);
  try {
    const user_id = req.user?.id; // Obtenido de 'protect'
    if (!user_id) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
    const reservations = await getReservationsByUser(Number(user_id));

    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error al obtener mis reservas:', error);
    // Este mensaje genérico es el que veías en el frontend
    res.status(500).json({ error: 'Error al obtener las reservas.' }); 
  }
});

/**
 * GET /api/reservas/received
 * Obtiene las reservas hechas en los parkings del usuario autenticado (Propietario).
 */
router.get('/received', protect, async (req, res) => { // ⬅️ Usando 'protect'
  try {
    const owner_id = req.user?.id; // Obtenido de 'protect'
    const reservations = await getReservationsForOwnerGarages(Number(owner_id));

    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error al obtener reservas recibidas:', error);
    // Este mensaje genérico es el que veías en el frontend
    res.status(500).json({ error: 'Error al obtener las reservas recibidas.' });
  }
});

/**
 * PUT /api/reservas/:id/cancel
 * Cancela una reserva existente
 */
router.put('/:id/cancel', protect, async (req, res) => { // ⬅️ Usando 'protect'
  try {
    const { id } = req.params;
    // Opcional: Podrías verificar que req.user.id es el cliente o el dueño aquí
    
    const reservation = await cancelReservation(Number(id));

    if (!reservation) {
      return res.status(404).json({ error: 'Reserva no encontrada o no cancelable.' });
    }

    res.status(200).json(reservation);
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ error: 'Error al cancelar la reserva.' });
  }
});