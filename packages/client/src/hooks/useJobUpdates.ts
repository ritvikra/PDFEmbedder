import { useEffect, useCallback } from 'react';

interface Job {
  _id: string;
  url: string;
  type: 'html' | 'pdf';
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: string[];
  createdAt: string;
  documents?: any[];
}

export const useJobUpdates = (jobId: string | undefined, onUpdate: (job: Job) => void) => {
  const connectWebSocket = useCallback(() => {
    if (!jobId) return;

    const ws = new WebSocket('ws://localhost:3000');

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Subscribe to job updates
      ws.send(JSON.stringify({ type: 'subscribe', jobId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // The server sends the entire job object directly
        if (data._id === jobId) {
          onUpdate(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after a delay
      setTimeout(connectWebSocket, 3000);
    };

    return ws;
  }, [jobId, onUpdate]);

  useEffect(() => {
    const ws = connectWebSocket();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connectWebSocket]);
}; 