"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
	ArrowRight,
	CheckCircle2,
	Loader2,
	Mic,
	MicOff,
	Volume2,
	XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLiveApi } from "@/hooks/use-live-api";
import type { OralExamCardContent } from "@/lib/cards/cards/oral-exam";

interface OralExamCardProps {
	content: OralExamCardContent;
	onAnswer: (isCorrect: boolean) => void;
}

/**
 * Audio visualizer component that shows waveform animation
 */
// Fixed bar IDs to avoid using array indices as keys
const VISUALIZER_BAR_IDS = [
	"a",
	"b",
	"c",
	"d",
	"e",
	"f",
	"g",
	"h",
	"i",
	"j",
	"k",
	"l",
] as const;

function AudioVisualizer({
	isActive,
	isSpeaking,
}: {
	isActive: boolean;
	isSpeaking: boolean;
}) {
	return (
		<div className="flex items-center justify-center gap-1 h-16">
			{VISUALIZER_BAR_IDS.map((id, i) => (
				<div
					key={id}
					className={cn(
						"w-1.5 rounded-full transition-all duration-150",
						isActive
							? isSpeaking
								? "bg-gradient-to-t from-violet-500 to-fuchsia-500"
								: "bg-gradient-to-t from-emerald-500 to-teal-500"
							: "bg-slate-300 dark:bg-slate-600",
					)}
					style={{
						height: isActive ? `${Math.random() * 40 + 20}px` : "8px",
						animationDelay: `${i * 50}ms`,
						transition: isActive ? "height 100ms ease" : "height 300ms ease",
					}}
				/>
			))}
		</div>
	);
}

/**
 * Animated visualizer that updates regularly
 */
function AnimatedVisualizer({
	isActive,
	isSpeaking,
}: {
	isActive: boolean;
	isSpeaking: boolean;
}) {
	const [, setTick] = useState(0);

	useEffect(() => {
		if (!isActive) return;
		const interval = setInterval(() => setTick((t) => t + 1), 100);
		return () => clearInterval(interval);
	}, [isActive]);

	return <AudioVisualizer isActive={isActive} isSpeaking={isSpeaking} />;
}

