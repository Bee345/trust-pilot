require('dotenv').config();
const http = require('http');

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_KEY', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  process.stderr.write(`FATAL: Missing required env vars: ${missing.join(', ')}\n`);
  process.exit(1);
}

const app = require('./app.js');
const { initSockets } = require('./sockets/index.js');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
initSockets(server);

server.listen(PORT);
