/**
 * Card Generator
 *
 * Step 2 of the two-step card generation process.
 * Generates actual card content based on the lesson plan.
 */

import type { GoogleGenAI } from "@google/genai";
import { getCardType } from "./registry";
import type { GeneratedCard, GeneratorContext, LessonPlan } from "./types";

interface GeneratorInput {
	genAI: GoogleGenAI;
	lessonContent: string;
	lessonTitle: string;
	lessonDescription: string;
	plan: LessonPlan;
}

interface GenerationResult {
	cards: GeneratedCard[];
	errors: Array<{ index: number; error: string }>;
}

/**
 * Generate all cards based on the lesson plan
 * Runs generators in parallel for speed
 */
export async function generateCards(
	input: GeneratorInput,
): Promise<GenerationResult> {
	const { genAI, lessonContent, lessonTitle, lessonDescription, plan } = input;

	const results: GeneratedCard[] = [];
	const errors: Array<{ index: number; error: string }> = [];

	// Generate cards in parallel for speed
	const promises = plan.cards.map(async (plannedCard, index) => {
		const cardType = getCardType(plannedCard.type);

		if (!cardType) {
			return {
				index,
				error: `Unknown card type: ${plannedCard.type}`,
				card: null,
			};
		}

		const context: GeneratorContext = {
			genAI,
			lessonContent,
			lessonTitle,
			lessonDescription,
			focus: plannedCard.focus,
		};

		try {
			console.log(
				`[Generator] Generating card ${index + 1}/${plan.cards.length}: ${plannedCard.type} - ${plannedCard.focus}`,
			);
			const card = await cardType.generate(context);
			return { index, error: null, card };
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			console.error(
				`[Generator] Failed to generate card ${index + 1}:`,
				errorMessage,
			);
			return { index, error: errorMessage, card: null };
		}
	});

	const outcomes = await Promise.all(promises);

	// Sort by index to maintain order
	outcomes.sort((a, b) => a.index - b.index);

	for (const outcome of outcomes) {
		if (outcome.card) {
			results.push(outcome.card);
		} else if (outcome.error) {
			errors.push({ index: outcome.index, error: outcome.error });
		}
	}

	return { cards: results, errors };
}

/**
 * Full lesson generation: plan + generate
 * Convenience function that combines both steps
 */
export async function generateLesson(input: {
	genAI: GoogleGenAI;
	lessonContent: string;
	lessonTitle: string;
	lessonDescription: string;
}): Promise<GenerationResult & { plan: LessonPlan }> {
	const { planLesson } = await import("./planner");

	console.log("[Generator] Step 1: Planning lesson structure...");
	const plan = await planLesson(input);
	console.log(`[Generator] Plan created with ${plan.cards.length} cards`);

	console.log("[Generator] Step 2: Generating card content...");
	const result = await generateCards({ ...input, plan });
	console.log(
		`[Generator] Generated ${result.cards.length} cards, ${result.errors.length} errors`,
	);

	return { ...result, plan };
}

