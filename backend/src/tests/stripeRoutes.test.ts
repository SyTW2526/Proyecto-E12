import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import Stripe from 'stripe';

// Mock de Stripe
vi.mock('stripe', () => {
  const mockAccountLinks = {
    create: vi.fn(),
  };

  return {
    default: class MockStripe {
      accountLinks = mockAccountLinks;
    },
  };
});

// Mock del middleware protect
vi.mock('../middleware/auth.js', () => ({
  protect: async (req: any, res: any, next: any) => {
    req.user = {
      id: 1,
      email: 'test@test.com',
      nombre: 'Test User',
      stripe_account_id: 'acct_test_123',
    };
    next();
  },
}));

import { router } from '../routes/stripeRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/stripe', router);

describe('Stripe Routes - Unit Tests', () => {
  let mockStripeInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key';
    process.env.CLIENT_URL = 'http://localhost:5173';

    // Obtener la instancia mock de Stripe
    const StripeMock = vi.mocked(Stripe);
    mockStripeInstance = new StripeMock('sk_test_fake_key', { apiVersion: '2025-11-17.clover' });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/stripe/onboard-link', () => {
    it('debería crear un link de onboarding correctamente', async () => {
      const mockAccountLink = {
        object: 'account_link',
        created: 1234567890,
        expires_at: 1234567890,
        url: 'https://connect.stripe.com/setup/e/acct_test_123/abcdef',
      };

      vi.mocked(mockStripeInstance.accountLinks.create).mockResolvedValue(mockAccountLink as any);

      const response = await request(app)
        .post('/api/stripe/onboard-link')
        .send({
          accountId: 'acct_test_123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('url');
      expect(response.body.url).toBe('https://connect.stripe.com/setup/e/acct_test_123/abcdef');
    });

    it('debería devolver 400 si falta accountId', async () => {
      const response = await request(app)
        .post('/api/stripe/onboard-link')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('accountId es requerido');
    });

    it('debería devolver 403 si el accountId no pertenece al usuario', async () => {
      const response = await request(app)
        .post('/api/stripe/onboard-link')
        .send({
          accountId: 'acct_different_456',
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('No tienes permiso para acceder a esta cuenta');
    });

    it('debería crear el account link con URLs correctas', async () => {
      const mockAccountLink = {
        url: 'https://connect.stripe.com/setup/test',
      };

      vi.mocked(mockStripeInstance.accountLinks.create).mockResolvedValue(mockAccountLink as any);

      await request(app)
        .post('/api/stripe/onboard-link')
        .send({
          accountId: 'acct_test_123',
        });

      expect(mockStripeInstance.accountLinks.create).toHaveBeenCalledWith({
        account: 'acct_test_123',
        refresh_url: 'http://localhost:5173/stripe-refresh',
        return_url: 'http://localhost:5173/stripe-success',
        type: 'account_onboarding',
      });
    });

    it('debería manejar errores de Stripe correctamente', async () => {
      vi.mocked(mockStripeInstance.accountLinks.create).mockRejectedValue(
        new Error('Invalid account ID')
      );

      const response = await request(app)
        .post('/api/stripe/onboard-link')
        .send({
          accountId: 'acct_test_123',
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Error al crear link de onboarding');
      expect(response.body).toHaveProperty('details');
    });

    it('debería requerir autenticación (middleware protect)', async () => {
      // Este test verifica que el middleware protect esté aplicado
      // El mock ya simula un usuario autenticado, pero verificamos que se use
      const mockAccountLink = {
        url: 'https://connect.stripe.com/setup/test',
      };

      vi.mocked(mockStripeInstance.accountLinks.create).mockResolvedValue(mockAccountLink as any);

      const response = await request(app)
        .post('/api/stripe/onboard-link')
        .send({
          accountId: 'acct_test_123',
        });

      // Si el middleware no estuviera aplicado, req.user no existiría
      // y el endpoint fallaría de otra manera
      expect(response.status).toBe(200);
    });

    it('debería usar tipo account_onboarding', async () => {
      const mockAccountLink = {
        url: 'https://connect.stripe.com/setup/test',
      };

      vi.mocked(mockStripeInstance.accountLinks.create).mockResolvedValue(mockAccountLink as any);

      await request(app)
        .post('/api/stripe/onboard-link')
        .send({
          accountId: 'acct_test_123',
        });

      const createCall = vi.mocked(mockStripeInstance.accountLinks.create).mock.calls[0][0];
      expect(createCall.type).toBe('account_onboarding');
    });
  });
});
