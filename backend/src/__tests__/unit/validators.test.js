const {
  signupSchema,
  loginSchema,
  reportSchema,
  verificationSchema,
  updateProfileSchema,
  sanitiseSearchQuery,
} = require('../../utils/validators');

describe('signupSchema', () => {
  it('accepts a valid Nigerian signup payload', () => {
    const result = signupSchema.safeParse({
      name: 'Chioma Okonkwo',
      phone: '08012345678',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a non-Nigerian phone', () => {
    const result = signupSchema.safeParse({
      name: 'Chioma',
      phone: '12345',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects passwords shorter than 8 chars', () => {
    const result = signupSchema.safeParse({
      name: 'Chioma',
      phone: '08012345678',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects names shorter than 2 chars', () => {
    const result = signupSchema.safeParse({
      name: 'X',
      phone: '08012345678',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it.each([
    '08012345678',
    '07023456789',
    '09011223344',
    '08134567890',
    '09011223344',
  ])('accepts valid Nigerian phone format %s', (phone) => {
    const result = signupSchema.safeParse({
      name: 'Test User',
      phone,
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it.each([
    '06012345678',
    '0801234567',
    '080123456789',
    '+2348012345678',
    '8012345678',
  ])('rejects invalid phone format %s', (phone) => {
    const result = signupSchema.safeParse({
      name: 'Test User',
      phone,
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid login payload', () => {
    const result = loginSchema.safeParse({
      phone: '08012345678',
      password: 'anything',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      phone: '08012345678',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('reportSchema', () => {
  const validBase = {
    scamType: 'POS Fraud',
    description: 'A long enough description that meets the twenty-character minimum.',
  };

  it('accepts a minimal valid report', () => {
    expect(reportSchema.safeParse(validBase).success).toBe(true);
  });

  it('defaults anonymous to false', () => {
    const result = reportSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    expect(result.data.anonymous).toBe(false);
  });

  it('rejects description shorter than 20 chars', () => {
    const result = reportSchema.safeParse({ ...validBase, description: 'Too short' });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown scam type', () => {
    const result = reportSchema.safeParse({ ...validBase, scamType: 'Pyramid scheme' });
    expect(result.success).toBe(false);
  });

  it('rejects negative amountLost', () => {
    const result = reportSchema.safeParse({ ...validBase, amountLost: -1 });
    expect(result.success).toBe(false);
  });

  it('accepts a positive amountLost', () => {
    const result = reportSchema.safeParse({ ...validBase, amountLost: 50000 });
    expect(result.success).toBe(true);
  });
});

describe('verificationSchema', () => {
  it.each(['individual', 'business'])('accepts type %s', (type) => {
    expect(verificationSchema.safeParse({ type }).success).toBe(true);
  });

  it('rejects unknown type', () => {
    expect(verificationSchema.safeParse({ type: 'enterprise' }).success).toBe(false);
  });
});

describe('updateProfileSchema', () => {
  it('accepts a valid name', () => {
    const result = updateProfileSchema.safeParse({ name: 'Emeka Nwankwo' });
    expect(result.success).toBe(true);
  });

  it('rejects a name shorter than 2 characters', () => {
    const result = updateProfileSchema.safeParse({ name: 'A' });
    expect(result.success).toBe(false);
  });

  it('strips unknown fields', () => {
    const result = updateProfileSchema.safeParse({ name: 'Emeka', role: 'admin' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: 'Emeka' });
    expect(result.data.role).toBeUndefined();
  });
});

describe('sanitiseSearchQuery', () => {
  it('returns a trimmed string unchanged', () => {
    expect(sanitiseSearchQuery('lagos shop')).toBe('lagos shop');
  });

  it('strips SQL/tsquery special characters', () => {
    expect(sanitiseSearchQuery("test'OR 1=1--")).toBe('test OR 1=1--');
  });

  it('strips ampersands, pipes, and angle brackets', () => {
    expect(sanitiseSearchQuery('foo & bar | baz <>')).toBe('foo bar baz');
  });

  it('collapses multiple spaces into one', () => {
    expect(sanitiseSearchQuery('   too   many    spaces   ')).toBe('too many spaces');
  });

  it('truncates input to 100 characters', () => {
    const long = 'a'.repeat(150);
    expect(sanitiseSearchQuery(long).length).toBe(100);
  });

  it('returns empty string for non-string input', () => {
    expect(sanitiseSearchQuery(null)).toBe('');
    expect(sanitiseSearchQuery(undefined)).toBe('');
    expect(sanitiseSearchQuery(123)).toBe('');
  });

  it('handles empty string input', () => {
    expect(sanitiseSearchQuery('')).toBe('');
  });
});
