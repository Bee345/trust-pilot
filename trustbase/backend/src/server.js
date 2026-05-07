const http = require('http');
const app = require('./app.js');
const { initSockets } = require('./sockets/index.js');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
initSockets(server);

server.listen(PORT, () => {
  console.log(`TrustBase API running on port ${PORT}`);
});
