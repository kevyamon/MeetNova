import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://meetnova-backend.onrender.com';

/**
 * Pourquoi : Centraliser la connexion Socket.io pour permettre le temps réel 
 * (mises à jour du feed, notifications admin) sur toute la plateforme.
 */
export const socket = io(SOCKET_URL, {
  autoConnect: false, // On connecte manuellement ou via un hook
  withCredentials: true
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
