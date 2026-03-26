import { useEffect, useState } from 'react';

export function useProjectPresence(projectId) {
  const [presence, setPresence] = useState({ count: 0, users: [] });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const url = new URL(`/api/presence/${projectId}`, window.location.origin);

    const eventSource = new EventSource(url.toString(), { withCredentials: true });

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
    const handleBeforeUnload = () => {
      navigator.sendBeacon(`/api/presence/${projectId}`, JSON.stringify({ action: 'leave' }));
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
