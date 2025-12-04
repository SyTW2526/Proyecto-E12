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

