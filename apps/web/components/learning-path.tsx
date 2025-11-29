"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle2, Crown, Lock, Play, Sparkles, Star, Zap } from "lucide-react";
import Link from "next/link";
import type { Lesson } from "@/lib/types";

interface LearningPathProps {
	documentId: string;
	lessons: Lesson[];
}

// Duolingo-style vibrant colors
const lessonColors = [
	{ bg: "bg-emerald-500", hover: "hover:bg-emerald-400", glow: "shadow-emerald-500/50", ring: "ring-emerald-300" },
	{ bg: "bg-sky-500", hover: "hover:bg-sky-400", glow: "shadow-sky-500/50", ring: "ring-sky-300" },
	{ bg: "bg-violet-500", hover: "hover:bg-violet-400", glow: "shadow-violet-500/50", ring: "ring-violet-300" },
	{ bg: "bg-amber-500", hover: "hover:bg-amber-400", glow: "shadow-amber-500/50", ring: "ring-amber-300" },
	{ bg: "bg-rose-500", hover: "hover:bg-rose-400", glow: "shadow-rose-500/50", ring: "ring-rose-300" },
	{ bg: "bg-cyan-500", hover: "hover:bg-cyan-400", glow: "shadow-cyan-500/50", ring: "ring-cyan-300" },
	{ bg: "bg-fuchsia-500", hover: "hover:bg-fuchsia-400", glow: "shadow-fuchsia-500/50", ring: "ring-fuchsia-300" },
	{ bg: "bg-lime-500", hover: "hover:bg-lime-400", glow: "shadow-lime-500/50", ring: "ring-lime-300" },
];

// Zigzag pattern: center, right, center, left, center, right...
const getXPosition = (index: number): "left" | "center" | "right" => {
	const pattern: ("left" | "center" | "right")[] = ["center", "right", "center", "left"];
	return pattern[index % 4]!;
};

interface LessonNodeProps {
	lesson: Lesson;
	index: number;
	totalLessons: number;
	documentId: string;
}

