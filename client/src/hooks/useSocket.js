// ============================================================================
// HOOKS - useSocket for real-time messaging
// ============================================================================

import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    if (!socket || !socket.connected) {
      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });
    }

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onError = (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onError);
    };
  }, []);

  const joinProject = useCallback((projectId) => {
    if (socket) socket.emit('join:project', projectId);
  }, []);

  const leaveProject = useCallback((projectId) => {
    if (socket) socket.emit('leave:project', projectId);
  }, []);

  const joinWorkspace = useCallback((workspaceId) => {
    if (socket) socket.emit('join:workspace', workspaceId);
  }, []);

  const leaveWorkspace = useCallback((workspaceId) => {
    if (socket) socket.emit('leave:workspace', workspaceId);
  }, []);

  const onMessage = useCallback((callback) => {
    if (socket) socket.on('message:new', callback);
  }, []);

  const onComment = useCallback((callback) => {
    if (socket) socket.on('comment:new', callback);
  }, []);

  const offMessage = useCallback((callback) => {
    if (socket) socket.off('message:new', callback);
  }, []);

  const offComment = useCallback((callback) => {
    if (socket) socket.off('comment:new', callback);
  }, []);

  return {
    socket,
    isConnected,
    joinProject,
    leaveProject,
    joinWorkspace,
    leaveWorkspace,
    onMessage,
    onComment,
    offMessage,
    offComment,
  };
};

export default useSocket;
