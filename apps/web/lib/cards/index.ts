/**
 * Card System
 *
 * A modular system for generating learning cards.
 *
 * ## Architecture
 * - types.ts: Core type definitions
 * - registry.ts: Central registry of all card types
 * - planner.ts: Step 1 - Decides which cards to create
 * - generator.ts: Step 2 - Generates card content
 * - cards/: Individual card type definitions
 *
 * ## Adding a New Card Type
 * 1. Create a new file in cards/ (e.g., cards/audio.ts)
 * 2. Define the card with: type, name, description, bestUsedFor, exampleOutput, generate
 * 3. Import and add to registry.ts cardTypes array
 *
 * ## Usage
 * ```typescript
 * import { generateLesson } from '@/lib/cards';
 *
 * const result = await generateLesson({
 *   genAI,
 *   lessonContent: "...",
 *   lessonTitle: "...",
 *   lessonDescription: "...",
 * });
 * ```
 */

export type {
	BlankOption,
	FillInBlankCardContent,
} from "./cards/fill-in-blank";
export type { InfographicCardContent } from "./cards/infographic";
export type { InteractiveVisualCardContent } from "./cards/interactive-visual";
export type { McQuestionCardContent } from "./cards/mc-question";

// Card content types (for use in components)
export type { TextCardContent } from "./cards/text";
// Generator
export { generateCards, generateLesson } from "./generator";
// Planner
export { planLesson } from "./planner";
// Registry
export { cardTypes, getCardType, getCardTypeNames } from "./registry";
// Types
export type {
	CardTypeDefinition,
	GeneratedCard,
	GeneratorContext,
	LessonPlan,
	PlannedCard,
} from "./types";
