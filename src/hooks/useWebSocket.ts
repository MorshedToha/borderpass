/**
 * src/hooks/useWebSocket.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom React hook for managing the WebSocket connection
 * during a live interview session.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type WSStatus = "connecting" | "connected" | "disconnected" | "error";

type WSMessageType =
    | "JOIN_SESSION"
    | "LEAVE_SESSION"
    | "TRANSCRIPT_PARTIAL"
    | "TRANSCRIPT_FINAL"
    | "AI_RESPONSE"
    | "SESSION_START"
    | "SESSION_END"
    | "PING"
    | "PONG"
    | "ERROR";

export interface WSMessage {
    type: WSMessageType;
    sessionId: string;
    payload?: unknown;
    timestamp: number;
}

export interface TranscriptLine {
    id: string;
    speaker: "STUDENT" | "AI";
    text: string;
    isFinal: boolean;
    timestamp: number;
}

interface UseWebSocketOptions {
    sessionId: string;
    userId: string;
    onSessionEnd?: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWebSocket({
    sessionId,
    userId,
    onSessionEnd,
}: UseWebSocketOptions) {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retryCount = useRef(0);

    const [status, setStatus] = useState<WSStatus>("connecting");
    const [transcripts, setTranscripts] = useState<TranscriptLine[]>([]);

    // ── Connect ────────────────────────────────────────────────────────────────

    const connect = useCallback(() => {
        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?userId=${userId}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setStatus("connected");
            retryCount.current = 0;

            // Join the session
            ws.send(
                JSON.stringify({
                    type: "JOIN_SESSION",
                    sessionId,
                    timestamp: Date.now(),
                } satisfies WSMessage)
            );
        };

        ws.onmessage = (event: MessageEvent<string>) => {
            const msg = JSON.parse(event.data) as WSMessage;
            handleMessage(msg);
        };

        ws.onerror = () => {
            setStatus("error");
        };

        ws.onclose = () => {
            setStatus("disconnected");
            // Auto-reconnect with exponential back-off (max 3 attempts)
            if (retryCount.current < 3) {
                const delay = Math.pow(2, retryCount.current) * 1000;
                retryCount.current += 1;
                reconnectTimer.current = setTimeout(connect, delay);
            }
        };
    }, [sessionId, userId]);

    // ── Message Handler ────────────────────────────────────────────────────────

    const handleMessage = useCallback(
        (msg: WSMessage) => {
            switch (msg.type) {
                case "TRANSCRIPT_PARTIAL": {
                    const p = msg.payload as { text: string };
                    // Update or append partial transcript
                    setTranscripts((prev) => {
                        const lastIdx = prev.length - 1;
                        const last = prev[lastIdx];
                        if (last && last.speaker === "STUDENT" && !last.isFinal) {
                            // Replace partial with updated text
                            return [
                                ...prev.slice(0, lastIdx),
                                { ...last, text: p.text, timestamp: msg.timestamp },
                            ];
                        }
                        return [
                            ...prev,
                            {
                                id: crypto.randomUUID(),
                                speaker: "STUDENT",
                                text: p.text,
                                isFinal: false,
                                timestamp: msg.timestamp,
                            },
                        ];
                    });
                    break;
                }

                case "TRANSCRIPT_FINAL": {
                    const p = msg.payload as { text: string };
                    setTranscripts((prev) => {
                        // Finalize the last partial or add new line
                        const lastIdx = prev.length - 1;
                        const last = prev[lastIdx];
                        if (last && last.speaker === "STUDENT" && !last.isFinal) {
                            return [
                                ...prev.slice(0, lastIdx),
                                { ...last, text: p.text, isFinal: true, timestamp: msg.timestamp },
                            ];
                        }
                        return [
                            ...prev,
                            {
                                id: crypto.randomUUID(),
                                speaker: "STUDENT",
                                text: p.text,
                                isFinal: true,
                                timestamp: msg.timestamp,
                            },
                        ];
                    });
                    break;
                }

                case "AI_RESPONSE": {
                    const p = msg.payload as { text: string; isFinal: boolean };
                    setTranscripts((prev) => [
                        ...prev,
                        {
                            id: crypto.randomUUID(),
                            speaker: "AI",
                            text: p.text,
                            isFinal: p.isFinal,
                            timestamp: msg.timestamp,
                        },
                    ]);
                    break;
                }

                case "SESSION_END":
                    onSessionEnd?.();
                    break;

                case "ERROR":
                    console.error("[WS] Server error:", (msg.payload as { error: string })?.error);
                    break;

                default:
                    break;
            }
        },
        [onSessionEnd]
    );

    // ── Send ───────────────────────────────────────────────────────────────────

    const sendMessage = useCallback((msg: Partial<WSMessage>) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ ...msg, timestamp: Date.now() }));
        }
    }, []);

    const endSession = useCallback(() => {
        sendMessage({ type: "SESSION_END", sessionId });
    }, [sendMessage, sessionId]);

    // ── Lifecycle ──────────────────────────────────────────────────────────────

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [connect]);

    return { status, transcripts, sendMessage, endSession };
}
