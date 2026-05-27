const request = require('supertest');

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_KEY', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
const TEST_PREFIX = '0700000';

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.warn(
    `[reports.integration] Skipping — missing env vars: ${missing.join(', ')}`
  );
  test.skip('integration tests skipped — env vars not set', () => {});
} else {
  const app = require('../../app');
  const supabase = require('../../config/supabase');

  let authToken;
  const signupPhone = `${TEST_PREFIX}5001`;
  const reportPhone = `${TEST_PREFIX}5002`;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Report Test User',
      phone: signupPhone,
      password: 'password123',
    });
    authToken = res.body.data.token;
  });

  afterAll(async () => {
    await supabase.from('reports').delete().like('phone', `${TEST_PREFIX}%`);
    await supabase.from('users').delete().like('phone', `${TEST_PREFIX}%`);
  });

  describe('POST /api/reviews', () => {
    it('returns 201 for a valid report', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: reportPhone,
          scamType: 'POS Fraud',
          description: 'This person collected money via POS and never delivered goods.',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.report).toBeDefined();
    });

    it('returns 422 for an invalid scam type', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: reportPhone,
          scamType: 'Pyramid Scheme',
          description: 'This is a long enough description for validation.',
        });
      expect(res.status).toBe(422);
    });

    it('returns 422 for description shorter than 20 characters', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: reportPhone,
          scamType: 'POS Fraud',
          description: 'Too short',
        });
      expect(res.status).toBe(422);
    });

    it('returns 422 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      expect(res.status).toBe(422);
    });

    it('allows anonymous submission without auth token', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .send({
          phone: reportPhone,
          scamType: 'Other',
          description: 'Submitted without login to test anonymous flow works correctly.',
          anonymous: true,
        });
      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/reviews', () => {
    it('returns 200 with an array of reports', async () => {
      const res = await request(app).get('/api/reviews');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reports).toBeInstanceOf(Array);
    });

    it('supports risk_level filter', async () => {
      const res = await request(app).get('/api/reviews?risk_level=high');
      expect(res.status).toBe(200);
      expect(res.body.data.reports).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/reviews/mine', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/reviews/mine');
      expect(res.status).toBe(401);
    });

    it('returns 200 with reports for authenticated user', async () => {
      const res = await request(app)
        .get('/api/reviews/mine')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.reports).toBeInstanceOf(Array);
    });
  });
}
