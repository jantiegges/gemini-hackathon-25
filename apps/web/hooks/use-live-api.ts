"use client";

import {
	GoogleGenAI,
	type LiveServerMessage,
	Modality,
	type Session,
} from "@google/genai";
import { useCallback, useEffect, useRef, useState } from "react";

export type LiveApiState =
	| "idle"
	| "connecting"
	| "connected"
	| "listening"
	| "speaking"
	| "ended"
	| "error";

export interface FunctionCall {
	name: string;
	args: Record<string, unknown>;
}

export interface EndExamResult {
	passed: boolean;
	feedback: string;
}

export interface UseLiveApiOptions {
	systemPrompt: string;
	tools?: Array<{
		functionDeclarations: Array<{
			name: string;
			description: string;
			parameters: {
				type: string;
				properties: Record<string, unknown>;
				required?: string[];
			};
		}>;
	}>;
	onFunctionCall?: (call: FunctionCall) => void;
	onError?: (error: string) => void;
}

interface LiveApiReturn {
	state: LiveApiState;
	connect: () => Promise<void>;
	disconnect: () => void;
	endExamResult: EndExamResult | null;
	error: string | null;
	isAiSpeaking: boolean;
}

// Audio configuration
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

/**
 * Hook for managing Gemini Live API connection with real-time audio.
 * Uses the @google/genai SDK with ephemeral tokens for secure client-side access.
 */
