import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let socket = null;

export function connectSocket(token) {
  if (socket?.connected) return;

  socket = io(BASE_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  });
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
