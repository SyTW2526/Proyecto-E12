import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import Stripe from 'stripe';

// Mock de Stripe
vi.mock('stripe', () => {
  const mockPaymentIntents = {
    create: vi.fn(),
  };

  return {
    default: class MockStripe {
      paymentIntents = mockPaymentIntents;
    },
  };
});

import { router } from '../routes/payment.js';

const app = express();
app.use(express.json());
app.use('/api/payment', router);

describe('Payment Routes - Unit Tests', () => {
  let mockStripeInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key';
    
    // Obtener la instancia mock de Stripe
    const StripeMock = vi.mocked(Stripe);
    mockStripeInstance = new StripeMock('sk_test_fake_key', { apiVersion: '2025-11-17.clover' });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/payment/create-payment-intent', () => {
    it('debería crear un Payment Intent correctamente', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret',
        amount: 5000,
        currency: 'eur',
        status: 'requires_payment_method',
      };

      vi.mocked(mockStripeInstance.paymentIntents.create).mockResolvedValue(mockPaymentIntent as any);

      const response = await request(app)
        .post('/api/payment/create-payment-intent')
        .send({
          amount: 50,
          garageId: 1,
          fechaInicio: '2025-12-10',
          fechaFin: '2025-12-15',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('clientSecret');
      expect(response.body).toHaveProperty('paymentIntentId');
      expect(response.body.clientSecret).toBe('pi_test_123_secret');
      expect(response.body.paymentIntentId).toBe('pi_test_123');
    });

    it('debería devolver 400 si el monto es inválido (negativo)', async () => {
      const response = await request(app)
        .post('/api/payment/create-payment-intent')
        .send({
          amount: -10,
          garageId: 1,
          fechaInicio: '2025-12-10',
          fechaFin: '2025-12-15',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Monto inválido');
    });

    it('debería devolver 400 si el monto es cero', async () => {
      const response = await request(app)
        .post('/api/payment/create-payment-intent')
        .send({
          amount: 0,
          garageId: 1,
          fechaInicio: '2025-12-10',
          fechaFin: '2025-12-15',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Monto inválido');
    });

    it('debería devolver 400 si falta el monto', async () => {
      const response = await request(app)
        .post('/api/payment/create-payment-intent')
        .send({
          garageId: 1,
          fechaInicio: '2025-12-10',
          fechaFin: '2025-12-15',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Monto inválido');
    });

    it('debería crear Payment Intent con captura manual', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_456',
        client_secret: 'pi_test_456_secret',
        amount: 10000,
        currency: 'eur',
        capture_method: 'manual',
      };

      vi.mocked(mockStripeInstance.paymentIntents.create).mockResolvedValue(mockPaymentIntent as any);

      await request(app)
        .post('/api/payment/create-payment-intent')
        .send({
          amount: 100,
          garageId: 2,
          fechaInicio: '2025-12-20',
          fechaFin: '2025-12-25',
        });

      expect(mockStripeInstance.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          capture_method: 'manual',
          payment_method_types: ['card'],
        })
      );
    });

    it('debería incluir metadata en el Payment Intent', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_789',
        client_secret: 'pi_test_789_secret',
      };

      vi.mocked(mockStripeInstance.paymentIntents.create).mockResolvedValue(mockPaymentIntent as any);

      await request(app)
        .post('/api/payment/create-payment-intent')
        .send({
          amount: 75,
          garageId: 3,
          fechaInicio: '2025-12-15',
          fechaFin: '2025-12-18',
        });

      expect(mockStripeInstance.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            garageId: '3',
            fechaInicio: '2025-12-15',
            fechaFin: '2025-12-18',
          },
        })
      );
    });

    it('debería convertir el monto a centavos correctamente', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_999',
        client_secret: 'pi_test_999_secret',
      };

      vi.mocked(mockStripeInstance.paymentIntents.create).mockResolvedValue(mockPaymentIntent as any);

      await request(app)
        .post('/api/payment/create-payment-intent')
        .send({
          amount: 25.50,
          garageId: 1,
          fechaInicio: '2025-12-10',
          fechaFin: '2025-12-12',
        });

      expect(mockStripeInstance.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 2550, // 25.50 * 100
          currency: 'eur',
        })
      );
    });

    it('debería manejar errores de Stripe correctamente', async () => {
      vi.mocked(mockStripeInstance.paymentIntents.create).mockRejectedValue(
        new Error('Stripe API error')
      );

      const response = await request(app)
        .post('/api/payment/create-payment-intent')
        .send({
          amount: 50,
          garageId: 1,
          fechaInicio: '2025-12-10',
          fechaFin: '2025-12-15',
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Error al crear el intento de pago');
    });
  });
});
