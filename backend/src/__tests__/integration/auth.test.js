const request = require('supertest');

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_KEY', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
const TEST_PREFIX = '0700000';

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.warn(
    `[auth.integration] Skipping — missing env vars: ${missing.join(', ')}`
  );
  test.skip('integration tests skipped — env vars not set', () => {});
} else {
  const app = require('../../app');
  const supabase = require('../../config/supabase');

  afterAll(async () => {
    await supabase.from('audit_logs').delete().like('ip_address', `${TEST_PREFIX}%`);
    await supabase.from('report_upvotes').delete().gt('created_at', '2000-01-01');
    await supabase.from('reports').delete().like('phone', `${TEST_PREFIX}%`);
    await supabase.from('users').delete().like('phone', `${TEST_PREFIX}%`);
  });

  let counter = 0;
  function testPhone() {
    counter += 1;
    return `${TEST_PREFIX}${String(counter).padStart(4, '0')}`;
  }

  describe('POST /api/auth/signup', () => {
    it('returns 201 + token for a valid signup', async () => {
      const phone = testPhone();
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Auth Test User',
        phone,
        password: 'password123',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('never returns password_hash in the response', async () => {
      const phone = testPhone();
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Hash Check User',
        phone,
        password: 'password123',
      });
      expect(res.status).toBe(201);
      expect(res.body.data.user.password_hash).toBeUndefined();
    });

    it('returns 409 for duplicate phone signup', async () => {
      const phone = testPhone();
      await request(app).post('/api/auth/signup').send({
        name: 'First User',
        phone,
        password: 'password123',
      });
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Second User',
        phone,
        password: 'password456',
      });
      expect(res.status).toBe(409);
    });

    it('returns 422 for missing required fields', async () => {
      const res = await request(app).post('/api/auth/signup').send({});
      expect(res.status).toBe(422);
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

    it('returns 422 for a short password', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Test User',
        phone: testPhone(),
        password: 'short',
      });
      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/auth/login', () => {
    let loginPhone;

    beforeAll(async () => {
      loginPhone = testPhone();
      await request(app).post('/api/auth/signup').send({
        name: 'Login Test User',
        phone: loginPhone,
        password: 'password123',
      });
    });

    it('returns 200 + token for valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        phone: loginPhone,
        password: 'password123',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('returns 401 for wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        phone: loginPhone,
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
    });

    it('returns 401 for nonexistent phone (never 404)', async () => {
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
    it('returns 200 with ok status and requestId', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.requestId).toBeDefined();
    });
  });
}
