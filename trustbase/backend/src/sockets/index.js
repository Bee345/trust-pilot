const { Server } = require('socket.io');

let io = null;

function initSockets(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    socket.on('disconnect', () => {});
  });

  return io;
}

function emitNewReport(payload) {
  if (io) io.emit('new_report', payload);
}

function emitVerificationUpdate(payload) {
  if (io) io.emit('verification_update', payload);
}

module.exports = { initSockets, emitNewReport, emitVerificationUpdate };
