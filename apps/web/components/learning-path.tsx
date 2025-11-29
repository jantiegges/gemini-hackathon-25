"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "framer-motion";
import {
	CheckCircle2,
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
}

// Duolingo-style vibrant colors
const lessonColors = [
	{
		bg: "bg-emerald-500",
		hover: "hover:bg-emerald-400",
		glow: "shadow-emerald-500/50",
		ring: "ring-emerald-300",
	},
	{
		bg: "bg-sky-500",
		hover: "hover:bg-sky-400",
		glow: "shadow-sky-500/50",
		ring: "ring-sky-300",
	},
	{
		bg: "bg-violet-500",
		hover: "hover:bg-violet-400",
		glow: "shadow-violet-500/50",
		ring: "ring-violet-300",
	},
	{
		bg: "bg-amber-500",
		hover: "hover:bg-amber-400",
		glow: "shadow-amber-500/50",
		ring: "ring-amber-300",
	},
	{
		bg: "bg-rose-500",
		hover: "hover:bg-rose-400",
		glow: "shadow-rose-500/50",
		ring: "ring-rose-300",
	},
	{
		bg: "bg-cyan-500",
		hover: "hover:bg-cyan-400",
		glow: "shadow-cyan-500/50",
		ring: "ring-cyan-300",
	},
	{
		bg: "bg-fuchsia-500",
		hover: "hover:bg-fuchsia-400",
		glow: "shadow-fuchsia-500/50",
		ring: "ring-fuchsia-300",
	},
	{
		bg: "bg-lime-500",
		hover: "hover:bg-lime-400",
		glow: "shadow-lime-500/50",
		ring: "ring-lime-300",
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
	documentId: string;
}

function LessonNode({ lesson, index, documentId }: LessonNodeProps) {
	const color = lessonColors[index % lessonColors.length]!;
	const { x, y } = getNodeCenter(index);
	const position = getXPosition(index);

	const isActive = index === 0;
	const isCompleted = false;
	const isLocked = !isActive && !isCompleted;

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
								? "bg-slate-200 dark:bg-slate-700 cursor-not-allowed"
								: cn(
										color.bg,
										color.hover,
										"cursor-pointer shadow-lg",
										color.glow,
									),
							isActive &&
								"ring-4 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-900",
							isActive && color.ring,
							!isLocked && "active:shadow-md",
						)}
						style={{ width: NODE_SIZE, height: NODE_SIZE }}
					>
						{!isLocked && (
							<div className="absolute inset-1 rounded-full bg-white/20" />
						)}
						{isCompleted ? (
							<CheckCircle2 className="w-8 h-8 text-white drop-shadow-sm" />
						) : isLocked ? (
							<Lock className="w-7 h-7 text-slate-400 dark:text-slate-500" />
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

					{/* Number badge */}
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", delay: index * 0.1 + 0.2 }}
						className={cn(
							"absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-900",
							isLocked
								? "bg-slate-300 dark:bg-slate-600 text-slate-500"
								: "bg-white text-slate-800 shadow-md",
						)}
					>
						{index + 1}
					</motion.div>
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
						isLocked
							? "text-slate-400 dark:text-slate-500"
							: "text-slate-700 dark:text-slate-200",
					)}
				>
					{lesson.title}
				</h3>
			</motion.div>

			{/* Start button - centered below node */}
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
				stroke="rgb(203, 213, 225)"
				strokeWidth="5"
				strokeLinecap="round"
				initial={{ pathLength: 0, opacity: 0 }}
				animate={{ pathLength: 1, opacity: 1 }}
				transition={{ delay: i * 0.12, duration: 0.4, ease: "easeOut" }}
				className="dark:stroke-slate-600"
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

	const totalHeight = (lessons.length + 1) * ROW_HEIGHT;
	const trophyPos = getNodeCenter(lessons.length);

	return (
		<div className="flex justify-center py-8">
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
						documentId={documentId}
					/>
				))}

				{/* Trophy */}
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
					<motion.div
						whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
						transition={{ duration: 0.4 }}
						className="w-20 h-20 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/40 cursor-pointer border-b-4 border-amber-600"
					>
						<Crown className="w-10 h-10 text-white fill-white drop-shadow-md" />
					</motion.div>
					<p className="mt-2 text-sm font-bold text-amber-600 dark:text-amber-400">
						FINISH!
					</p>
				</motion.div>
			</div>
		</div>
	);
}
