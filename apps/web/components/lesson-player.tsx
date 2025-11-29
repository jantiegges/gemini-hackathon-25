"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactElement, useCallback, useState } from "react";
import type {
	FillInBlankCardContent,
	InfographicCardContent,
	InteractiveVisualCardContent,
	McQuestionCardContent,
	TextCardContent,
} from "@/lib/cards";
import type { Card } from "@/lib/types";
import { CardTemplate } from "./cards/card-template";
import { FillInBlankCard } from "./cards/fill-in-blank-card";
import { InfographicCard } from "./cards/infographic-card";
import { InteractiveVisualCard } from "./cards/interactive-visual-card";
import { McQuestionCard } from "./cards/mc-question-card";
import { TextCard } from "./cards/text-card";
import { LessonComplete } from "./lesson-complete";

interface LessonPlayerProps {
	documentId: string;
	lessonId: string;
	lessonTitle: string;
	cards: Card[];
}

// Card types that count as "questions" for scoring
const QUESTION_CARD_TYPES = ["mc_question", "fill_in_blank"];

export function LessonPlayer({
	documentId,
	lessonId,
	cards,
}: LessonPlayerProps) {
	const router = useRouter();
	const [currentCardIndex, setCurrentCardIndex] = useState(0);
	const [correctAnswers, setCorrectAnswers] = useState(0);
	const [isComplete, setIsComplete] = useState(false);
	const [direction, setDirection] = useState<"forward" | "backward">("forward");
	const [isRegenerating, setIsRegenerating] = useState(false);

	const handleRegenerate = useCallback(async () => {
		if (isRegenerating) return;

		const confirmed = window.confirm(
			"This will regenerate all cards for this lesson with new content and images. Continue?",
		);
		if (!confirmed) return;

		setIsRegenerating(true);
		try {
			const response = await fetch(
				`/api/lessons/${lessonId}/generate?force=true`,
				{
					method: "POST",
				},
			);

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to regenerate");
			}

			// Refresh the page to show new cards
			router.refresh();
		} catch (error) {
			console.error("Regeneration failed:", error);
			alert("Failed to regenerate cards. Please try again.");
		} finally {
			setIsRegenerating(false);
		}
	}, [lessonId, router, isRegenerating]);

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
						<TextCard content={content} onContinue={handleContinue} />
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
						<McQuestionCard content={content} onAnswer={handleAnswer} />
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
						<FillInBlankCard content={content} onAnswer={handleAnswer} />
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
						<InfographicCard content={content} onContinue={handleContinue} />
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
						<InteractiveVisualCard
							content={content}
							onContinue={handleContinue}
						/>
					</CardTemplate>
				);
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
						<TextCard content={fallbackContent} onContinue={handleContinue} />
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
	};

	return (
		<>
			{renderCard()}
			{/* Regenerate button - top right corner */}
			<button
				onClick={handleRegenerate}
				disabled={isRegenerating}
				className="fixed top-6 right-6 z-50 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/40 text-slate-600 hover:text-slate-900 hover:bg-white/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
				title="Regenerate cards with new images"
			>
				<RefreshCw
					className={`w-5 h-5 ${isRegenerating ? "animate-spin" : ""}`}
				/>
			</button>
		</>
	);
}
