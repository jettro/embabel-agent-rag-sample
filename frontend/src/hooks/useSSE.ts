import { useEffect, useState, useRef } from 'react';
import type { AgentProcessEvent } from '../types/events';

export function useSSE(processId: string | null) {
  const [events, setEvents] = useState<AgentProcessEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!processId) {
      setEvents([]);
      setIsConnected(false);
      setError(null);
      return;
    }

    const eventSource = new EventSource(`/events/process/${processId}`);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('connected', (e) => {
      console.log('SSE Connected:', e.data);
      setIsConnected(true);
      setError(null);
    });

    eventSource.addEventListener('agent-process-event', (e) => {
      try {
        const event: AgentProcessEvent = JSON.parse(e.data);
        setEvents((prev) => [...prev, event]);
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      setError('Connection error');
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [processId]);

  const clearEvents = () => {
    setEvents([]);
  };

  return { events, isConnected, error, clearEvents };
}
