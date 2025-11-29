"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useRef } from "react";
import { LessonCard } from "./lesson-card";
import type { Lesson } from "@/lib/types";

interface LessonWithImage {
	lesson: Lesson;
	documentId: string;
	imagePath: string | null;
}

interface LessonCardsScrollProps {
	lessons: LessonWithImage[];
}

export function LessonCardsScroll({ lessons }: LessonCardsScrollProps) {
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Scroll to the right edge on mount
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollLeft =
				scrollContainerRef.current.scrollWidth;
		}
	}, [lessons]);

	if (lessons.length === 0) {
		return (
			<div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-white/70">
				<div className="mx-auto w-16 h-16 rounded-full bg-app-background flex items-center justify-center mb-4 shadow-sm border border-app-border-light">
					<span className="text-2xl">📚</span>
				</div>
				<h3 className="text-sm font-medium text-slate-600 mb-1">
					No lessons yet
				</h3>
				<p className="text-xs text-slate-400">
					Complete a document to see lessons here
				</p>
			</div>
		);
	}

	return (
		<div className="relative w-full">
			{/* Scrollable container - full width from edge to edge, starting from right */}
			<div
				ref={scrollContainerRef}
				className="overflow-x-auto scrollbar-hide"
			>
				<div className="flex gap-4 min-w-max pr-0 pl-0">
					{lessons.map(({ lesson, documentId, imagePath }) => (
						<LessonCard
							key={lesson.id}
							lesson={lesson}
							documentId={documentId}
							imagePath={imagePath}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

