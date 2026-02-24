/**
 * src/services/vapi.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Vapi AI Voice Integration Service
 *
 * Responsibilities:
 *  - Initialize Vapi client with country-specific assistant
 *  - Start / stop voice calls
 *  - Handle real-time transcript events
 *  - Forward call metadata to DB via API route
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Vapi from "@vapi-ai/web";

// ─── Types ────────────────────────────────────────────────────────────────────

export type VapiTranscriptEvent = {
    role: "user" | "assistant";
    text: string;
    isFinal: boolean;
    timestamp: number;
};

export type VapiCallStatus =
    | "idle"
    | "connecting"
    | "connected"
    | "disconnecting"
    | "error";

export type VapiEventHandlers = {
    onTranscript: (event: VapiTranscriptEvent) => void;
    onStatusChange: (status: VapiCallStatus) => void;
    onCallStart: (callId: string) => void;
    onCallEnd: () => void;
    onError: (error: Error) => void;
};

// ─── Country → Assistant Mapping ──────────────────────────────────────────────

const ASSISTANT_MAP: Record<string, string> = {
    USA: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_USA ?? "",
    CANADA: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_CANADA ?? "",
    UK: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_UK ?? "",
};

// ─── Vapi Service Class ───────────────────────────────────────────────────────

class VapiService {
    private vapi: Vapi | null = null;
    private currentCallId: string | null = null;

    /** Initialize Vapi client (call once on mount) */
    initialize(handlers: VapiEventHandlers): void {
        if (this.vapi) return; // Already initialized

        this.vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? "");

        // ── Event Listeners ──────────────────────────────────────────────────────

        // Call started
        this.vapi.on("call-start", () => {
            handlers.onStatusChange("connected");
            // callId comes from call-start in newer SDK versions
            // @ts-ignore – SDK type may vary
            const callId = (this.vapi as unknown as { callId: string }).callId ?? "";
            this.currentCallId = callId;
            handlers.onCallStart(callId);
        });

        // Call ended
        this.vapi.on("call-end", () => {
            handlers.onStatusChange("idle");
            this.currentCallId = null;
            handlers.onCallEnd();
        });

        // Real-time transcript streaming
        this.vapi.on("message", (msg: unknown) => {
            const m = msg as {
                type: string;
                role?: string;
                transcript?: string;
                transcriptType?: string;
            };

            if (m.type === "transcript") {
                handlers.onTranscript({
                    role: (m.role as "user" | "assistant") ?? "assistant",
                    text: m.transcript ?? "",
                    isFinal: m.transcriptType === "final",
                    timestamp: Date.now(),
                });
            }
        });

        // Speech start/stop
        this.vapi.on("speech-start", () => {
            handlers.onStatusChange("connected");
        });

        // Error handling
        this.vapi.on("error", (err: Error) => {
            handlers.onStatusChange("error");
            handlers.onError(err);
            console.error("[Vapi] Error:", err);
        });
    }

    /** Start a voice interview for a given country */
    async startInterview(countryCode: string): Promise<void> {
        if (!this.vapi) {
            throw new Error("Vapi not initialized. Call initialize() first.");
        }

        const assistantId = ASSISTANT_MAP[countryCode.toUpperCase()];
        if (!assistantId) {
            throw new Error(`No Vapi assistant configured for country: ${countryCode}`);
        }

        this.vapi.start(assistantId);
    }

    /** Stop the active interview call */
    async stopInterview(): Promise<void> {
        if (!this.vapi) return;
        this.vapi.stop();
    }

    /** Mute / unmute the student microphone */
    setMuted(muted: boolean): void {
        if (!this.vapi) return;
        this.vapi.setMuted(muted);
    }

    /** Get active call ID for DB storage */
    getCallId(): string | null {
        return this.currentCallId;
    }

    /** Cleanup on unmount */
    destroy(): void {
        this.stopInterview();
        this.vapi = null;
    }
}

// Export singleton
export const vapiService = new VapiService();
