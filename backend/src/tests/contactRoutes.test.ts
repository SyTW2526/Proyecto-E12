import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock de axios para evitar llamadas reales a Slack
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

import axios from 'axios';
import { router } from '../routes/contactRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/contact', router);

describe('Contact Routes - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/TEST/WEBHOOK/URL';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/contact', () => {
    it('debería enviar un mensaje a Slack correctamente', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const response = await request(app)
        .post('/api/contact')
        .send({
          nombre: 'John Doe',
          email: 'john@test.com',
          telefono: '123456789',
          asunto: 'Test Subject',
          mensaje: 'Test message content',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        'https://hooks.slack.com/services/TEST/WEBHOOK/URL',
        expect.objectContaining({
          text: expect.stringContaining('John Doe'),
        })
      );
    });

    it('debería enviar mensaje sin teléfono (campo opcional)', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const response = await request(app)
        .post('/api/contact')
        .send({
          nombre: 'Jane Doe',
          email: 'jane@test.com',
          asunto: 'Test Subject',
          mensaje: 'Test message',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          text: expect.stringContaining('No proporcionado'),
        })
      );
    });

    it('debería devolver 500 si SLACK_WEBHOOK_URL no está configurado', async () => {
      delete process.env.SLACK_WEBHOOK_URL;

      const response = await request(app)
        .post('/api/contact')
        .send({
          nombre: 'Test User',
          email: 'test@test.com',
          asunto: 'Test',
          mensaje: 'Test message',
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('SLACK_WEBHOOK_URL not configured');
    });

    it('debería manejar errores de Slack correctamente', async () => {
      vi.mocked(axios.post).mockRejectedValue(new Error('Slack API error'));

      const response = await request(app)
        .post('/api/contact')
        .send({
          nombre: 'Test User',
          email: 'test@test.com',
          asunto: 'Test',
          mensaje: 'Test message',
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to send message to Slack');
    });

    it('debería incluir todos los campos en el mensaje de Slack', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await request(app)
        .post('/api/contact')
        .send({
          nombre: 'John Doe',
          email: 'john@test.com',
          telefono: '987654321',
          asunto: 'Consulta importante',
          mensaje: 'Necesito información sobre precios',
        });

      const slackCall = vi.mocked(axios.post).mock.calls[0];
      const messageText = (slackCall[1] as any).text;

      expect(messageText).toContain('John Doe');
      expect(messageText).toContain('john@test.com');
      expect(messageText).toContain('987654321');
      expect(messageText).toContain('Consulta importante');
      expect(messageText).toContain('Necesito información sobre precios');
    });
  });
});