function LessonNode({ lesson, index, totalLessons, documentId }: LessonNodeProps) {
	const color = lessonColors[index % lessonColors.length]!;
	const position = getXPosition(index);
	const nextPosition = index < totalLessons - 1 ? getXPosition(index + 1) : null;

	// For demo: first lesson is active, rest are locked
	const isActive = index === 0;
	const isCompleted = false;
	const isLocked = !isActive && !isCompleted;

	// Calculate connector direction
	const getConnectorStyle = () => {
		if (nextPosition === null) return null;
		
		const directions: Record<string, Record<string, string>> = {
			center: { right: "rotate-[30deg]", left: "rotate-[-30deg]", center: "rotate-0" },
			right: { center: "rotate-[-30deg]", left: "rotate-[-45deg]", right: "rotate-0" },
			left: { center: "rotate-[30deg]", right: "rotate-[45deg]", left: "rotate-0" },
		};
		return directions[position]?.[nextPosition] || "rotate-0";
	};

	return (
		<div
			className={cn(
				"relative flex flex-col items-center",
				position === "left" && "self-start ml-8",
				position === "right" && "self-end mr-8",
				position === "center" && "self-center"
			)}
		>
			{/* Connector to next node */}
			{index < totalLessons && (
				<motion.div
					initial={{ scaleY: 0, opacity: 0 }}
					animate={{ scaleY: 1, opacity: 1 }}
					transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
					className={cn(
						"absolute top-full left-1/2 -translate-x-1/2 w-2 h-16 rounded-full origin-top",
						isLocked ? "bg-slate-300 dark:bg-slate-600" : "bg-slate-300 dark:bg-slate-500",
						getConnectorStyle()
					)}
				/>
			)}

			{/* Main node button */}
			<Link
				href={isLocked ? "#" : `/${documentId}/${lesson.id}`}
				className={cn("relative", isLocked && "pointer-events-none")}
			>
				<motion.div
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{
						type: "spring",
						stiffness: 260,
						damping: 20,
						delay: index * 0.1,
					}}
					whileHover={!isLocked ? { scale: 1.15, y: -4 } : {}}
					whileTap={!isLocked ? { scale: 0.95 } : {}}
					className="relative"
				>
					{/* Pulsing glow for active */}
					{isActive && (
						<motion.div
							animate={{
								scale: [1, 1.3, 1],
								opacity: [0.6, 0.2, 0.6],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								ease: "easeInOut",
							}}
							className={cn(
								"absolute inset-0 rounded-full",
								color.bg,
								"blur-xl"
							)}
						/>
					)}

					{/* Node circle */}
					<div
						className={cn(
							"relative w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-200",
							isLocked
								? "bg-slate-200 dark:bg-slate-700 cursor-not-allowed"
								: cn(color.bg, color.hover, "cursor-pointer shadow-lg", color.glow),
							isActive && "ring-4 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-900",
							isActive && color.ring,
							!isLocked && "active:shadow-md"
						)}
					>
						{/* Inner shadow for depth */}
						{!isLocked && (
							<div className="absolute inset-1 rounded-full bg-white/20" />
						)}

						{/* Icon */}
						{isCompleted ? (
							<CheckCircle2 className="w-8 h-8 text-white drop-shadow-sm" />
						) : isLocked ? (
							<Lock className="w-7 h-7 text-slate-400 dark:text-slate-500" />
						) : (
							<Play className="w-8 h-8 text-white fill-white drop-shadow-sm ml-1" />
						)}
					</div>

					{/* Bouncing stars for active node */}
					{isActive && (
						<>
							<motion.div
								animate={{ y: [0, -6, 0], rotate: [0, 15, 0] }}
								transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
								className="absolute -top-2 -right-2"
							>
								<Star className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-md" />
							</motion.div>
							<motion.div
								animate={{ y: [0, -4, 0], rotate: [0, -15, 0] }}
								transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
								className="absolute -top-1 -left-3"
							>
								<Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
							</motion.div>
						</>
					)}

					{/* Lesson number badge */}
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", delay: index * 0.1 + 0.2 }}
						className={cn(
							"absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-900",
							isLocked
								? "bg-slate-300 dark:bg-slate-600 text-slate-500"
								: "bg-white text-slate-800 shadow-md"
						)}
					>
						{index + 1}
					</motion.div>
				</motion.div>
			</Link>

			{/* Lesson title */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: index * 0.1 + 0.2 }}
				className="mt-3 text-center max-w-[140px]"
			>
				<h3
					className={cn(
						"font-bold text-sm leading-tight",
						isLocked ? "text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200"
					)}
				>
					{lesson.title}
				</h3>
			</motion.div>

			{/* Start button for active lesson */}
			{isActive && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.4, type: "spring" }}
				>
					<Button
						asChild
						size="lg"
						className="mt-4 bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/30 border-b-4 border-emerald-700 hover:border-emerald-600 active:border-b-0 active:mt-5 transition-all"
					>
						<Link href={`/${documentId}/${lesson.id}`}>
							<Zap className="w-5 h-5 mr-2 fill-current" />
							START
						</Link>
					</Button>
				</motion.div>
			)}
		</div>
	);
}

export function LearningPath({ documentId, lessons }: LearningPathProps) {
	if (lessons.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-slate-500 dark:text-slate-400">
					No lessons found for this document.
				</p>
			</div>
		);
	}

	return (
		<div className="relative py-8 px-4">
			{/* Vertical dotted line guide */}
			<div className="absolute left-1/2 top-8 bottom-8 -translate-x-1/2 w-0.5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 opacity-50" />

			{/* Lessons container */}
			<div className="relative flex flex-col items-center gap-20">
				{lessons.map((lesson, index) => (
					<LessonNode
						key={lesson.id}
						lesson={lesson}
						index={index}
						totalLessons={lessons.length}
						documentId={documentId}
					/>
				))}

				{/* Trophy at the end */}
				<motion.div
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ delay: lessons.length * 0.1, type: "spring" }}
					className={cn(
						"relative flex flex-col items-center",
						getXPosition(lessons.length) === "left" && "self-start ml-8",
						getXPosition(lessons.length) === "right" && "self-end mr-8",
						getXPosition(lessons.length) === "center" && "self-center"
					)}
				>
					<motion.div
						whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
						transition={{ duration: 0.4 }}
						className="w-20 h-20 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/40 cursor-pointer border-b-4 border-amber-600"
					>
						<Crown className="w-10 h-10 text-white fill-white drop-shadow-md" />
					</motion.div>
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: lessons.length * 0.1 + 0.2 }}
						className="mt-3 text-sm font-bold text-amber-600 dark:text-amber-400"
					>
						FINISH!
					</motion.p>
				</motion.div>
			</div>
		</div>
	);
}
