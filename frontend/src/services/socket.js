import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'https://meetnova-backend.onrender.com';

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true
});

export default socket;
