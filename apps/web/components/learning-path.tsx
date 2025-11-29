"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "framer-motion";
import {
	CheckCircle2,
	Clock,
	Crown,
	Lock,
	Play,
	Sparkles,
	Star,
	Zap,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Lesson } from "@/lib/types";

interface LearningPathProps {
	documentId: string;
	lessons: Lesson[];
	documentName: string;
}

// Light theme pastel colors for lesson nodes
const lessonColors = [
	{
		bg: "bg-emerald-400",
		hover: "hover:bg-emerald-500",
		glow: "shadow-emerald-400/40",
		ring: "ring-emerald-400/50",
	},
	{
		bg: "bg-sky-400",
		hover: "hover:bg-sky-500",
		glow: "shadow-sky-400/40",
		ring: "ring-sky-400/50",
	},
	{
		bg: "bg-violet-400",
		hover: "hover:bg-violet-500",
		glow: "shadow-violet-400/40",
		ring: "ring-violet-400/50",
	},
	{
		bg: "bg-amber-400",
		hover: "hover:bg-amber-500",
		glow: "shadow-amber-400/40",
		ring: "ring-amber-400/50",
	},
	{
		bg: "bg-rose-400",
		hover: "hover:bg-rose-500",
		glow: "shadow-rose-400/40",
		ring: "ring-rose-400/50",
	},
	{
		bg: "bg-cyan-400",
		hover: "hover:bg-cyan-500",
		glow: "shadow-cyan-400/40",
		ring: "ring-cyan-400/50",
	},
	{
		bg: "bg-fuchsia-400",
		hover: "hover:bg-fuchsia-500",
		glow: "shadow-fuchsia-400/40",
		ring: "ring-fuchsia-400/50",
	},
	{
		bg: "bg-teal-400",
		hover: "hover:bg-teal-500",
		glow: "shadow-teal-400/40",
		ring: "ring-teal-400/50",
	},
];

// Layout constants
const NODE_SIZE = 72;
const ROW_HEIGHT = 220;
const CONTAINER_WIDTH = 500;
const X_POSITIONS = {
	left: CONTAINER_WIDTH / 2 - 110,
	center: CONTAINER_WIDTH / 2,
	right: CONTAINER_WIDTH / 2 + 110,
};

// Zigzag pattern
const getXPosition = (index: number): "left" | "center" | "right" => {
	const pattern: ("left" | "center" | "right")[] = [
		"center",
		"right",
		"center",
		"left",
	];
	return pattern[index % 4]!;
};

const getNodeCenter = (index: number) => {
	const pos = getXPosition(index);
	return {
		x: X_POSITIONS[pos],
		y: index * ROW_HEIGHT + NODE_SIZE / 2,
	};
};

interface LessonNodeProps {
	lesson: Lesson;
	index: number;
	isUnlocked: boolean;
	documentId: string;
}

