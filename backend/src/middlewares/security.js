const helmet = require('helmet');
const hpp = require('hpp');
const { v4: uuidv4 } = require('uuid');
const { forbidden } = require('../errors/AppError');

// ─── 1. Security Headers (helmet) ────────────────────────────────────────────
// Sets 11+ HTTP headers that block common web attacks:
//   X-Content-Type-Options: nosniff       → prevents MIME-type sniffing
//   X-Frame-Options: DENY                 → blocks clickjacking
//   X-XSS-Protection: 0                  → disables broken browser XSS filter
//   Strict-Transport-Security             → forces HTTPS
//   Content-Security-Policy              → restricts what scripts can run
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// ─── 2. Strict CORS ───────────────────────────────────────────────────────────
// Only allows requests from our known frontend origins.
// '*' (allow all) is insecure — never use it in production.
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim());

    // Allow server-to-server requests (no origin header) and known origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(forbidden('Origin not allowed by CORS'));
    }
  },
  credentials: true,                          // allow cookies / Authorization header
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400,                              // cache preflight for 24 hours
};

// ─── 3. HTTP Parameter Pollution Prevention ───────────────────────────────────
// Blocks attacks like: ?status=active&status=admin
// Keeps only the LAST value for each parameter.
const preventParamPollution = hpp({
  whitelist: ['sort', 'fields', 'page', 'limit'],  // these are allowed as arrays
});

// ─── 4. Request ID ────────────────────────────────────────────────────────────
// Attaches a unique ID to every request for tracing through logs and Sentry.
// Client can also send X-Request-ID header (useful for frontend debugging).
const attachRequestId = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

// ─── 5. Payload Size Limits ───────────────────────────────────────────────────
// Prevents large payload attacks (e.g., sending 50MB JSON body).
// Applied per content type — 10kb is generous for our API.
const jsonLimit = '10kb';
const urlencodedLimit = '10kb';

module.exports = {
  securityHeaders,
  corsOptions,
  preventParamPollution,
  attachRequestId,
  jsonLimit,
  urlencodedLimit,
};
