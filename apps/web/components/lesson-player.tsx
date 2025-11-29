"use client";

import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
	type ReactElement,
	useCallback,
	useCallback,
	useState,
	useState,
} from "react";

import type {
	FillInBlankCardContent,
	InfographicCardContent,
	InteractiveVisualCardContent,
	McQuestionCardContent,
	OralExamCardContent,
	TextCardContent,
	VideoLearningCardContent,
} from "@/lib/cards";
import type { Card } from "@/lib/types";

import { CardTemplate } from "./cards/card-template";

import { FillInBlankCard } from "./cards/fill-in-blank-card";
import { InfographicCard } from "./cards/infographic-card";
import { InteractiveVisualCard } from "./cards/interactive-visual-card";
import { McQuestionCard } from "./cards/mc-question-card";
import { OralExamCard } from "./cards/oral-exam-card";
import { TextCard } from "./cards/text-card";
import { VideoLearningCard } from "./cards/video-learning-card";
import { LessonComplete } from "./lesson-complete";

interface LessonPlayerProps {
	documentId: string;
	lessonId: string;
	lessonTitle: string;
	cards: Card[];
}

// Card types that count as "questions" for scoring
const QUESTION_CARD_TYPES = ["mc_question", "fill_in_blank", "oral_exam"];

export function LessonPlayer({
	documentId,
	lessonId,
	cards,
}: LessonPlayerProps) {
	const [currentCardIndex, setCurrentCardIndex] = useState(0);
	const [correctAnswers, setCorrectAnswers] = useState(0);
	const [isComplete, setIsComplete] = useState(false);
	const [direction, setDirection] = useState<"forward" | "backward">("forward");

	// Count total questions
	const totalQuestions = cards.filter((c) =>
		QUESTION_CARD_TYPES.includes(c.type as string),
	).length;

	const handleContinue = useCallback(() => {
		if (currentCardIndex < cards.length - 1) {
			setDirection("forward");
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
				setDirection("forward");
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

	const handleProgressClick = useCallback(
		(index: number) => {
			// Only allow navigating to cards that have been completed (index < currentCardIndex)
			if (index < currentCardIndex) {
				setDirection("backward");
				setCurrentCardIndex(index);
			}
		},
		[currentCardIndex],
	);

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

	// Sophisticated animation variants with direction awareness and spring physics
	const cardVariants = {
		forward: {
			initial: {
				opacity: 0,
				x: 100,
				y: 30,
				scale: 0.88,
				rotateY: -15,
			},
			animate: {
				opacity: 1,
				x: 0,
				y: 0,
				scale: 1,
				rotateY: 0,
				transition: {
					type: "spring" as const,
					stiffness: 300,
					damping: 30,
					mass: 0.8,
					opacity: { duration: 0.3 },
				},
			},
			exit: {
				opacity: 0,
				x: -100,
				y: -30,
				scale: 0.88,
				rotateY: 15,
				transition: {
					duration: 0.35,
					ease: [0.4, 0, 1, 1] as const,
				},
			},
		},
		backward: {
			initial: {
				opacity: 0,
				x: -100,
				y: -30,
				scale: 0.88,
				rotateY: 15,
			},
			animate: {
				opacity: 1,
				x: 0,
				y: 0,
				scale: 1,
				rotateY: 0,
				transition: {
					type: "spring" as const,
					stiffness: 300,
					damping: 30,
					mass: 0.8,
					opacity: { duration: 0.3 },
				},
			},
			exit: {
				opacity: 0,
				x: 100,
				y: 30,
				scale: 0.88,
				rotateY: -15,
				transition: {
					duration: 0.35,
					ease: [0.4, 0, 1, 1] as const,
				},
			},
		},
	};

	// Content stagger animation for inner elements
	const contentVariants = {
		initial: { opacity: 0, y: 20 },
		animate: {
			opacity: 1,
			y: 0,
			transition: {
				delay: 0.15,
				duration: 0.5,
				ease: [0.16, 1, 0.3, 1] as const,
			},
		},
	};

	// Render the appropriate card component based on type
	const renderCard = () => {
		switch (currentCard.type) {
			case "text":
				return (
					<TextCard
						key={currentCard.id}
						content={currentCard.content as TextCardContent}
						onContinue={handleContinue}
					/>
				);
			case "mc_question":
				return (
					<McQuestionCard
						key={currentCard.id}
						content={currentCard.content as McQuestionCardContent}
						onAnswer={handleAnswer}
					/>
				);
			case "fill_in_blank":
				return (
					<FillInBlankCard
						key={currentCard.id}
						content={currentCard.content as FillInBlankCardContent}
						onAnswer={handleAnswer}
					/>
				);
			case "infographic":
				return (
					<InfographicCard
						key={currentCard.id}
						content={currentCard.content as InfographicCardContent}
						onContinue={handleContinue}
					/>
				);
			case "video_learning":
				return (
					<VideoLearningCard
						key={currentCard.id}
						content={currentCard.content as VideoLearningCardContent}
						onContinue={handleContinue}
					/>
				);
			default:
				// Fallback for unknown card types - treat as text
				return (
					<TextCard
						key={currentCard.id}
						content={{
							title: "Content",
							body: JSON.stringify(currentCard.content, null, 2),
						}}
						onContinue={handleContinue}
					/>
				);
		}
	};

	// Get the color for progress dots based on card type
	const getCardDotColor = (card: Card, index: number): string => {
		if (index === currentCardIndex) {
			return "w-6 bg-gradient-to-r from-violet-500 to-fuchsia-500";
		}
		if (index < currentCardIndex) {
			if (QUESTION_CARD_TYPES.includes(card.type)) {
				return "bg-emerald-400"; // Answered questions
			}
			if (card.type === "infographic") {
				return "bg-fuchsia-400";
			}
			if (card.type === "video_learning") {
				return "bg-rose-400"; // Video learning cards
			}
			return "bg-slate-400 dark:bg-slate-500"; // Completed non-questions
		}
		return "bg-slate-200 dark:bg-slate-700"; // Future cards
	};
	const cardContent = currentCard.content;
	const cardId = currentCard.id;
	const cardType = currentCard.type as string;

	const progress = {
		current: currentCardIndex + 1,
		total: cards.length,
		onProgressClick: handleProgressClick,
	};

	let cardElement: ReactElement;

	switch (cardType) {
		case "text": {
			const content = cardContent as TextCardContent;
			cardElement = (
				<CardTemplate
					key={cardId}
					title={content.title}
					tag="Concept"
					tagColor="sky"
					progress={progress}
				>
					{(setActionButton) => (
						<TextCard
							content={content}
							onContinue={handleContinue}
							setActionButton={setActionButton}
						/>
					)}
				</CardTemplate>
			);
			break;
		}
		case "mc_question": {
			const content = cardContent as McQuestionCardContent;
			cardElement = (
				<CardTemplate
					key={cardId}
					title={content.question}
					tag="Knowledge Check"
					tagColor="violet"
					progress={progress}
				>
					{(setActionButton) => (
						<McQuestionCard
							content={content}
							onAnswer={handleAnswer}
							setActionButton={setActionButton}
						/>
					)}
				</CardTemplate>
			);
			break;
		}
		case "fill_in_blank": {
			const content = cardContent as unknown as FillInBlankCardContent;
			cardElement = (
				<CardTemplate
					key={cardId}
					title=""
					tag="Fill in the Blanks"
					tagColor="amber"
					progress={progress}
				>
					{(setActionButton) => (
						<FillInBlankCard
							content={content}
							onAnswer={handleAnswer}
							setActionButton={setActionButton}
						/>
					)}
				</CardTemplate>
			);
			break;
		}
		case "infographic": {
			const content = cardContent as unknown as InfographicCardContent;
			cardElement = (
				<CardTemplate
					key={cardId}
					title={content.title}
					tag="Infographic"
					tagColor="fuchsia"
					progress={progress}
				>
					{(setActionButton) => (
						<InfographicCard
							content={content}
							onContinue={handleContinue}
							setActionButton={setActionButton}
						/>
					)}
				</CardTemplate>
			);
			break;
		}
		case "interactive_visual": {
			const content = cardContent as unknown as InteractiveVisualCardContent;
			return (
				<CardTemplate
					key={cardId}
					title={content.title}
					tag="Interactive Visual"
					tagColor="emerald"
					progress={progress}
				>
					{(setActionButton) => (
						<InteractiveVisualCard
							content={content}
							onContinue={handleContinue}
							setActionButton={setActionButton}
						/>
					)}
				</CardTemplate>
			);
		}
		case "oral_exam": {
			const content = cardContent as unknown as OralExamCardContent;
			cardElement = (
				<CardTemplate
					key={cardId}
					title={content.topic}
					tag="Oral Exam"
					tagColor="red"
					progress={progress}
				>
					<OralExamCard content={content} onAnswer={handleAnswer} />
				</CardTemplate>
			);
			break;
		}
		default: {
			// Fallback for unknown card types - treat as text
			const fallbackContent: TextCardContent = {
				title: "Content",
				body: JSON.stringify(cardContent, null, 2),
			};
			cardElement = (
				<CardTemplate
					key={cardId}
					title={fallbackContent.title}
					tag="Content"
					tagColor="primary"
					progress={progress}
				>
					{(setActionButton) => (
						<TextCard
							content={fallbackContent}
							onContinue={handleContinue}
							setActionButton={setActionButton}
						/>
					)}
				</CardTemplate>
			);
			break;
		}
	}

	const currentVariants = cardVariants[direction];

	return (
		<div
			className="relative w-full min-h-[80vh] flex items-center justify-center"
			style={{ perspective: "1000px" }}
		>
			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={`card-${currentCardIndex}-${cardId}`}
					variants={currentVariants}
					initial="initial"
					animate="animate"
					exit="exit"
					className="w-full"
					style={{
						transformStyle: "preserve-3d",
					}}
				>
					<motion.div
						variants={contentVariants}
						initial="initial"
						animate="animate"
					>
						{cardElement}
					</motion.div>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

return <>{renderCard()}</>;
}