function LessonNode({
	lesson,
	index,
	isUnlocked,
	documentId,
}: LessonNodeProps) {
	const color = lessonColors[index % lessonColors.length]!;
	const { x, y } = getNodeCenter(index);
	const position = getXPosition(index);

	const isCompleted = lesson.is_completed;
	const isLocked = !isUnlocked;
	const isActive = isUnlocked && !isCompleted;

	// Determine text position: opposite side of node position
	// left node → text on right, right node → text on left, center → alternate
	const textOnRight =
		position === "left" || (position === "center" && index % 2 === 0);

	return (
		<motion.div
			initial={{ scale: 0, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{
				type: "spring",
				stiffness: 260,
				damping: 20,
				delay: index * 0.1,
			}}
			className="absolute"
			style={{
				left: x - NODE_SIZE / 2,
				top: y - NODE_SIZE / 2,
			}}
		>
			<Link
				href={isLocked ? "#" : `/${documentId}/${lesson.id}`}
				className={cn("relative block", isLocked && "pointer-events-none")}
			>
				<motion.div
					whileHover={!isLocked ? { scale: 1.15, y: -4 } : {}}
					whileTap={!isLocked ? { scale: 0.95 } : {}}
					className="relative"
				>
					{/* Pulsing glow for active */}
					{isActive && (
						<motion.div
							animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
							transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
							className={cn("absolute inset-0 rounded-full blur-xl", color.bg)}
						/>
					)}

					{/* Node circle */}
					<div
						className={cn(
							"relative rounded-full flex items-center justify-center transition-all duration-200",
							isLocked
								? "bg-gradient-to-b from-slate-200 to-slate-300 cursor-not-allowed shadow-md border-b-4 border-slate-400"
								: cn(
										color.bg,
										color.hover,
										"cursor-pointer shadow-lg",
										color.glow,
									),
							isActive && "ring-4 ring-offset-4 ring-offset-white",
							isActive && color.ring,
							!isLocked && "active:shadow-md",
						)}
						style={{ width: NODE_SIZE, height: NODE_SIZE }}
					>
						{/* Inner highlight/shine */}
						{!isLocked && (
							<div className="absolute inset-1 rounded-full bg-white/25" />
						)}
						{isCompleted ? (
							<CheckCircle2 className="w-8 h-8 text-white drop-shadow-sm" />
						) : isLocked ? (
							<Lock className="w-6 h-6 text-slate-400" />
						) : (
							<Play className="w-8 h-8 text-white fill-white drop-shadow-sm ml-1" />
						)}
					</div>

					{/* Stars for active */}
					{isActive && (
						<>
							<motion.div
								animate={{ y: [0, -6, 0], rotate: [0, 15, 0] }}
								transition={{ duration: 1.5, repeat: Infinity }}
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
							"absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
							isLocked
								? "bg-slate-300 text-slate-500"
								: isCompleted
									? "bg-emerald-500 text-white shadow-md"
									: "bg-white text-slate-700 shadow-md border border-slate-200",
						)}
					>
						{isCompleted ? "✓" : index + 1}
					</motion.div>

					{/* Score badge for completed lessons */}
					{isCompleted && lesson.best_score !== null && (
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", delay: index * 0.1 + 0.3 }}
							className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 text-xs font-bold shadow-md"
						>
							{lesson.best_score}%
						</motion.div>
					)}
				</motion.div>
			</Link>

			{/* Title - positioned to the side */}
			<motion.div
				initial={{ opacity: 0, x: textOnRight ? -10 : 10 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ delay: index * 0.1 + 0.2 }}
				className={cn(
					"absolute top-1/2 -translate-y-1/2 w-[120px]",
					textOnRight ? "left-full ml-4" : "right-full mr-4",
				)}
			>
				<h3
					className={cn(
						"text-sm font-bold leading-tight",
						textOnRight ? "text-left" : "text-right",
						isLocked ? "text-slate-400" : "text-slate-700",
					)}
				>
					{lesson.title}
				</h3>
			</motion.div>

			{/* Start/Continue button for active lesson */}
			{isActive && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ delay: 0.4, type: "spring" }}
					className="absolute top-full left-1/2 -translate-x-1/2 mt-3"
				>
					<Button
						asChild
						size="sm"
						className="bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/30 border-b-4 border-emerald-700 hover:border-emerald-600 active:border-b-0 transition-all whitespace-nowrap"
					>
						<Link href={`/${documentId}/${lesson.id}`}>
							<Zap className="w-4 h-4 mr-1 fill-current" />
							START
						</Link>
					</Button>
				</motion.div>
			)}

			{/* Retry button for completed lessons */}
			{isCompleted && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ delay: 0.4, type: "spring" }}
					className="absolute top-full left-1/2 -translate-x-1/2 mt-3"
				>
					<Link
						href={`/${documentId}/${lesson.id}`}
						className="inline-flex items-center justify-center h-8 px-4 rounded-md text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors whitespace-nowrap"
					>
						Practice Again
					</Link>
				</motion.div>
			)}
		</motion.div>
	);
}

function PathConnectors({ nodeCount }: { nodeCount: number }) {
	const paths: ReactNode[] = [];

	for (let i = 0; i < nodeCount; i++) {
		const from = getNodeCenter(i);
		const to = getNodeCenter(i + 1);

		// Start from bottom of current node, end at top of next node
		const startY = from.y + NODE_SIZE / 2;
		const endY = to.y - NODE_SIZE / 2;

		// Create smooth bezier curve
		const midY = (startY + endY) / 2;
		const pathD = `M ${from.x} ${startY} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${endY}`;

		paths.push(
			<motion.path
				key={i}
				d={pathD}
				fill="none"
				stroke="rgb(226, 232, 240)"
				strokeWidth="5"
				strokeLinecap="round"
				initial={{ pathLength: 0, opacity: 0 }}
				animate={{ pathLength: 1, opacity: 1 }}
				transition={{ delay: i * 0.12, duration: 0.4, ease: "easeOut" }}
			/>,
		);
	}

	const totalHeight = (nodeCount + 1) * ROW_HEIGHT;

	return (
		<svg
			className="absolute top-0 left-0 pointer-events-none"
			width={CONTAINER_WIDTH}
			height={totalHeight}
			style={{ overflow: "visible" }}
			aria-hidden="true"
		>
			{paths}
		</svg>
	);
}

