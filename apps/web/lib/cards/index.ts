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
	BlankOption,
	FillInBlankCardContent,
	FillInBlankCardContent,
} from "./cards/fill-in-blank";
export type {
	InfographicCardContent,
	InfographicCardContent,
} from "./cards/infographic";
export type { InteractiveVisualCardContent } from "./cards/interactive-visual";
export type {
	McQuestionCardContent,
	McQuestionCardContent,
} from "./cards/mc-question";
export type { OralExamCardContent } from "./cards/oral-exam";
// Card content types (for use in components)
// Card content types (for use in components)
export type { TextCardContent, TextCardContent } from "./cards/text";
export type { VideoLearningCardContent } from "./cards/video-learning";
// Generator
// Generator
export {
	generateCards,
	generateCards,
	generateLesson,
	generateLesson,
} from "./generator";
// Planner
// Planner
export { planLesson, planLesson } from "./planner";
// Registry
// Registry
export {
	cardTypes,
	cardTypes,
	getCardType,
	getCardType,
	getCardTypeNames,
	getCardTypeNames,
} from "./registry";
// Types
export type {
	CardTypeDefinition,
	GeneratedCard,
	GeneratorContext,
	LessonPlan,
	PlannedCard,
} from "./types";
