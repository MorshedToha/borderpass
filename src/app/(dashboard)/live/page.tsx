/**
 * src/app/(dashboard)/live/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Live Interview Page — Core real-time interview experience
 *
 * Architecture:
 *  - Client component for WebSocket + Vapi real-time interaction
 *  - AI Avatar panel (animated, shows speaking state)
 *  - Student mic recorder with mute/unmute
 *  - Live dual-channel transcript window
 *  - Session timer
 *  - Connection status indicator
 *  - End Interview CTA → triggers scoring and redirects to results
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mic, MicOff, PhoneOff, Wifi, WifiOff, Clock,
    AlertCircle, CheckCircle2, Loader2,
} from "lucide-react";

import { useWebSocket, TranscriptLine } from "@/hooks/useWebSocket";
import { vapiService } from "@/services/vapi.service";
import type { VapiCallStatus } from "@/services/vapi.service";

// ─────────────────────────────────────────────────────────────────────────────

export default function LiveInterviewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("sessionId") ?? "";
    const userId = searchParams.get("userId") ?? "";
    const countryCode = searchParams.get("country") ?? "USA";

    // ── State ──────────────────────────────────────────────────────────────────
    const [isMuted, setIsMuted] = useState(false);
    const [vapiStatus, setVapiStatus] = useState<VapiCallStatus>("idle");
    const [isEnding, setIsEnding] = useState(false);
    const [elapsedSecs, setElapsedSecs] = useState(0);
    const [aiSpeaking, setAiSpeaking] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── WebSocket ──────────────────────────────────────────────────────────────
    const { status: wsStatus, transcripts, endSession: wsEndSession } = useWebSocket({
        sessionId,
        userId,
        onSessionEnd: () => handleEndInterview(),
    });

    // ── Vapi Initialization ────────────────────────────────────────────────────
    useEffect(() => {
        vapiService.initialize({
            onStatusChange: setVapiStatus,
            onCallStart: (callId) => {
                console.log("[Live] Vapi call started:", callId);
                startTimer();
            },
            onCallEnd: () => {
                console.log("[Live] Vapi call ended");
                stopTimer();
            },
            onTranscript: (event) => {
                // Forward transcript to WebSocket for DB persistence + other clients
                // Vapi transcript events are handled inside the Vapi service via
                // the onMessage listener — here we just set AI speaking state
                setAiSpeaking(!event.isFinal && event.role === "assistant");
            },
            onError: (err) => {
                console.error("[Live] Vapi error:", err);
            },
        });

        // Auto-start the interview
        vapiService.startInterview(countryCode);

        return () => {
            vapiService.destroy();
            stopTimer();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Timer ──────────────────────────────────────────────────────────────────
    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setElapsedSecs((s) => s + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    // ── Actions ────────────────────────────────────────────────────────────────
    const toggleMute = useCallback(() => {
        vapiService.setMuted(!isMuted);
        setIsMuted((m) => !m);
    }, [isMuted]);

    const handleEndInterview = useCallback(async () => {
        if (isEnding) return;
        setIsEnding(true);

        vapiService.stopInterview();
        wsEndSession();
        stopTimer();

        // Trigger scoring engine
        try {
            const res = await fetch(`/api/interview/${sessionId}/score`, {
                method: "POST",
            });
            const data = await res.json();
            router.push(`/dashboard/results?sessionId=${sessionId}`);
        } catch (err) {
            console.error("[Live] Score request failed:", err);
            router.push(`/dashboard/results?sessionId=${sessionId}`);
        }
    }, [isEnding, sessionId, router, wsEndSession]);

    // ── Timer Format ───────────────────────────────────────────────────────────
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">

            {/* ── Header Bar ─────────────────────────────────────────────────────── */}
            <header className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <span className="text-brand-400 font-bold text-lg">BOrderpass</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-300 text-sm">{countryCode} Visa Interview</span>
                </div>

                {/* Connection Status */}
                <ConnectionStatus wsStatus={wsStatus} vapiStatus={vapiStatus} />

                {/* Timer */}
                <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
                    <Clock className="w-4 h-4 text-brand-400" />
                    <span className="font-mono text-sm text-white">{formatTime(elapsedSecs)}</span>
                </div>
            </header>

            {/* ── Main Content ───────────────────────────────────────────────────── */}
            <main className="flex flex-1 gap-6 p-6 overflow-hidden">

                {/* Left panel — AI Avatar */}
                <div className="flex flex-col items-center gap-6 w-72 flex-shrink-0">
                    <AIAvatarPanel isSpeaking={aiSpeaking} vapiStatus={vapiStatus} />

                    {/* Student controls */}
                    <div className="w-full bg-gray-900 rounded-2xl p-5 border border-gray-800">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-4 text-center">
                            Your Microphone
                        </p>
                        <div className="flex justify-center">
                            <MicrophoneButton isMuted={isMuted} onToggle={toggleMute} />
                        </div>
                    </div>

                    {/* End Interview */}
                    <button
                        onClick={handleEndInterview}
                        disabled={isEnding}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                    >
                        {isEnding ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Ending…</>
                        ) : (
                            <><PhoneOff className="w-4 h-4" /> End Interview</>
                        )}
                    </button>
                </div>

                {/* Right panel — Live Transcript */}
                <div className="flex-1 flex flex-col bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-800">
                        <h2 className="font-semibold text-gray-200">Live Transcript</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Real-time conversation log</p>
                    </div>
                    <TranscriptWindow transcripts={transcripts} />
                </div>
            </main>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConnectionStatus({
    wsStatus,
    vapiStatus,
}: {
    wsStatus: "connecting" | "connected" | "disconnected" | "error";
    vapiStatus: VapiCallStatus;
}) {
    const isFullyConnected = wsStatus === "connected" && vapiStatus === "connected";
    const hasError = wsStatus === "error" || vapiStatus === "error";

    return (
        <div className="flex items-center gap-2 text-sm">
            {hasError ? (
                <AlertCircle className="w-4 h-4 text-red-400" />
            ) : isFullyConnected ? (
                <CheckCircle2 className="w-4 h-4 text-visa-green" />
            ) : (
                <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
            )}
            <span className={
                hasError ? "text-red-400" :
                    isFullyConnected ? "text-visa-green" :
                        "text-yellow-400"
            }>
                {hasError ? "Connection Error" :
                    isFullyConnected ? "Live" :
                        "Connecting…"}
            </span>
        </div>
    );
}

