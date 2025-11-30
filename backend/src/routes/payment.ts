import express, { Request, Response } from 'express';
import Stripe from 'stripe';

export const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover',
});

// Crear Payment Intent
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { amount, garageId, fechaInicio, fechaFin } = req.body;

    if (!amount || amount <= 0) { // Comprobamos que el monto es válido y positivo
      return res.status(400).json({ error: 'Monto inválido' });
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        garageId: garageId.toString(),
        fechaInicio,
        fechaFin,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error al crear el Payment Intent:', error);
    res.status(500).json({ error: 'Error al crear el intento de pago' });
  }
});