const pino = require('pino');

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino(
  {
    level: process.env.PINO_LEVEL || 'info',
    redact: {
      paths: ['*.password', '*.password_hash', '*.token', '*.authorization'],
      censor: '[REDACTED]',
    },
  },
  isDev
    ? pino.transport({ target: 'pino-pretty', options: { colorize: true, ignore: 'pid,hostname' } })
    : undefined,
);

module.exports = logger;