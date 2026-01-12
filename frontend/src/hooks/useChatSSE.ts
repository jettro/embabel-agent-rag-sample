import { useEffect, useState, useRef, useCallback } from 'react';
import type { MessageOutputChannelEvent } from '../types/chatEvents';

export function useChatSSE(conversationId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const onMessageCallbackRef = useRef<((content: string) => void) | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setIsConnected(false);
      setError(null);
      return;
    }

    console.log('Connecting to chat SSE stream for conversation:', conversationId);
    const eventSource = new EventSource(`/chat/stream/${conversationId}`);
    eventSourceRef.current = eventSource;
    console.log('EventSource created, readyState:', eventSource.readyState);

    eventSource.onopen = () => {
      console.log('Chat SSE Connected - onopen fired');
      console.log('EventSource readyState after open:', eventSource.readyState);
      setIsConnected(true);
      setError(null);
    };

    // Generic message listener for debugging
    eventSource.onmessage = (e) => {
      console.log('Chat SSE - Generic message received:', e);
      console.log('Chat SSE - Event type:', e.type);
      console.log('Chat SSE - Event data:', e.data);
    };

    // Listen for all event types by their class name
    eventSource.addEventListener('MessageOutputChannelEvent', (e) => {
      try {
        const event: MessageOutputChannelEvent = JSON.parse(e.data);
        console.log('Received MessageOutputChannelEvent:', event);
        if (onMessageCallbackRef.current && event.message?.content) {
          onMessageCallbackRef.current(event.message.content);
        }
      } catch (err) {
        console.error('Failed to parse MessageOutputChannelEvent:', err);
      }
    });

    eventSource.addEventListener('ContentOutputChannelEvent', (e) => {
      try {
        const event = JSON.parse(e.data);
        console.log('Received ContentOutputChannelEvent:', event);
      } catch (err) {
        console.error('Failed to parse ContentOutputChannelEvent:', err);
      }
    });

    eventSource.addEventListener('ProgressOutputChannelEvent', (e) => {
      try {
        const event = JSON.parse(e.data);
        console.log('Received ProgressOutputChannelEvent:', event);
      } catch (err) {
        console.error('Failed to parse ProgressOutputChannelEvent:', err);
      }
    });

    eventSource.addEventListener('LoggingOutputChannelEvent', (e) => {
      try {
        const event = JSON.parse(e.data);
        console.log('Received LoggingOutputChannelEvent:', event);
      } catch (err) {
        console.error('Failed to parse LoggingOutputChannelEvent:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.error('Chat SSE Error:', err);
      console.error('EventSource readyState:', eventSource.readyState);
      console.error('EventSource url:', eventSource.url);
      setError(`Connection error (readyState: ${eventSource.readyState})`);
      setIsConnected(false);
    };

    return () => {
      console.log('Closing chat SSE connection');
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [conversationId]);

  const onMessage = useCallback((callback: (content: string) => void) => {
    onMessageCallbackRef.current = callback;
  }, []);

  return { isConnected, error, onMessage };
}
