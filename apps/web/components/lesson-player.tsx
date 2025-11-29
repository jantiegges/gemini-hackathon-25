"use client";

import type { Card, McQuestionCardContent, TextCardContent } from "@/lib/types";
import { cn } from "@workspace/ui/lib/utils";
import { useCallback, useState } from "react";
import { McQuestionCard } from "./cards/mc-question-card";
import { TextCard } from "./cards/text-card";
import { LessonComplete } from "./lesson-complete";

interface LessonPlayerProps {
	documentId: string;
	lessonId: string;
	lessonTitle: string;
	cards: Card[];
}

export function LessonPlayer({
	documentId,
	lessonId,
	lessonTitle,
	cards,
}: LessonPlayerProps) {
	const [currentCardIndex, setCurrentCardIndex] = useState(0);
	const [correctAnswers, setCorrectAnswers] = useState(0);
	const [isComplete, setIsComplete] = useState(false);

	// Count total questions
	const totalQuestions = cards.filter((c) => c.type === "mc_question").length;

	const handleContinue = useCallback(() => {
		if (currentCardIndex < cards.length - 1) {
			setCurrentCardIndex((prev) => prev + 1);
		} else {
			setIsComplete(true);
		}
	}, [currentCardIndex, cards.length]);

	const handleAnswer = useCallback(
		(isCorrect: boolean) => {
			if (isCorrect) {
				setCorrectAnswers((prev) => prev + 1);
			}
			// Move to next card after answering
			if (currentCardIndex < cards.length - 1) {
				setCurrentCardIndex((prev) => prev + 1);
			} else {
				setIsComplete(true);
			}
		},
		[currentCardIndex, cards.length],
	);

	const handleRetry = useCallback(() => {
		setCurrentCardIndex(0);
		setCorrectAnswers(0);
		setIsComplete(false);
	}, []);

	// Show completion screen
	if (isComplete) {
		return (
			<LessonComplete
				documentId={documentId}
				lessonId={lessonId}
				correctAnswers={correctAnswers}
				totalQuestions={totalQuestions}
				onRetry={handleRetry}
			/>
		);
	}

	const currentCard = cards[currentCardIndex];
	if (!currentCard) {
		return <div>No cards found</div>;
	}

	return (
		<div className="flex flex-col h-full max-w-2xl mx-auto">
			{/* Progress bar */}
			<div className="mb-6">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-medium text-slate-600 dark:text-slate-400">
						{lessonTitle}
					</span>
					<span className="text-sm text-slate-500 dark:text-slate-500">
						{currentCardIndex + 1} / {cards.length}
					</span>
				</div>
				<div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
					<div
						className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300 ease-out"
						style={{
							width: `${((currentCardIndex + 1) / cards.length) * 100}%`,
						}}
					/>
				</div>
			</div>

			{/* Progress dots */}
			<div className="flex justify-center gap-1.5 mb-8">
				{cards.map((card, index) => (
					<div
						key={card.id}
						className={cn(
							"w-2 h-2 rounded-full transition-all duration-200",
							index === currentCardIndex
								? "w-6 bg-gradient-to-r from-violet-500 to-fuchsia-500"
								: index < currentCardIndex
									? card.type === "mc_question"
										? "bg-emerald-400"
										: "bg-slate-400 dark:bg-slate-500"
									: "bg-slate-200 dark:bg-slate-700",
						)}
					/>
				))}
			</div>

			{/* Card content */}
			<div className="flex-1 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
				{currentCard.type === "text" ? (
					<TextCard
						key={currentCard.id}
						content={currentCard.content as TextCardContent}
						onContinue={handleContinue}
					/>
				) : (
					<McQuestionCard
						key={currentCard.id}
						content={currentCard.content as McQuestionCardContent}
						onAnswer={handleAnswer}
					/>
				)}
			</div>
		</div>
	);
}

