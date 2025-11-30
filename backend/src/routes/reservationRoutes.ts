import express from 'express';
import { protect } from '../middleware/auth.js'; 
import Stripe from 'stripe';
import { createReservation, getReservationsByUser, cancelReservation, getReservationsForOwnerGarages } from '../services/reservationService.js';

// Verificar que el Payment Intent existe y está pagado
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover',
});

export const router = express.Router();

/**
 * POST /api/reservas
 * Crear una nueva reserva después de confirmar el pago
 */
router.post('/', async (req, res) => {
  try {
    const { usuario_id, garaje_id, fecha_inicio, fecha_fin, tipo_vehiculo, precio_total, payment_intent_id } = req.body;

    if (!usuario_id || !garaje_id || !fecha_inicio || !fecha_fin || !tipo_vehiculo || !precio_total || !payment_intent_id) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'El pago no ha sido completado exitosamente.' });
    }

    const reservation = await createReservation(
      usuario_id, 
      garaje_id, 
      fecha_inicio, 
      fecha_fin, 
      tipo_vehiculo, 
      precio_total, 
      payment_intent_id
    );
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
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const user_id = (req as any).user?.id;
    if (!user_id) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
    const reservations = await getReservationsByUser(Number(user_id));

    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error al obtener mis reservas:', error);
    res.status(500).json({ error: 'Error al obtener las reservas.' }); 
  }
});

/**
 * GET /api/reservas/received
 * Obtiene las reservas hechas en los parkings del usuario autenticado (Propietario).
 */
router.get('/received', protect, async (req, res) => {
  try {
    const owner_id = (req as any).user?.id;
    const reservations = await getReservationsForOwnerGarages(Number(owner_id));

    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error al obtener reservas recibidas:', error);
    res.status(500).json({ error: 'Error al obtener las reservas recibidas.' });
  }
});

/**
 * PUT /api/reservas/:id/cancel
 * Cancela una reserva existente
 */
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const { id } = req.params; 
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