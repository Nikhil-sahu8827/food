import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export const useWebSocket = ({ topic, onMessage, pollingFallbackFn, pollingIntervalMs = 15000 }) => {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const processedMessageIdsRef = useRef(new Set());
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const handleIncomingMessage = useCallback((msgBody) => {
    try {
      const data = JSON.parse(msgBody);
      // Deduplicate key by orderNumber + orderStatus + locationShared
      const dedupeKey = `${data.orderNumber}_${data.orderStatus}_${data.locationShared}_${data.updatedAt || ''}`;
      if (processedMessageIdsRef.current.has(dedupeKey)) {
        return; // Prevent duplicate execution upon reconnect
      }
      processedMessageIdsRef.current.add(dedupeKey);
      if (processedMessageIdsRef.current.size > 200) {
        // Keep deduplication set compact
        const [first] = processedMessageIdsRef.current;
        processedMessageIdsRef.current.delete(first);
      }

      if (onMessageRef.current) {
        onMessageRef.current(data);
      }
    } catch (e) {
      console.error('Error parsing WebSocket message payload:', e);
    }
  }, []);

  useEffect(() => {
    if (!topic) return;

    let isMounted = true;
    let stompClient = null;

    const connectWebSocket = () => {
      try {
        const wsUrl = import.meta.env.VITE_WS_URL || '/ws';
        const socket = new SockJS(wsUrl);
        stompClient = Stomp.over(socket);
        stompClient.debug = () => {}; // Silence verbose debug logs

        stompClient.connect(
          {},
          () => {
            if (!isMounted) return;
            setConnected(true);
            clientRef.current = stompClient;

            stompClient.subscribe(topic, (message) => {
              if (message.body) {
                handleIncomingMessage(message.body);
              }
            });
          },
          (error) => {
            if (!isMounted) return;
            console.warn('WebSocket connection lost or failed. Active fallback polling engaged.', error);
            setConnected(false);
          }
        );
      } catch (err) {
        console.warn('Could not establish SockJS socket:', err);
        setConnected(false);
      }
    };

    connectWebSocket();

    // Fallback polling mechanism if WebSocket is not connected or as health backup
    let pollInterval = null;
    if (pollingFallbackFn) {
      pollInterval = setInterval(() => {
        pollingFallbackFn();
      }, pollingIntervalMs);
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (stompClient && stompClient.connected) {
        try {
          stompClient.disconnect();
        } catch {}
      }
    };
  }, [topic, handleIncomingMessage, pollingFallbackFn, pollingIntervalMs]);

  return { connected };
};
