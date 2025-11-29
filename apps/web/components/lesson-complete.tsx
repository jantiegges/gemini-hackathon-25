"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Confetti colors matching the app theme
const CONFETTI_COLORS = [
	"#5D5FEF", // app-gradient-purple
	"#FF4F87", // app-gradient-pink
	"#FF8A3C", // app-gradient-orange
	"#C9B7FF", // app-blob-purple
	"#F9C6D0", // app-blob-pink
	"#FFD599", // app-blob-orange
];

function Confetti({ passed }: { passed: boolean }) {
	const [mounted, setMounted] = useState(false);
	const [particles] = useState(() => {
		return Array.from({ length: 50 }, (_, i) => {
			const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
			const left = Math.random() * 100;
			const delay = Math.random() * 0.5;
			const duration = 2 + Math.random() * 1;
			const rotation = Math.random() * 360;
			const xOffset = (Math.random() - 0.5) * 200;
			return { i, color, left, delay, duration, rotation, xOffset };
		});
	});

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!passed || !mounted) return null;

	const viewportHeight =
		typeof window !== "undefined" ? window.innerHeight : 800;

	return (
		<div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
			{particles.map((particle) => (
				<motion.div
					key={particle.i}
					className="absolute w-2 h-2 rounded-sm"
					style={{
						backgroundColor: particle.color,
						left: `${particle.left}%`,
						top: "-10px",
					}}
					initial={{ y: 0, opacity: 1, rotate: 0 }}
					animate={{
						y: viewportHeight + 100,
						opacity: [1, 1, 0],
						rotate: particle.rotation + 720,
						x: particle.xOffset,
					}}
					transition={{
						duration: particle.duration,
						delay: particle.delay,
						ease: "easeOut",
					}}
				/>
			))}
		</div>
	);
}

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

	const score =
		totalQuestions > 0
			? Math.round((correctAnswers / totalQuestions) * 100)
			: 100;
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

	const getPerformanceText = () => {
		if (passed) {
			return "Excellent work! You've demonstrated a strong understanding of the material.";
		} else if (score >= 50) {
			return "Good effort! You're making progress, but there's still room for improvement.";
		} else {
			return "Keep practicing! Review the material and try again to improve your score.";
		}
	};

	return (
		<>
			<Confetti passed={passed} />
			<div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
				{/* Subtle animated background circles */}
				<div className="relative mb-8">
					{/* Outermost - soft purple */}
					<div className="absolute inset-0 flex items-center justify-center">
						<motion.div
							animate={{
								scale: [1, 1.2, 1],
								opacity: [0.2, 0.3, 0.2],
							}}
							transition={{
								duration: 3,
								repeat: Infinity,
								ease: "easeInOut",
							}}
							className="w-40 h-40 rounded-full bg-app-blob-purple/30 blur-xl"
						/>
					</div>
					{/* Middle - soft pink */}
					<div className="absolute inset-0 flex items-center justify-center">
						<motion.div
							animate={{
								scale: [1, 1.3, 1],
								opacity: [0.25, 0.15, 0.25],
							}}
							transition={{
								duration: 3,
								repeat: Infinity,
								ease: "easeInOut",
								delay: 0.5,
							}}
							className="w-32 h-32 rounded-full bg-app-blob-pink/40 blur-lg"
						/>
					</div>
					{/* Inner - soft orange */}
					<div className="absolute inset-0 flex items-center justify-center">
						<motion.div
							animate={{
								scale: [1, 1.1, 1],
								opacity: [0.3, 0.15, 0.3],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								ease: "easeInOut",
								delay: 1,
							}}
							className="w-24 h-24 rounded-full bg-app-blob-orange/35 blur-md"
						/>
					</div>
				</div>

				{/* Title */}
				<motion.h1
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.4 }}
					className="text-3xl md:text-4xl font-display font-semibold text-slate-900/95 mb-4"
				>
					{passed ? "Lesson Complete!" : "Keep Practicing!"}
				</motion.h1>

				{/* Performance text */}
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.4 }}
					className={cn(
						"text-base md:text-lg font-light mb-6 max-w-md leading-relaxed",
						passed
							? "text-slate-700/90"
							: score >= 50
								? "text-slate-600/90"
								: "text-slate-600/90",
					)}
				>
					{getPerformanceText()}
				</motion.p>

				{/* Score details */}
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 0.4 }}
					className="text-sm font-light text-slate-500/90 mb-8"
				>
					{correctAnswers} of {totalQuestions} questions correct
				</motion.p>

				{/* Actions */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 0.4 }}
					className="flex flex-col sm:flex-row gap-4 w-full max-w-sm"
				>
					{passed ? (
						<Button
							asChild
							className="flex-1 bg-gradient-to-r from-app-gradient-purple via-app-gradient-pink to-app-gradient-orange hover:opacity-90 text-white shadow-sm"
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
								className="flex-1 bg-gradient-to-r from-app-gradient-purple via-app-gradient-pink to-app-gradient-orange hover:opacity-90 text-white shadow-sm"
								size="lg"
							>
								Try Again
							</Button>
							<Button
								asChild
								variant="outline"
								className="flex-1 border-slate-200 hover:bg-slate-50"
								size="lg"
							>
								<Link href={`/${documentId}`}>Back to Lessons</Link>
							</Button>
						</>
					)}
				</motion.div>

				{/* Loading indicator */}
				{isSubmitting && (
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="mt-4 text-sm font-light text-slate-500/90"
					>
						Saving progress...
					</motion.p>
				)}
			</div>
		</>
	);
}
