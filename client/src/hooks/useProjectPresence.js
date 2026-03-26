import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const buildPresenceUrl = (projectId) => {
  const path = `/presence/${projectId}`;
  if (API_BASE.startsWith('http')) {
    return `${API_BASE}${path}`;
  }
  return new URL(`${API_BASE}${path}`, window.location.origin).toString();
};

export function useProjectPresence(projectId) {
  const [presence, setPresence] = useState({ count: 0, users: [] });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const url = buildPresenceUrl(projectId);

    const eventSource = new EventSource(url, { withCredentials: true });

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setPresence(data);
        setIsConnected(true);
      } catch (error) {
        console.error('Error parsing presence data:', error);
      }
    };

    const handleError = () => {
      setIsConnected(false);
      eventSource.close();
    };

    eventSource.addEventListener('message', handleMessage);
    eventSource.addEventListener('error', handleError);

    // Cleanup on unload
    const leaveUrl = buildPresenceUrl(projectId);
    const handleBeforeUnload = () => {
      navigator.sendBeacon(leaveUrl, JSON.stringify({ action: 'leave' }));
      eventSource.close();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      eventSource.removeEventListener('message', handleMessage);
      eventSource.removeEventListener('error', handleError);
      eventSource.close();
    };
  }, [projectId]);

  return { ...presence, isConnected };
}
