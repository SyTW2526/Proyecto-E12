import express from 'express';
import { protect } from '../middleware/auth.js'; 
import Stripe from 'stripe';
import pool from '../db/pool.js';

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

    // Verificar que el pago fue exitoso
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'El pago no ha sido completado exitosamente.' });
    }

    // Crear la reserva
    const query = `
      INSERT INTO reserva (usuario_id, garaje_id, fecha_inicio, fecha_fin, tipo_vehiculo, precio_total, payment_intent_id, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'activa')
      RETURNING *;
    `;
    const result = await pool.query(query, [
      usuario_id,
      garaje_id,
      fecha_inicio,
      fecha_fin,
      tipo_vehiculo,
      precio_total,
      payment_intent_id,
    ]);

    res.status(201).json(result.rows[0]);
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

    const query = `
      SELECT id, usuario_id, garaje_id, fecha_inicio, fecha_fin, estado, precio_total
      FROM reserva
      WHERE usuario_id = $1
      ORDER BY fecha_inicio DESC;
    `;
    const result = await pool.query(query, [user_id]);

    const reservations = result.rows.map(row => ({
      ...row,
      precio_total: row.precio_total !== null ? Number(row.precio_total) : 0,
    }));

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

    const query = `
      SELECT r.id, r.usuario_id, r.garaje_id, r.fecha_inicio, r.fecha_fin, r.estado, r.precio_total
      FROM reserva r
      JOIN garaje g ON r.garaje_id = g.id
      WHERE g.propietario_id = $1
      ORDER BY r.fecha_inicio DESC;
    `;
    const result = await pool.query(query, [owner_id]);

    const reservations = result.rows.map(row => ({
      ...row,
      precio_total: Number(row.precio_total),
    }));

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

    const query = `
      UPDATE reserva
      SET estado = 'cancelada'
      WHERE id = $1 AND estado != 'completada'
      RETURNING id, usuario_id, garaje_id, fecha_inicio, fecha_fin, estado, precio_total;
    `;
    const result = await pool.query(query, [id]);

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Reserva no encontrada o no cancelable.' });
    }

    const reservation = {
      ...result.rows[0],
      precio_total: result.rows[0].precio_total !== null ? Number(result.rows[0].precio_total) : 0,
    };

    res.status(200).json(reservation);
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ error: 'Error al cancelar la reserva.' });
  }
});

export default router;