const { z } = require('zod');

const nigerianPhone = z
  .string()
  .regex(/^(0[7-9][0-1]\d{8})$/, 'Must be a valid Nigerian phone number (e.g. 08012345678)');

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: nigerianPhone,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  phone: nigerianPhone,
  password: z.string().min(1),
});

const reportSchema = z.object({
  phone: nigerianPhone.optional(),
  businessName: z.string().optional(),
  scamType: z.enum([
    'Online Marketplace Scam',
    'Fake Product / Non-delivery',
    'POS Fraud',
    'Investment / Ponzi',
    'Romantic Scam',
    'Loan / Finance Fraud',
    'Job / Recruitment Scam',
    'Other',
  ]),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  amountLost: z.number().positive().optional(),
  anonymous: z.boolean().default(false),
});

const verificationSchema = z.object({
  type: z.enum(['individual', 'business']),
});

module.exports = { signupSchema, loginSchema, reportSchema, verificationSchema };