function AIAvatarPanel({
    isSpeaking,
    vapiStatus,
}: {
    isSpeaking: boolean;
    vapiStatus: VapiCallStatus;
}) {
    return (
        <div className="w-full bg-gray-900 rounded-2xl p-6 border border-gray-800 flex flex-col items-center gap-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">AI Visa Officer</p>

            {/* Avatar with speaking animation */}
            <div className="relative">
                <motion.div
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-600 to-visa-purple flex items-center justify-center text-4xl shadow-xl"
                    animate={isSpeaking ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                    transition={{ duration: 0.8, repeat: isSpeaking ? Infinity : 0 }}
                >
                    🧑‍💼
                </motion.div>

                {/* Speaking pulse rings */}
                {isSpeaking && (
                    <>
                        <motion.div
                            className="absolute inset-0 rounded-full border-2 border-brand-400"
                            animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                        />
                        <motion.div
                            className="absolute inset-0 rounded-full border-2 border-brand-400"
                            animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                        />
                    </>
                )}
            </div>

            <p className="text-sm font-medium text-gray-300">
                {vapiStatus === "connected" && isSpeaking
                    ? "Speaking…"
                    : vapiStatus === "connecting"
                        ? "Connecting to AI…"
                        : "Listening to you"}
            </p>

            {/* Audio wave bars */}
            <div className="flex items-end gap-1 h-6">
                {[...Array(7)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-1.5 bg-brand-400 rounded-full"
                        animate={
                            isSpeaking
                                ? { height: [4, 16, 4] }
                                : { height: 4 }
                        }
                        transition={{
                            duration: 0.6,
                            repeat: isSpeaking ? Infinity : 0,
                            delay: i * 0.08,
                        }}
                        style={{ height: 4 }}
                    />
                ))}
            </div>
        </div>
    );
}

function MicrophoneButton({
    isMuted,
    onToggle,
}: {
    isMuted: boolean;
    onToggle: () => void;
}) {
    return (
        <motion.button
            onClick={onToggle}
            className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-colors ${isMuted
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-brand-600 hover:bg-brand-700"
                }`}
            whileTap={{ scale: 0.9 }}
        >
            {isMuted ? (
                <MicOff className="w-6 h-6 text-white" />
            ) : (
                <Mic className="w-6 h-6 text-white" />
            )}

            {/* Pulse when active */}
            {!isMuted && (
                <motion.div
                    className="absolute inset-0 rounded-full bg-brand-400"
                    animate={{ scale: [1, 1.3], opacity: [0.4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            )}
        </motion.button>
    );
}

function TranscriptWindow({ transcripts }: { transcripts: TranscriptLine[] }) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new transcript
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcripts]);

    return (
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {transcripts.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                    <p className="text-center">
                        The interview will begin shortly.<br />
                        Your conversation will appear here in real-time.
                    </p>
                </div>
            )}

            <AnimatePresence initial={false}>
                {transcripts.map((line) => (
                    <motion.div
                        key={line.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`flex gap-3 ${line.speaker === "AI" ? "flex-row" : "flex-row-reverse"}`}
                    >
                        {/* Avatar bubble */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${line.speaker === "AI"
                                ? "bg-brand-800 text-brand-200"
                                : "bg-emerald-800 text-emerald-200"
                            }`}>
                            {line.speaker === "AI" ? "🧑‍💼" : "🎓"}
                        </div>

                        {/* Text bubble */}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${line.speaker === "AI"
                                ? "bg-gray-800 text-gray-100 rounded-tl-sm"
                                : "bg-brand-700 text-white rounded-tr-sm"
                            } ${!line.isFinal ? "opacity-70 italic" : ""}`}>
                            <p className="text-sm leading-relaxed">{line.text}</p>
                            {!line.isFinal && (
                                <p className="text-xs mt-1 opacity-50">transcribing…</p>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            <div ref={bottomRef} />
        </div>
    );
}
