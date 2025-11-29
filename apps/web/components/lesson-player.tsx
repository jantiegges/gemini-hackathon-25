"use client";

import { useCallback, useState } from "react";
import type {
	FillInBlankCardContent,
	InfographicCardContent,
	McQuestionCardContent,
	TextCardContent,
} from "@/lib/cards";
import type { Card } from "@/lib/types";
import { CardTemplate } from "./cards/card-template";
import { FillInBlankCard } from "./cards/fill-in-blank-card";
import { InfographicCard } from "./cards/infographic-card";
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
	const [currentCardIndex, setCurrentCardIndex] = useState(0);
	const [correctAnswers, setCorrectAnswers] = useState(0);
	const [isComplete, setIsComplete] = useState(false);

	// Count total questions
	const totalQuestions = cards.filter((c) =>
		QUESTION_CARD_TYPES.includes(c.type as string),
	).length;

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

	// Render the appropriate card component based on type
	const renderCard = () => {
		const cardContent = currentCard.content;
		const cardId = currentCard.id;
		const cardType = currentCard.type as string;

		const progress = {
			current: currentCardIndex + 1,
			total: cards.length,
		};

		switch (cardType) {
			case "text": {
				const content = cardContent as TextCardContent;
				return (
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
			}
			case "mc_question": {
				const content = cardContent as McQuestionCardContent;
				return (
					<CardTemplate
						key={cardId}
						title=""
						tag="Knowledge Check"
						tagColor="violet"
						progress={progress}
					>
						<McQuestionCard content={content} onAnswer={handleAnswer} />
					</CardTemplate>
				);
			}
			case "fill_in_blank": {
				const content = cardContent as unknown as FillInBlankCardContent;
				return (
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
			}
			case "infographic": {
				const content = cardContent as unknown as InfographicCardContent;
				return (
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
			}
			default: {
				// Fallback for unknown card types - treat as text
				const fallbackContent: TextCardContent = {
					title: "Content",
					body: JSON.stringify(cardContent, null, 2),
				};
				return (
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
			}
		}
	};

	return renderCard();
}
