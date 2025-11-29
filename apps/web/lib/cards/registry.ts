/**
 * Card Registry
 *
 * Central registry of all available card types.
 * To add a new card type:
 * 1. Create a new file in cards/ folder
 * 2. Import and add it to the cardTypes array below
 */

import type { CardTypeDefinition } from "./types";
import { mcQuestionCard } from "./cards/mc-question";
import { textCard } from "./cards/text";

/**
 * All available card types
 * Add new card types here as you create them
 */
export const cardTypes: CardTypeDefinition[] = [
	textCard,
	mcQuestionCard,
	// Future card types:
	// fillBlankCard,
	// audioCard,
	// imageCard,
	// matchingCard,
	// orderingCard,
	// flashcardCard,
	// codeCard,
	// diagramCard,
];

/**
 * Get a card type definition by its type string
 */
export function getCardType(type: string): CardTypeDefinition | undefined {
	return cardTypes.find((ct) => ct.type === type);
}

/**
 * Get all card type names
 */
export function getCardTypeNames(): string[] {
	return cardTypes.map((ct) => ct.type);
}

/**
 * Generate a description of all card types for the planner prompt
 */
export function getCardTypesDescription(): string {
	return cardTypes
		.map(
			(ct) => `
## ${ct.name} (type: "${ct.type}")
${ct.description}
Best used for: ${ct.bestUsedFor}
Output format: ${JSON.stringify(ct.exampleOutput, null, 2)}
`,
		)
		.join("\n---\n");
}

