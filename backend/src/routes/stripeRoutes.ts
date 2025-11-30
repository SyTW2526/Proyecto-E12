import express from 'express';
import Stripe from 'stripe';
import { protect } from '../middleware/auth.js';

export const router = express.Router();

// Crear objeto stripe para usar la api
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover',
});

/**
 * Permitir que un usuario complete el proceso de verificación de pagos para convertirse en un Stripe Connected Account.
 */
router.post('/onboard-link', protect, async (req: any, res) => {
  try {
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: 'accountId es requerido' });
    }

    // Verificar que la cuenta pertenece al usuario autenticado
    if (req.user.stripe_account_id !== accountId) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a esta cuenta' });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.CLIENT_URL}/stripe-refresh`,
      return_url: `${process.env.CLIENT_URL}/stripe-success`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error: any) {
    console.error('Error creando Account Link:', error);
    res.status(500).json({ error: 'Error al crear link de onboarding', details: error.message });
  }
});

/**
 * @route POST /api/stripe/create-payment-intent
 * @description Crea un Payment Intent para una reserva con application fee para el propietario
 * @param garageId - ID del garaje a reservar
 * @param startDate - Fecha de inicio de la reserva
 * @param endDate - Fecha de fin de la reserva
 * @returns clientSecret del Payment Intent
 */
router.post('/create-payment-intent', protect, async (req: any, res) => {
  try {
    const { garageId, startDate, endDate } = req.body;

    if (!garageId || !startDate || !endDate) {
      return res.status(400).json({ error: 'garageId, startDate y endDate son requeridos' });
    }

    // Obtener información del garaje
    const pool = (await import('../db/pool.js')).default;
    const garageQuery = await pool.query(
      `SELECT g.*, u.stripe_account_id 
       FROM garaje g
       JOIN usuario u ON g.propietario_id = u.id
       WHERE g.id = $1`,
      [garageId]
    );

    if (garageQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Garaje no encontrado' });
    }

    const garage = garageQuery.rows[0];

    if (!garage.stripe_account_id) {
      return res.status(400).json({ error: 'El propietario del garaje no tiene configurado Stripe' });
    }

    // Calcular la duración en horas
    const start = new Date(startDate);
    const end = new Date(endDate);
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));

    if (hours <= 0) {
      return res.status(400).json({ error: 'La fecha de fin debe ser posterior a la fecha de inicio' });
    }

    // Calcular precio total (precio por hora * horas)
    const totalPrice = garage.precio * hours;

    const applicationFee = Math.round(totalPrice * 0.10 * 100); // COMISION

    // Crear Payment Intent con destination charge
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: 'eur',
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: garage.stripe_account_id,
      },
      metadata: {
        garage_id: garageId.toString(),
        user_id: req.user.id.toString(),
        start_date: startDate,
        end_date: endDate,
        hours: hours.toString(),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      totalPrice: totalPrice,
      hours: hours,
      applicationFee: applicationFee / 100,
    });
  } catch (error: any) {
    console.error('Error creando Payment Intent:', error);
    res.status(500).json({ error: 'Error al crear el pago', details: error.message });
  }
});

export default router;
