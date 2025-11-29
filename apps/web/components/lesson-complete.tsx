"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowLeft, RefreshCw, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface LessonCompleteProps {
	documentId: string;
	lessonId: string;
	correctAnswers: number;
	totalQuestions: number;
	onRetry: () => void;
}

const PASSING_SCORE = 70;

export function LessonComplete({
	documentId,
	lessonId,
	correctAnswers,
	totalQuestions,
	onRetry,
}: LessonCompleteProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [hasSubmitted, setHasSubmitted] = useState(false);

	const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 100;
	const passed = score >= PASSING_SCORE;

	// Submit score to backend
	useEffect(() => {
		if (hasSubmitted) return;

		const submitScore = async () => {
			setIsSubmitting(true);
			try {
				await fetch(`/api/lessons/${lessonId}/complete`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ score }),
				});
			} catch (error) {
				console.error("Failed to submit score:", error);
			} finally {
				setIsSubmitting(false);
				setHasSubmitted(true);
			}
		};

		submitScore();
	}, [lessonId, score, hasSubmitted]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
			{/* Trophy / Result icon */}
			<div
				className={cn(
					"relative mb-8",
					passed && "animate-bounce",
				)}
				style={{ animationDuration: "2s" }}
			>
				{/* Glow effect */}
				{passed && (
					<div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 blur-2xl opacity-30 scale-150" />
				)}

				<div
					className={cn(
						"relative w-24 h-24 rounded-full flex items-center justify-center",
						passed
							? "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-xl shadow-amber-500/30"
							: "bg-gradient-to-br from-slate-400 to-slate-500 shadow-xl shadow-slate-500/30",
					)}
				>
					<Trophy
						className={cn(
							"w-12 h-12",
							passed ? "text-white" : "text-slate-200",
						)}
					/>
				</div>
			</div>

			{/* Title */}
			<h1
				className={cn(
					"text-3xl font-bold mb-2",
					passed
						? "text-amber-600 dark:text-amber-400"
						: "text-slate-600 dark:text-slate-400",
				)}
			>
				{passed ? "Lesson Complete!" : "Keep Practicing!"}
			</h1>

			{/* Score display */}
			<div className="mb-6">
				<div
					className={cn(
						"text-6xl font-bold mb-2",
						passed
							? "text-emerald-500"
							: score >= 50
								? "text-amber-500"
								: "text-red-500",
					)}
				>
					{score}%
				</div>
				<p className="text-slate-500 dark:text-slate-400">
					{correctAnswers} of {totalQuestions} questions correct
				</p>
			</div>

			{/* Message */}
			<p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md">
				{passed
					? "Great job! You've mastered this lesson. Continue to the next one!"
					: `You need at least ${PASSING_SCORE}% to pass. Review the material and try again!`}
			</p>

			{/* Actions */}
			<div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
				{passed ? (
					<Button
						asChild
						className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25"
						size="lg"
					>
						<Link href={`/${documentId}`}>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Lessons
						</Link>
					</Button>
				) : (
					<>
						<Button
							onClick={onRetry}
							className="flex-1 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white shadow-lg shadow-violet-500/25"
							size="lg"
						>
							<RefreshCw className="w-4 h-4 mr-2" />
							Try Again
						</Button>
						<Button
							asChild
							variant="outline"
							className="flex-1"
							size="lg"
						>
							<Link href={`/${documentId}`}>
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to Lessons
							</Link>
						</Button>
					</>
				)}
			</div>

			{/* Loading indicator */}
			{isSubmitting && (
				<p className="mt-4 text-sm text-slate-400">Saving progress...</p>
			)}
		</div>
	);
}

