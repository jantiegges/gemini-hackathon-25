"use client";

import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LessonStatus } from "@/lib/types";

interface LessonPageClientProps {
	lessonId: string;
	lessonTitle: string;
	initialStatus: LessonStatus;
}

const generationSteps = [
	{ label: "Reading lesson content", icon: BookOpen },
	{ label: "Creating learning cards", icon: Sparkles },
	{ label: "Preparing your lesson", icon: Loader2 },
];

export function LessonPageClient({
	lessonId,
	lessonTitle,
	initialStatus,
}: LessonPageClientProps) {
	const router = useRouter();
	const [status, setStatus] = useState<LessonStatus>(initialStatus);
	const [currentStep, setCurrentStep] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const isGeneratingRef = useRef(false);

	// Trigger generation if pending
	const triggerGeneration = useCallback(async () => {
		// Prevent multiple simultaneous generation calls
		if (isGeneratingRef.current) {
			console.log("[LessonClient] Generation already in progress, skipping");
			return;
		}
		if (status !== "pending") return;

		isGeneratingRef.current = true;
		setStatus("generating");
		setError(null);

		try {
			console.log("[LessonClient] Starting generation...");
			const response = await fetch(`/api/lessons/${lessonId}/generate`, {
				method: "POST",
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to generate lesson");
			}

			const data = await response.json();
			console.log("[LessonClient] Generation complete:", data);

			// Refresh the page to show the cards
			router.refresh();
		} catch (err) {
			console.error("[LessonClient] Generation failed:", err);
			setError(err instanceof Error ? err.message : "Something went wrong");
			setStatus("pending");
			isGeneratingRef.current = false;
		}
	}, [lessonId, status, router]);

	// Start generation on mount if pending
	useEffect(() => {
		if (initialStatus === "pending" && !isGeneratingRef.current) {
			triggerGeneration();
		}
	}, [initialStatus, triggerGeneration]);

	// Animate through steps while generating
	useEffect(() => {
		if (status !== "generating") return;

		const interval = setInterval(() => {
			setCurrentStep((prev) => (prev + 1) % generationSteps.length);
		}, 3000);

		return () => clearInterval(interval);
	}, [status]);

	// Poll for status changes (but don't trigger generation!)
	useEffect(() => {
		if (status !== "generating") return;

		const supabase = createClient();

		const checkStatus = async () => {
			const { data } = await supabase
				.from("lessons")
				.select("status")
				.eq("id", lessonId)
				.single();

			if (data?.status === "ready") {
				console.log("[LessonClient] Lesson is ready, refreshing...");
				router.refresh();
			} else if (data?.status === "pending") {
				// Generation might have failed, reset
				setStatus("pending");
				isGeneratingRef.current = false;
			}
		};

		const interval = setInterval(checkStatus, 2000);
		return () => clearInterval(interval);
	}, [lessonId, status, router]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
			{error ? (
				<>
					<div className="p-4 rounded-full bg-app-blob-pink/30 mb-6">
						<span className="text-3xl">😕</span>
					</div>
					<h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
						Generation Failed
					</h2>
					<p className="text-slate-500 dark:text-slate-400 mb-6 text-center max-w-md">
						{error}
					</p>
					<button
						type="button"
						onClick={() => {
							isGeneratingRef.current = false;
							setStatus("pending");
							triggerGeneration();
						}}
						className="px-6 py-2 rounded-xl bg-gradient-to-r from-app-gradient-purple via-app-gradient-pink to-app-gradient-orange text-white font-medium transition-all hover:shadow-lg hover:shadow-app-gradient-pink/25 hover:scale-[1.02]"
					>
						Try Again
					</button>
				</>
			) : (
				<>
					{/* Animated background circles - using app's soft pastel blobs */}
					<div className="relative">
						{/* Outermost - soft purple */}
						<div className="absolute inset-0 flex items-center justify-center">
							<motion.div
								animate={{
									scale: [1, 1.2, 1],
									opacity: [0.3, 0.5, 0.3],
								}}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: "easeInOut",
								}}
								className="w-48 h-48 rounded-full bg-app-blob-purple/40 blur-sm"
							/>
						</div>
						{/* Middle - soft pink */}
						<div className="absolute inset-0 flex items-center justify-center">
							<motion.div
								animate={{
									scale: [1, 1.3, 1],
									opacity: [0.4, 0.2, 0.4],
								}}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: "easeInOut",
									delay: 0.5,
								}}
								className="w-36 h-36 rounded-full bg-app-blob-pink/50"
							/>
						</div>
						{/* Inner - soft orange */}
						<div className="absolute inset-0 flex items-center justify-center">
							<motion.div
								animate={{
									scale: [1, 1.1, 1],
									opacity: [0.4, 0.2, 0.4],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									ease: "easeInOut",
									delay: 1,
								}}
								className="w-28 h-28 rounded-full bg-app-blob-orange/40 blur-sm"
							/>
						</div>

						{/* Animated loader container - using app's gradient colors */}
						<div className="relative z-10 flex items-center justify-center w-48 h-48">
							<motion.div
								className="p-5 rounded-2xl bg-gradient-to-br from-app-gradient-purple via-app-gradient-pink to-app-gradient-orange"
								whileHover={{ scale: 1.05 }}
							>
								<div className="relative w-10 h-10">
									{/* Rotating outer ring */}
									<motion.div
										className="absolute inset-0 border-4 border-white/30 rounded-full border-t-white"
										animate={{ rotate: 360 }}
										transition={{
											duration: 1,
											repeat: Infinity,
											ease: "linear",
										}}
									/>
									{/* Rotating inner ring (counter-clockwise) */}
									<motion.div
										className="absolute inset-2 border-2 border-white/40 rounded-full border-b-white"
										animate={{ rotate: -360 }}
										transition={{
											duration: 1.5,
											repeat: Infinity,
											ease: "linear",
										}}
									/>
									{/* Pulsing center dot */}
									<motion.div
										className="absolute inset-0 flex items-center justify-center"
										animate={{
											scale: [1, 1.3, 1],
											opacity: [0.7, 1, 0.7],
										}}
										transition={{
											duration: 1.5,
											repeat: Infinity,
											ease: "easeInOut",
										}}
									>
										<div className="w-3 h-3 rounded-full bg-white shadow-lg shadow-white/50" />
									</motion.div>
									{/* Orbiting particles */}
									<motion.div
										className="absolute inset-0"
										style={{ transformOrigin: "center" }}
										animate={{ rotate: 360 }}
										transition={{
											duration: 2,
											repeat: Infinity,
											ease: "linear",
										}}
									>
										{[0, 1, 2].map((i) => {
											const angle = i * 120 - 90; // Start at top, space evenly
											const radius = 14;
											const x = Math.cos((angle * Math.PI) / 180) * radius;
											const y = Math.sin((angle * Math.PI) / 180) * radius;
											return (
												<div
													key={`particle-${i}`}
													className="absolute w-1.5 h-1.5 rounded-full bg-white/90"
													style={{
														top: `calc(50% + ${y}px)`,
														left: `calc(50% + ${x}px)`,
														transform: "translate(-50%, -50%)",
													}}
												/>
											);
										})}
									</motion.div>
								</div>
							</motion.div>
						</div>
					</div>

					{/* Text content */}
					<div className="mt-10 text-center space-y-3 h-24">
						<AnimatePresence mode="wait">
							<motion.div
								key={currentStep}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.3 }}
							>
								<h2 className="text-2xl font-bold text-slate-800 dark:text-white">
									{generationSteps[currentStep]?.label}
								</h2>
								<p className="text-slate-500 dark:text-slate-400 mt-2">
									Preparing: {lessonTitle}
								</p>
							</motion.div>
						</AnimatePresence>
					</div>

					{/* Progress dots */}
					<div className="flex gap-2 mt-8">
						{generationSteps.map((step, index) => (
							<motion.div
								key={step.label}
								className={cn(
									"h-2.5 rounded-full",
									index === currentStep
										? "bg-gradient-to-r from-app-gradient-purple via-app-gradient-pink to-app-gradient-orange shadow-sm shadow-app-gradient-pink/40"
										: index < currentStep
											? "bg-app-blob-pink"
											: "bg-slate-200",
								)}
								animate={{
									width: index === currentStep ? 32 : 8,
									backgroundColor:
										index === currentStep ? "#8b5cf6" : "#cbd5e1", // fallback colors, actually using classNames
								}}
								transition={{ duration: 0.3, ease: "easeOut" }}
							/>
						))}
					</div>

					{/* Subtle message */}
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 2 }}
						className="mt-8 text-sm text-slate-400 dark:text-slate-500"
					>
						This usually takes about 15 seconds...
					</motion.p>
				</>
			)}
		</div>
	);
}
