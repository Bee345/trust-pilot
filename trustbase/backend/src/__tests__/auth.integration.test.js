const request = require('supertest');

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_KEY', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.warn(
    `[auth.integration.test] Skipping — missing env vars: ${missing.join(', ')}`
  );
  test.skip('integration tests skipped — env vars not set', () => {});
} else {
  const app = require('../app');

  describe('POST /api/auth/signup', () => {
    it('returns 422 for missing required fields', async () => {
      const res = await request(app).post('/api/auth/signup').send({});
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 422 for an invalid Nigerian phone', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Test User',
        phone: '12345',
        password: 'password123',
      });
      expect(res.status).toBe(422);
    });

    it('returns 201 + token for a valid signup', async () => {
      const uniquePhone = `080${Date.now().toString().slice(-8)}`;
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Integration Test User',
        phone: uniquePhone,
        password: 'password123',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.password_hash).toBeUndefined();
    });
  });

  describe('POST /api/auth/login', () => {
    let testPhone;

    beforeAll(async () => {
      testPhone = `080${Date.now().toString().slice(-8)}`;
      await request(app).post('/api/auth/signup').send({
        name: 'Login Test User',
        phone: testPhone,
        password: 'password123',
      });
    });

    it('returns 200 + token for valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        phone: testPhone,
        password: 'password123',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('returns 401 for wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        phone: testPhone,
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
    });

    it('returns 401 for nonexistent phone', async () => {
      const res = await request(app).post('/api/auth/login').send({
        phone: '08099999999',
        password: 'password123',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/me', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });

    it('returns 401 with an invalid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer not-a-real-token');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /health', () => {
    it('returns 200 and an ok status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.requestId).toBeDefined();
    });
  });
}
