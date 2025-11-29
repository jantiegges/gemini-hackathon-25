"use client";

import { cn } from "@workspace/ui/lib/utils";
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
	}, []); // Only run once on mount

	// Animate through steps while generating
	useEffect(() => {
		if (status !== "generating") return;

		const interval = setInterval(() => {
			setCurrentStep((prev) => (prev + 1) % generationSteps.length);
		}, 2500);

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

	const CurrentIcon = generationSteps[currentStep].icon;

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
			{error ? (
				<>
					<div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
						<span className="text-3xl">😕</span>
					</div>
					<h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
						Generation Failed
					</h2>
					<p className="text-slate-500 dark:text-slate-400 mb-6 text-center max-w-md">
						{error}
					</p>
					<button
						onClick={() => {
							isGeneratingRef.current = false;
							setStatus("pending");
							triggerGeneration();
						}}
						className="px-6 py-2 rounded-lg bg-violet-500 hover:bg-violet-600 text-white font-medium transition-colors"
					>
						Try Again
					</button>
				</>
			) : (
				<>
					{/* Animated background circles */}
					<div className="relative mb-10">
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="w-36 h-36 rounded-full bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 animate-pulse" />
						</div>
						<div className="absolute inset-0 flex items-center justify-center">
							<div
								className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-400/30 to-fuchsia-400/30 animate-pulse"
								style={{ animationDelay: "150ms" }}
							/>
						</div>

						{/* Icon container */}
						<div className="relative z-10 flex items-center justify-center w-36 h-36">
							<div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-xl shadow-violet-500/25">
								<CurrentIcon
									className={cn(
										"w-10 h-10 text-white",
										CurrentIcon === Loader2 && "animate-spin",
									)}
								/>
							</div>
						</div>
					</div>

					{/* Text content */}
					<div className="text-center space-y-3">
						<h2 className="text-2xl font-bold text-slate-800 dark:text-white">
							{generationSteps[currentStep].label}
						</h2>
						<p className="text-slate-500 dark:text-slate-400">
							Preparing: {lessonTitle}
						</p>
					</div>

					{/* Progress dots */}
					<div className="flex gap-2 mt-8">
						{generationSteps.map((_, index) => (
							<div
								key={index}
								className={cn(
									"w-2 h-2 rounded-full transition-all duration-300",
									index === currentStep
										? "w-8 bg-gradient-to-r from-violet-500 to-fuchsia-500"
										: "bg-slate-300 dark:bg-slate-600",
								)}
							/>
						))}
					</div>

					{/* Subtle message */}
					<p className="mt-8 text-sm text-slate-400 dark:text-slate-500">
						This usually takes about 15 seconds...
					</p>
				</>
			)}
		</div>
	);
}