function ProgressSidebar({
	completed,
	total,
	documentId,
	nextLessonId,
	allCompleted,
}: {
	completed: number;
	total: number;
	documentId: string;
	nextLessonId: string | null;
	allCompleted: boolean;
}) {
	const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5 }}
			className="sticky top-8 w-64 self-start h-fit"
		>
			<div className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm p-5">
				{/* Heading */}
				<h3 className="text-sm font-semibold text-slate-700 mb-4">
					Lesson Progress
				</h3>

				{/* Icon + Progress bar row */}
				<div className="flex items-center gap-4">
					{/* Progress Icon */}
					<div
						className={cn(
							"flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
							percentage === 100 ? "bg-amber-100" : "bg-emerald-100",
						)}
					>
						<Zap
							className={cn(
								"w-6 h-6",
								percentage === 100
									? "text-amber-500 fill-amber-500"
									: "text-emerald-500 fill-emerald-500",
							)}
						/>
					</div>

					{/* Progress bar + stats */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between mb-1.5">
							<span className="text-xs font-medium text-slate-500">
								{completed}/{total} lessons
							</span>
							<span
								className={cn(
									"text-sm font-bold",
									percentage === 100 ? "text-amber-500" : "text-emerald-500",
								)}
							>
								{percentage}%
							</span>
						</div>
						<div className="relative h-2.5 bg-slate-200 rounded-full overflow-hidden">
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: `${percentage}%` }}
								transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
								className={cn(
									"h-full rounded-full",
									percentage === 100
										? "bg-gradient-to-r from-amber-400 to-yellow-500"
										: "bg-gradient-to-r from-emerald-400 to-emerald-500",
								)}
							/>
						</div>
					</div>
				</div>

				{/* Estimated Time */}
				<div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-500">
					<Clock className="w-4 h-4" />
					<span className="text-xs font-medium">
						{allCompleted
							? "Completed!"
							: `~${(total - completed) * 5} min remaining`}
					</span>
				</div>
			</div>

			{/* Continue Button - Outside card */}
			<Link
				href={
					allCompleted
						? `/${documentId}`
						: nextLessonId
							? `/${documentId}/${nextLessonId}`
							: `/${documentId}`
				}
				className={cn(
					"mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all",
					allCompleted
						? "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 hover:from-amber-500 hover:to-yellow-600"
						: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700",
				)}
			>
				<Play className="w-4 h-4 fill-current" />
				{allCompleted
					? "Review Course"
					: completed === 0
						? "Start Learning"
						: "Continue"}
			</Link>
		</motion.div>
	);
}

export function LearningPath({ documentId, lessons, documentName }: LearningPathProps) {
	if (lessons.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-slate-500">No lessons found for this document.</p>
			</div>
		);
	}

	// Calculate completion stats
	const completedCount = lessons.filter((l) => l.is_completed).length;

	// Determine which lessons are unlocked
	// A lesson is unlocked if it's the first OR the previous lesson is completed
	const getIsUnlocked = (index: number): boolean => {
		if (index === 0) return true;
		const prevLesson = lessons[index - 1];
		return prevLesson?.is_completed ?? false;
	};

	// Check if all lessons are completed
	const allCompleted = lessons.every((l) => l.is_completed);

	// Find next lesson to continue (first uncompleted & unlocked lesson)
	const nextLesson = lessons.find(
		(lesson, index) => !lesson.is_completed && getIsUnlocked(index),
	);
	const nextLessonId = nextLesson?.id ?? null;

	const totalHeight = (lessons.length + 1) * ROW_HEIGHT;
	const trophyPos = getNodeCenter(lessons.length);

	return (
		<div className="pb-8">
			{/* Document Title */}
			<h1 className="text-3xl md:text-4xl font-extrabold italic text-center mb-20 bg-gradient-to-r from-violet-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent tracking-tight">
				{documentName}
			</h1>

			<div className="flex justify-center">
				{/* Learning Path */}
				<div
					className="relative"
					style={{ width: CONTAINER_WIDTH, height: totalHeight }}
				>
						{/* Connectors */}
						<PathConnectors nodeCount={lessons.length} />

						{/* Lesson nodes */}
						{lessons.map((lesson, index) => (
							<LessonNode
								key={lesson.id}
								lesson={lesson}
								index={index}
								isUnlocked={getIsUnlocked(index)}
								documentId={documentId}
							/>
						))}

						{/* Trophy / Finish Node */}
						<motion.div
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: lessons.length * 0.1, type: "spring" }}
							className="absolute flex flex-col items-center"
							style={{
								left: trophyPos.x - 40,
								top: trophyPos.y - 40,
								width: 80,
							}}
						>
							{/* Glow effect for incomplete state */}
							{!allCompleted && (
								<motion.div
									animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.1, 0.4] }}
									transition={{
										duration: 3,
										repeat: Infinity,
										ease: "easeInOut",
									}}
									className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 blur-xl"
								/>
							)}
							<motion.div
								whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
								transition={{ duration: 0.4 }}
								className={cn(
									"relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-b-4",
									allCompleted
										? "bg-gradient-to-b from-yellow-300 to-amber-500 shadow-amber-500/40 cursor-pointer border-amber-600 animate-bounce"
										: "bg-gradient-to-b from-amber-200 to-amber-400 shadow-amber-400/30 border-amber-500 cursor-default",
								)}
								style={allCompleted ? { animationDuration: "2s" } : {}}
							>
								{/* Shine effect */}
								<div className="absolute inset-1 rounded-full bg-white/30" />
								<Crown
									className={cn(
										"w-10 h-10 drop-shadow-md",
										allCompleted
											? "text-white fill-white"
											: "text-amber-700 fill-amber-700",
									)}
								/>
							</motion.div>
							<motion.p
								animate={!allCompleted ? { y: [0, -3, 0] } : {}}
								transition={{
									duration: 2,
									repeat: Infinity,
									ease: "easeInOut",
								}}
								className="mt-3 text-sm font-bold tracking-wide text-amber-600"
							>
								{allCompleted ? "Course Complete! 🎉" : "🏆 FINISH"}
							</motion.p>
						</motion.div>
					</div>
			</div>
		</div>
	);
}
