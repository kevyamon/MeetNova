import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import socket from '../../services/socket';

/**
 * Pourquoi : Centraliser les écouteurs Socket.io permet une synchronisation 
 * globale de l'application. Peu importe la page où se trouve l'utilisateur, 
 * le cache React Query sera mis à jour dès qu'un changement survient en DB.
 */
const SocketManager = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // --- Événements pour les Événements ---
    const handleEventChange = () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    };

    socket.on('event:created', handleEventChange);
    socket.on('event:updated', handleEventChange);
    socket.on('event:deleted', handleEventChange);

    // --- Événements pour les News ---
    const handleNewsChange = () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    };

    socket.on('news:created', handleNewsChange);
    socket.on('news:updated', handleNewsChange);
    socket.on('news:deleted', handleNewsChange);

    return () => {
      socket.off('event:created', handleEventChange);
      socket.off('event:updated', handleEventChange);
      socket.off('event:deleted', handleEventChange);
      socket.off('news:created', handleNewsChange);
      socket.off('news:updated', handleNewsChange);
      socket.off('news:deleted', handleNewsChange);
    };
  }, [queryClient]);

  return null; // Composant invisible
};

export default SocketManager;