export function OralExamCard({ content, onAnswer }: OralExamCardProps) {
	const [hasStarted, setHasStarted] = useState(false);

	const { state, connect, disconnect, endExamResult, error, isAiSpeaking } =
		useLiveApi({
			systemPrompt: content.systemPrompt,
			tools: content.tools,
			onError: (err) => {
				console.error("[OralExam] Error:", err);
			},
		});

	const handleStart = useCallback(async () => {
		setHasStarted(true);
		await connect();
	}, [connect]);

	const handleContinue = useCallback(() => {
		disconnect();
		onAnswer(endExamResult?.passed ?? false);
	}, [disconnect, onAnswer, endExamResult]);

	// Get status text based on state
	const getStatusText = () => {
		switch (state) {
			case "connecting":
				return "Connecting...";
			case "connected":
				return "Setting up...";
			case "listening":
				return isAiSpeaking ? "AI is speaking..." : "Listening to you...";
			case "speaking":
				return "AI is speaking...";
			case "ended":
				return "Exam complete";
			case "error":
				return "Connection error";
			default:
				return "Ready to start";
		}
	};

	const isActiveSession =
		state === "connected" || state === "listening" || state === "speaking";

	// Ready state - show start button
	if (!hasStarted) {
		return (
			<div className="flex flex-col h-full">
				<div className="flex-1 flex flex-col items-center justify-center text-center px-4">
					{/* Icon */}
					<div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/25">
						<Mic className="w-10 h-10 text-white" />
					</div>

					{/* Title */}
					<h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
						Oral Examination
					</h3>

					{/* Topic */}
					<p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
						You&apos;ll have a voice conversation with an AI examiner about{" "}
						<span className="font-medium text-slate-900 dark:text-white">
							{content.topic}
						</span>
						. The AI will ask you {content.questionCount} questions.
					</p>

					{/* Instructions */}
					<div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 mb-6 max-w-md text-left">
						<h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
							Before you start:
						</h4>
						<ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
							<li className="flex items-center gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
								Make sure your microphone is working
							</li>
							<li className="flex items-center gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
								Find a quiet environment
							</li>
							<li className="flex items-center gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
								Speak clearly and take your time
							</li>
						</ul>
					</div>
				</div>

				{/* Start button */}
				<div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
					<Button
						onClick={handleStart}
						className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-lg shadow-rose-500/25"
						size="lg"
					>
						<Mic className="w-4 h-4 mr-2" />
						Start Oral Exam
					</Button>
				</div>
			</div>
		);
	}

	// Connecting state
	if (state === "connecting" || state === "connected") {
		return (
			<div className="flex flex-col h-full">
				<div className="flex-1 flex flex-col items-center justify-center text-center px-4">
					<Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
					<p className="text-slate-600 dark:text-slate-400">
						{getStatusText()}
					</p>
					<p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
						Please allow microphone access when prompted
					</p>
				</div>
			</div>
		);
	}

	// Error state
	if (state === "error") {
		return (
			<div className="flex flex-col h-full">
				<div className="flex-1 flex flex-col items-center justify-center text-center px-4">
					<div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
						<MicOff className="w-8 h-8 text-red-500" />
					</div>
					<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
						Connection Error
					</h3>
					<p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md">
						{error ||
							"Failed to connect. Please check your microphone permissions and try again."}
					</p>
				</div>

				<div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
					<Button
						onClick={() => {
							setHasStarted(false);
							disconnect();
						}}
						className="w-full bg-slate-600 hover:bg-slate-700 text-white"
						size="lg"
					>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	// Ended state - show results
	if (state === "ended" && endExamResult) {
		const passed = endExamResult.passed;

		return (
			<div className="flex flex-col h-full">
				<div className="flex-1 flex flex-col items-center justify-center text-center px-4">
					{/* Result icon */}
					<div
						className={cn(
							"w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg",
							passed
								? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/25"
								: "bg-gradient-to-br from-red-500 to-orange-500 shadow-red-500/25",
						)}
					>
						{passed ? (
							<CheckCircle2 className="w-10 h-10 text-white" />
						) : (
							<XCircle className="w-10 h-10 text-white" />
						)}
					</div>

					{/* Result text */}
					<h3
						className={cn(
							"text-2xl font-bold mb-2",
							passed
								? "text-emerald-600 dark:text-emerald-400"
								: "text-red-600 dark:text-red-400",
						)}
					>
						{passed ? "Passed!" : "Not Quite"}
					</h3>

					<p className="text-slate-600 dark:text-slate-400 mb-6">
						{passed
							? "Great job! You demonstrated understanding of the material."
							: "Keep studying and try again when you're ready."}
					</p>

					{/* Feedback */}
					<div
						className={cn(
							"p-4 rounded-xl max-w-md text-left",
							passed
								? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
								: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800",
						)}
					>
						<h4
							className={cn(
								"font-semibold mb-2 text-sm",
								passed
									? "text-emerald-700 dark:text-emerald-300"
									: "text-red-700 dark:text-red-300",
							)}
						>
							Examiner&apos;s Feedback:
						</h4>
						<p
							className={cn(
								"text-sm",
								passed
									? "text-emerald-600 dark:text-emerald-400"
									: "text-red-600 dark:text-red-400",
							)}
						>
							{endExamResult.feedback}
						</p>
					</div>
				</div>

				{/* Continue button */}
				<div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
					<Button
						onClick={handleContinue}
						className={cn(
							"w-full shadow-lg",
							passed
								? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/25"
								: "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-slate-500/25",
						)}
						size="lg"
					>
						Continue
						<ArrowRight className="w-4 h-4 ml-2" />
					</Button>
				</div>
			</div>
		);
	}

	// Active state - show conversation UI
	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 flex flex-col items-center justify-center text-center px-4">
				{/* Status indicator */}
				<div
					className={cn(
						"w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-300",
						isAiSpeaking
							? "bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30"
							: "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30",
					)}
				>
					{isAiSpeaking ? (
						<Volume2 className="w-12 h-12 text-white animate-pulse" />
					) : (
						<Mic className="w-12 h-12 text-white" />
					)}
				</div>

				{/* Status text */}
				<p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
					{isAiSpeaking ? "AI Examiner is speaking" : "Your turn to speak"}
				</p>
				<p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
					{isAiSpeaking
						? "Listen carefully to the question..."
						: "Speak your answer clearly"}
				</p>

				{/* Audio visualizer */}
				<div className="w-full max-w-xs">
					<AnimatedVisualizer
						isActive={isActiveSession}
						isSpeaking={isAiSpeaking}
					/>
				</div>

				{/* Topic reminder */}
				<div className="mt-8 text-sm text-slate-500 dark:text-slate-500">
					Topic: <span className="font-medium">{content.topic}</span>
				</div>
			</div>

			{/* Cancel button (hidden but available) */}
			<div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
				<Button
					onClick={() => {
						disconnect();
						setHasStarted(false);
					}}
					variant="outline"
					className="w-full"
					size="lg"
				>
					<MicOff className="w-4 h-4 mr-2" />
					End Exam Early
				</Button>
			</div>
		</div>
	);
}
