/**
 * server/websocket.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Standalone Node.js WebSocket Server for real-time interview sessions.
 * Run with: npm run ws:server
 *
 * Responsibilities:
 *  - Maintain live session state (session map)
 *  - Relay transcript events between client and AI
 *  - Ping/pong keep-alive
 *  - Broadcast to all participants of a session
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";

const PORT = Number(process.env.WS_PORT) || 3001;

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageType =
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

interface WSMessage {
    type: MessageType;
    sessionId: string;
    payload?: unknown;
    timestamp: number;
}

interface SessionParticipant {
    ws: WebSocket;
    userId: string;
    role: "student" | "ai-relay";
}

// ─── State ────────────────────────────────────────────────────────────────────

/** Map of sessionId → array of connected participants */
const sessions = new Map<string, SessionParticipant[]>();

// ─── Server ───────────────────────────────────────────────────────────────────

const wss = new WebSocketServer({ port: PORT });

console.log(`[WS] BOrderpass WebSocket server running on ws://localhost:${PORT}`);

wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    // Parse userId from query params: ws://localhost:3001?userId=xxx
    const url = new URL(req.url || "/", `ws://localhost:${PORT}`);
    const userId = url.searchParams.get("userId") ?? "anonymous";

    console.log(`[WS] New connection: userId=${userId}`);

    // Keep-alive ping/pong
    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
        }
    }, 30_000);

    ws.on("pong", () => {
        // Connection is alive
    });

    // ─── Message Handler ────────────────────────────────────────────────────────

    ws.on("message", (raw: Buffer) => {
        let message: WSMessage;

        try {
            message = JSON.parse(raw.toString()) as WSMessage;
        } catch {
            sendError(ws, "Invalid JSON message");
            return;
        }

        const { type, sessionId, payload, timestamp: _ } = message;

        switch (type) {
            case "JOIN_SESSION":
                handleJoin(ws, sessionId, userId);
                break;

            case "LEAVE_SESSION":
                handleLeave(sessionId, userId);
                break;

            case "TRANSCRIPT_PARTIAL":
            case "TRANSCRIPT_FINAL":
                // Broadcast student speech transcript to all session participants
                broadcastToSession(sessionId, {
                    type,
                    sessionId,
                    payload,
                    timestamp: Date.now(),
                });
                break;

            case "AI_RESPONSE":
                // AI relay sends back AI transcript + audio notification
                broadcastToSession(sessionId, {
                    type: "AI_RESPONSE",
                    sessionId,
                    payload,
                    timestamp: Date.now(),
                });
                break;

            case "SESSION_END":
                handleSessionEnd(sessionId, userId);
                break;

            case "PING":
                send(ws, { type: "PONG", sessionId, timestamp: Date.now() });
                break;

            default:
                sendError(ws, `Unknown message type: ${type}`);
        }
    });

    // ─── Disconnect Handler ─────────────────────────────────────────────────────

    ws.on("close", () => {
        clearInterval(pingInterval);
        console.log(`[WS] Disconnected: userId=${userId}`);
        // Remove from all sessions
        sessions.forEach((participants, sessionId) => {
            const filtered = participants.filter((p) => p.ws !== ws);
            if (filtered.length === 0) {
                sessions.delete(sessionId);
            } else {
                sessions.set(sessionId, filtered);
            }
        });
    });

    ws.on("error", (err: Error) => {
        console.error(`[WS] Error for userId=${userId}:`, err.message);
    });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function handleJoin(ws: WebSocket, sessionId: string, userId: string) {
    const participants = sessions.get(sessionId) ?? [];
    participants.push({ ws, userId, role: "student" });
    sessions.set(sessionId, participants);

    send(ws, {
        type: "SESSION_START",
        sessionId,
        payload: { message: "Joined session successfully", participantCount: participants.length },
        timestamp: Date.now(),
    });

    console.log(`[WS] userId=${userId} joined session=${sessionId} (${participants.length} total)`);
}

function handleLeave(sessionId: string, userId: string) {
    const participants = (sessions.get(sessionId) ?? []).filter(
        (p) => p.userId !== userId
    );
    if (participants.length === 0) {
        sessions.delete(sessionId);
    } else {
        sessions.set(sessionId, participants);
    }
    console.log(`[WS] userId=${userId} left session=${sessionId}`);
}

function handleSessionEnd(sessionId: string, userId: string) {
    broadcastToSession(sessionId, {
        type: "SESSION_END",
        sessionId,
        payload: { endedBy: userId },
        timestamp: Date.now(),
    });
    sessions.delete(sessionId);
    console.log(`[WS] Session ${sessionId} ended by userId=${userId}`);
}

function broadcastToSession(sessionId: string, message: WSMessage) {
    const participants = sessions.get(sessionId) ?? [];
    const data = JSON.stringify(message);
    participants.forEach(({ ws }) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
        }
    });
}

function send(ws: WebSocket, message: Partial<WSMessage>) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}

function sendError(ws: WebSocket, error: string) {
    send(ws, { type: "ERROR", sessionId: "", payload: { error }, timestamp: Date.now() });
}
