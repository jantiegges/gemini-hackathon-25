/**
 * Card System Types
 *
 * This file defines the core types for the card system.
 * Each card type has a definition (metadata) and a generator (creates content).
 */

import type { GoogleGenAI } from "@google/genai";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Context passed to card generators
 */
export interface GeneratorContext {
	/** The Gemini AI client */
	genAI: GoogleGenAI;
	/** Supabase client for storage operations */
	supabase: SupabaseClient;
	/** The lesson ID (for organizing uploads) */
	lessonId: string;
	/** Combined content from the lesson's chunks */
	lessonContent: string;
	/** The lesson title */
	lessonTitle: string;
	/** The lesson description */
	lessonDescription: string;
	/** What this specific card should focus on (from planner) */
	focus: string;
}

/**
 * Result from a card generator
 */
export interface GeneratedCard {
	type: string;
	// biome-ignore lint/suspicious/noExplicitAny: Card content varies by type
	content: any;
}

/**
 * Definition of a card type
 * This is used by the planner to understand what cards are available
 */
export interface CardTypeDefinition {
	/** Unique identifier for this card type */
	type: string;
	/** Human-readable name */
	name: string;
	/** Description of what this card type is for (shown to planner) */
	description: string;
	/** When this card type is most useful (helps planner decide) */
	bestUsedFor: string;
	/** Example of the output format (helps planner understand) */
	exampleOutput: Record<string, unknown>;
	/** The generator function that creates this card */
	generate: (context: GeneratorContext) => Promise<GeneratedCard>;
}

/**
 * Plan item from the lesson planner
 */
export interface PlannedCard {
	/** The card type to generate */
	type: string;
	/** What this card should focus on */
	focus: string;
}

/**
 * Full lesson plan
 */
export interface LessonPlan {
	cards: PlannedCard[];
}
