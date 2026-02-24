/**
 * src/store/interview.store.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Zustand global store for live interview session state
 * Keeps UI state centralized and separate from React component logic
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { VapiCallStatus } from "@/services/vapi.service";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TranscriptLine {
    id: string;
    speaker: "STUDENT" | "AI";
    text: string;
    isFinal: boolean;
    timestamp: number;
}

interface InterviewState {
    // Session identifiers
    sessionId: string | null;
    countryCode: string | null;

    // Connection state
    vapiStatus: VapiCallStatus;
    wsConnected: boolean;

    // Interview state
    isLive: boolean;
    isMuted: boolean;
    aiSpeaking: boolean;
    elapsedSecs: number;

    // Transcript
    transcripts: TranscriptLine[];

    // Actions
    setSessionId: (id: string) => void;
    setCountryCode: (code: string) => void;
    setVapiStatus: (status: VapiCallStatus) => void;
    setWsConnected: (connected: boolean) => void;
    setIsLive: (live: boolean) => void;
    setIsMuted: (muted: boolean) => void;
    setAiSpeaking: (speaking: boolean) => void;
    incrementTimer: () => void;
    resetTimer: () => void;
    addTranscript: (line: TranscriptLine) => void;
    updatePartial: (id: string, text: string) => void;
    finalizePartial: (id: string, text: string) => void;
    clearTranscripts: () => void;
    resetSession: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useInterviewStore = create<InterviewState>()(
    subscribeWithSelector((set, get) => ({
        // Initial state
        sessionId: null,
        countryCode: null,
        vapiStatus: "idle",
        wsConnected: false,
        isLive: false,
        isMuted: false,
        aiSpeaking: false,
        elapsedSecs: 0,
        transcripts: [],

        // Setters
        setSessionId: (id) => set({ sessionId: id }),
        setCountryCode: (code) => set({ countryCode: code }),
        setVapiStatus: (status) => set({ vapiStatus: status }),
        setWsConnected: (connected) => set({ wsConnected: connected }),
        setIsLive: (live) => set({ isLive: live }),
        setIsMuted: (muted) => set({ isMuted: muted }),
        setAiSpeaking: (speaking) => set({ aiSpeaking: speaking }),

        // Timer
        incrementTimer: () => set((s) => ({ elapsedSecs: s.elapsedSecs + 1 })),
        resetTimer: () => set({ elapsedSecs: 0 }),

        // Transcript management
        addTranscript: (line) =>
            set((s) => ({ transcripts: [...s.transcripts, line] })),

        updatePartial: (id, text) =>
            set((s) => ({
                transcripts: s.transcripts.map((t) =>
                    t.id === id ? { ...t, text } : t
                ),
            })),

        finalizePartial: (id, text) =>
            set((s) => ({
                transcripts: s.transcripts.map((t) =>
                    t.id === id ? { ...t, text, isFinal: true } : t
                ),
            })),

        clearTranscripts: () => set({ transcripts: [] }),

        // Full session reset
        resetSession: () =>
            set({
                sessionId: null,
                vapiStatus: "idle",
                wsConnected: false,
                isLive: false,
                isMuted: false,
                aiSpeaking: false,
                elapsedSecs: 0,
                transcripts: [],
            }),
    }))
);

// ─── Selectors (memoized) ─────────────────────────────────────────────────────

export const selectIsFullyConnected = (s: InterviewState) =>
    s.wsConnected && s.vapiStatus === "connected";

export const selectFinalTranscripts = (s: InterviewState) =>
    s.transcripts.filter((t) => t.isFinal);

export const selectHasError = (s: InterviewState) =>
    s.vapiStatus === "error";
