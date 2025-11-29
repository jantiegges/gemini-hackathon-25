"use client";

import type { Lesson } from "@/lib/types";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { CheckCircle2, Lock, Play, Star } from "lucide-react";
import Link from "next/link";

interface LearningPathProps {
	documentId: string;
	lessons: Lesson[];
}

// Duolingo-style colors for lesson nodes
const lessonColors = [
	{ bg: "from-emerald-400 to-emerald-600", shadow: "shadow-emerald-500/30" },
	{ bg: "from-sky-400 to-sky-600", shadow: "shadow-sky-500/30" },
	{ bg: "from-violet-400 to-violet-600", shadow: "shadow-violet-500/30" },
	{ bg: "from-amber-400 to-amber-600", shadow: "shadow-amber-500/30" },
	{ bg: "from-rose-400 to-rose-600", shadow: "shadow-rose-500/30" },
	{ bg: "from-cyan-400 to-cyan-600", shadow: "shadow-cyan-500/30" },
	{ bg: "from-fuchsia-400 to-fuchsia-600", shadow: "shadow-fuchsia-500/30" },
	{ bg: "from-lime-400 to-lime-600", shadow: "shadow-lime-500/30" },
];

interface LessonNodeProps {
	lesson: Lesson;
	index: number;
	isFirst: boolean;
	isLast: boolean;
	documentId: string;
}

function LessonNode({
	lesson,
	index,
	isFirst,
	isLast,
	documentId,
}: LessonNodeProps) {
	const colorIndex = index % lessonColors.length;
	const color = lessonColors[colorIndex];

	// Calculate horizontal offset for the winding path effect
	const offset = Math.sin((index * Math.PI) / 2) * 60;

	// For now, first lesson is active, rest are locked
	// In the future, you'd track progress
	const isActive = isFirst;
	const isCompleted = false;
	const isLocked = !isFirst && !isCompleted;

	return (
		<div className="relative flex flex-col items-center" style={{ marginLeft: `${offset}px` }}>
			{/* Connecting line to previous */}
			{!isFirst && (
				<div className="absolute -top-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500 rounded-full" />
			)}

			{/* Lesson node */}
			<Link
				href={isLocked ? "#" : `/${documentId}/${lesson.id}`}
				className={cn(
					"relative group",
					isLocked && "pointer-events-none",
				)}
			>
				{/* Glow effect for active */}
				{isActive && (
					<div
						className={cn(
							"absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse",
							`bg-gradient-to-br ${color.bg}`,
						)}
						style={{ transform: "scale(1.3)" }}
					/>
				)}

				{/* Main circle */}
				<div
					className={cn(
						"relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
						isLocked
							? "bg-slate-200 dark:bg-slate-700"
							: `bg-gradient-to-br ${color.bg} shadow-lg ${color.shadow}`,
						!isLocked && "hover:scale-110 hover:shadow-xl cursor-pointer",
						isActive && "ring-4 ring-white dark:ring-slate-800 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-900",
					)}
				>
					{isCompleted ? (
						<CheckCircle2 className="w-8 h-8 text-white" />
					) : isLocked ? (
						<Lock className="w-6 h-6 text-slate-400 dark:text-slate-500" />
					) : (
						<Play className="w-8 h-8 text-white fill-white ml-1" />
					)}

					{/* Stars decoration for active */}
					{isActive && (
						<>
							<Star className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
							<Star
								className="absolute -bottom-1 -left-1 w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse"
								style={{ animationDelay: "300ms" }}
							/>
						</>
					)}
				</div>

				{/* Lesson number badge */}
				<div
					className={cn(
						"absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
						isLocked
							? "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
							: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md",
					)}
				>
					{index + 1}
				</div>
			</Link>

			{/* Lesson info */}
			<div className="mt-4 text-center max-w-[200px]">
				<h3
					className={cn(
						"font-semibold text-sm",
						isLocked
							? "text-slate-400 dark:text-slate-500"
							: "text-slate-700 dark:text-slate-200",
					)}
				>
					{lesson.title}
				</h3>
				{lesson.description && !isLocked && (
					<p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
						{lesson.description}
					</p>
				)}
			</div>

			{/* Start button for active lesson */}
			{isActive && (
				<Button
					asChild
					className="mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25"
				>
					<Link href={`/${documentId}/${lesson.id}`}>
						<Play className="w-4 h-4 mr-2 fill-current" />
						Start Lesson
					</Link>
				</Button>
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
		<div className="relative py-8">
			{/* Path background decoration */}
			<div className="absolute inset-0 flex justify-center pointer-events-none">
				<div className="w-px h-full bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
			</div>

			{/* Lessons */}
			<div className="relative flex flex-col items-center gap-16">
				{lessons.map((lesson, index) => (
					<LessonNode
						key={lesson.id}
						lesson={lesson}
						index={index}
						isFirst={index === 0}
						isLast={index === lessons.length - 1}
						documentId={documentId}
					/>
				))}

				{/* Finish flag at the end */}
				<div className="flex flex-col items-center mt-4">
					<div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
						<span className="text-2xl">🏆</span>
					</div>
					<p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
						Complete the course!
					</p>
				</div>
			</div>
		</div>
	);
}