export function useLiveApi(options: UseLiveApiOptions): LiveApiReturn {
	const { systemPrompt, tools, onFunctionCall, onError } = options;

	const [state, setState] = useState<LiveApiState>("idle");
	const [endExamResult, setEndExamResult] = useState<EndExamResult | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);
	const [isAiSpeaking, setIsAiSpeaking] = useState(false);

	// Refs
	const sessionRef = useRef<Session | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const mediaStreamRef = useRef<MediaStream | null>(null);
	const processorRef = useRef<ScriptProcessorNode | null>(null);
	const audioQueueRef = useRef<Float32Array[]>([]);
	const isPlayingRef = useRef(false);
	const examEndedRef = useRef(false);

	// Cleanup function
	const cleanup = useCallback(() => {
		if (mediaStreamRef.current) {
			for (const track of mediaStreamRef.current.getTracks()) {
				track.stop();
			}
			mediaStreamRef.current = null;
		}

		if (processorRef.current) {
			processorRef.current.disconnect();
			processorRef.current = null;
		}

		if (audioContextRef.current && audioContextRef.current.state !== "closed") {
			audioContextRef.current.close();
			audioContextRef.current = null;
		}

		if (sessionRef.current) {
			try {
				sessionRef.current.close();
			} catch {
				// Ignore close errors
			}
			sessionRef.current = null;
		}

		audioQueueRef.current = [];
		isPlayingRef.current = false;
	}, []);

	// Play queued audio chunks sequentially
	const playAudioQueue = useCallback(() => {
		if (isPlayingRef.current || audioQueueRef.current.length === 0) {
			return;
		}

		const audioContext = audioContextRef.current;
		if (!audioContext || audioContext.state === "closed") {
			return;
		}

		isPlayingRef.current = true;
		setIsAiSpeaking(true);

		const playNextChunk = () => {
			const chunk = audioQueueRef.current.shift();
			if (
				!chunk ||
				!audioContextRef.current ||
				audioContextRef.current.state === "closed"
			) {
				isPlayingRef.current = false;
				setIsAiSpeaking(false);
				return;
			}

			const buffer = audioContextRef.current.createBuffer(
				1,
				chunk.length,
				OUTPUT_SAMPLE_RATE,
			);
			buffer.getChannelData(0).set(chunk);

			const source = audioContextRef.current.createBufferSource();
			source.buffer = buffer;
			source.connect(audioContextRef.current.destination);
			source.onended = playNextChunk;
			source.start();
		};

		playNextChunk();
	}, []);

	// Convert Int16 PCM to Float32 for Web Audio API
	const int16ToFloat32 = useCallback((int16Array: Int16Array): Float32Array => {
		const float32Array = new Float32Array(int16Array.length);
		for (let i = 0; i < int16Array.length; i++) {
			const value = int16Array[i];
			if (value !== undefined) {
				float32Array[i] = value / 32768;
			}
		}
		return float32Array;
	}, []);

	// Convert Float32 to Int16 PCM for sending to API
	const float32ToInt16 = useCallback(
		(float32Array: Float32Array): Int16Array => {
			const int16Array = new Int16Array(float32Array.length);
			for (let i = 0; i < float32Array.length; i++) {
				const value = float32Array[i];
				if (value !== undefined) {
					const s = Math.max(-1, Math.min(1, value));
					int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
				}
			}
			return int16Array;
		},
		[],
	);

	// Handle incoming messages from the Live API
	const handleMessage = useCallback(
		(message: LiveServerMessage) => {
			// Ignore messages after exam has ended
			if (examEndedRef.current) {
				return;
			}

			// Handle audio data
			if (message.data) {
				try {
					const binaryString = atob(message.data as string);
					const bytes = new Uint8Array(binaryString.length);
					for (let i = 0; i < binaryString.length; i++) {
						bytes[i] = binaryString.charCodeAt(i);
					}
					const int16Data = new Int16Array(
						bytes.buffer,
						bytes.byteOffset,
						bytes.byteLength / Int16Array.BYTES_PER_ELEMENT,
					);
					const float32Data = int16ToFloat32(int16Data);
					audioQueueRef.current.push(float32Data);
					playAudioQueue();
				} catch {
					// Ignore audio processing errors
				}
			}

			// Handle server content
			if (message.serverContent) {
				const content = message.serverContent;
				if (content.turnComplete) {
					setState("listening");
					setIsAiSpeaking(false);
				}
			}

			// Handle tool calls
			if (message.toolCall) {
				const functionCalls = message.toolCall.functionCalls || [];
				for (const fc of functionCalls) {
					const fcName = fc.name || "unknown";
					onFunctionCall?.({ name: fcName, args: fc.args || {} });

					// Handle end_exam (only once)
					if (fcName === "end_exam" && !examEndedRef.current) {
						examEndedRef.current = true;

						const args = fc.args as Record<string, unknown> | undefined;
						const result: EndExamResult = {
							passed: (args?.passed as boolean) ?? false,
							feedback: (args?.feedback as string) ?? "Exam completed.",
						};
						setEndExamResult(result);
						setState("ended");

						// Send tool response and close session
						if (sessionRef.current && fc.id) {
							try {
								sessionRef.current.sendToolResponse({
									functionResponses: [
										{
											id: fc.id,
											name: fcName,
											response: { result: "acknowledged" },
										},
									],
								});
								setTimeout(() => {
									if (sessionRef.current) {
										sessionRef.current.close();
										sessionRef.current = null;
									}
								}, 500);
							} catch {
								// Ignore tool response errors
							}
						}
					}
				}
			}
		},
		[int16ToFloat32, onFunctionCall, playAudioQueue],
	);

	// Setup microphone input
	const setupAudioInput = useCallback(async () => {
		const audioContext = audioContextRef.current;
		const session = sessionRef.current;
		if (!audioContext || !session) return;

		const stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				sampleRate: INPUT_SAMPLE_RATE,
				channelCount: 1,
				echoCancellation: true,
				noiseSuppression: true,
			},
		});

		mediaStreamRef.current = stream;

		const source = audioContext.createMediaStreamSource(stream);
		const processor = audioContext.createScriptProcessor(4096, 1, 1);
		processorRef.current = processor;

		processor.onaudioprocess = (e) => {
			if (!sessionRef.current) return;

			const inputData = e.inputBuffer.getChannelData(0);
			const int16Data = float32ToInt16(inputData);

			const bytes = new Uint8Array(int16Data.buffer);
			let binary = "";
			for (let i = 0; i < bytes.length; i++) {
				binary += String.fromCharCode(bytes[i] as number);
			}
			const base64 = btoa(binary);

			try {
				sessionRef.current.sendRealtimeInput({
					audio: {
						data: base64,
						mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}`,
					},
				});
			} catch {
				// Session might be closed
			}
		};

		source.connect(processor);
		processor.connect(audioContext.destination);
	}, [float32ToInt16]);

	// Connect to Live API
	const connect = useCallback(async () => {
		if (state !== "idle" && state !== "error") {
			return;
		}

		setState("connecting");
		setError(null);
		setEndExamResult(null);
		examEndedRef.current = false;

		try {
			const tokenResponse = await fetch("/api/live/token", { method: "POST" });
			if (!tokenResponse.ok) {
				const errorData = await tokenResponse.json();
				throw new Error(errorData.error || "Failed to get access token");
			}
			const { token } = await tokenResponse.json();

			audioContextRef.current = new AudioContext({
				sampleRate: OUTPUT_SAMPLE_RATE,
			});

			const ai = new GoogleGenAI({
				apiKey: token,
				httpOptions: { apiVersion: "v1alpha" },
			});

			// biome-ignore lint/suspicious/noExplicitAny: SDK types are complex
			const config: any = {
				responseModalities: [Modality.AUDIO],
				systemInstruction: systemPrompt,
				speechConfig: {
					voiceConfig: {
						prebuiltVoiceConfig: {
							voiceName: "Aoede",
						},
					},
				},
			};

			if (tools && tools.length > 0) {
				config.tools = tools;
			}

			const session = await ai.live.connect({
				model: "gemini-2.5-flash-native-audio-preview-09-2025",
				callbacks: {
					onopen: () => {
						setState("listening");
					},
					onmessage: handleMessage,
					onerror: (err: ErrorEvent) => {
						setError(err.message || "Connection error");
						setState("error");
						onError?.(err.message || "Connection error");
					},
					onclose: () => {
						setState((currentState) =>
							currentState === "ended" ? "ended" : "idle",
						);
					},
				},
				config: config,
			});

			sessionRef.current = session;
			await setupAudioInput();
			setState("connected");
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Connection failed";
			setError(errorMessage);
			setState("error");
			onError?.(errorMessage);
			cleanup();
		}
	}, [
		state,
		systemPrompt,
		tools,
		handleMessage,
		setupAudioInput,
		cleanup,
		onError,
	]);

	// Disconnect from Live API
	const disconnect = useCallback(() => {
		cleanup();
		setState("idle");
		setEndExamResult(null);
	}, [cleanup]);

	// Cleanup on unmount
	useEffect(() => {
		return cleanup;
	}, [cleanup]);

	return {
		state,
		connect,
		disconnect,
		endExamResult,
		error,
		isAiSpeaking,
	};
}
