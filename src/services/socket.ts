import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './apiClient';

const SOCKET_URL = API_BASE_URL.replace('/api', '');

let socket: Socket | null = null;

export const initSocketConnection = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocketConnection();
  }
  return socket;
};

export const joinSecurityRoom = () => {
  const s = getSocket();
  s.emit('join_security_room');
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
