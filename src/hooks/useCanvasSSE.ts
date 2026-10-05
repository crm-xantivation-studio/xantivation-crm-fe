'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface CanvasExecutionEvent {
  executionId: string;
  eventId: string;
  eventType:
    | 'session_start'
    | 'subagent_start'
    | 'tool_call'
    | 'tool_result'
    | 'subagent_stop'
    | 'session_end';
  timestamp: string;
  department: 'marketing' | 'sales' | 'tech';
  parentSubagentId?: string | null;
  subagentId: string;
  role: 'orchestrator' | 'researcher' | 'copywriter' | 'auditor';
  goal?: string;
  status: 'running' | 'completed' | 'failed';
  toolCallName?: string;
  toolCallInput?: Record<string, any>;
  toolCallResultSnippet?: string;
  metadata?: {
    queriesUsed?: string[];
    extractedUrls?: Array<{ title: string; url: string }>;
    pillarSelected?: string;
    draftTitle?: string;
    postId?: string;
    auditPassed?: boolean;
    durationMs?: number;
    error?: string;
    [key: string]: any;
  };
}

export function useCanvasSSE(apiUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1') {
  const [events, setEvents] = useState<CanvasExecutionEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<CanvasExecutionEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const streamUrl = `${apiUrl}/integrations/social-posts/execution-stream`;
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        retryCountRef.current = 0;
      };

      es.onmessage = (e) => {
        if (isPausedRef.current) return;
        try {
          const parsed: CanvasExecutionEvent = JSON.parse(e.data);
          if (parsed && parsed.subagentId) {
            setLatestEvent(parsed);
            setEvents((prev) => [...prev.slice(-100), parsed]); // Keep last 100 events
          }
        } catch {
          // Ignored malformed event
        }
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();

        // Exponential backoff reconnect
        if (retryCountRef.current < 5) {
          const timeout = Math.min(1000 * 2 ** retryCountRef.current, 10000);
          retryCountRef.current += 1;
          setTimeout(() => {
            connect();
          }, timeout);
        }
      };
    } catch {
      setIsConnected(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setLatestEvent(null);
  }, []);

  return {
    events,
    latestEvent,
    isConnected,
    isPaused,
    pause,
    resume,
    clearEvents,
  };
}
