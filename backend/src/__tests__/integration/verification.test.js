const request = require('supertest');
const crypto = require('crypto');

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_KEY', 'JWT_SECRET', 'PAYSTACK_SECRET'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.warn(
    `[verification.integration] Skipping — missing env vars: ${missing.join(', ')}`
  );
  test.skip('integration tests skipped — env vars not set', () => {});
} else {
  const app = require('../../app');

  function computeHmac(body) {
    return crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET)
      .update(body)
      .digest('hex');
  }

  describe('POST /api/verify/webhook', () => {
    const payload = JSON.stringify({
      event: 'charge.success',
      data: { reference: 'TB-nonexistent-12345' },
    });

    it('returns 401 when signature is missing', async () => {
      const res = await request(app)
        .post('/api/verify/webhook')
        .set('Content-Type', 'application/json')
        .send(payload);
      expect(res.status).toBe(401);
    });

    it('returns 401 when signature is wrong', async () => {
      const res = await request(app)
        .post('/api/verify/webhook')
        .set('Content-Type', 'application/json')
        .set('x-paystack-signature', 'definitely-not-a-valid-hmac')
        .send(payload);
      expect(res.status).toBe(401);
    });

    it('returns 200 when signature is valid', async () => {
      const validSignature = computeHmac(payload);
      const res = await request(app)
        .post('/api/verify/webhook')
        .set('Content-Type', 'application/json')
        .set('x-paystack-signature', validSignature)
        .send(payload);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/verify/initiate', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app)
        .post('/api/verify/initiate')
        .send({ type: 'individual' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/verify/status', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/verify/status');
      expect(res.status).toBe(401);
    });
  });
}
