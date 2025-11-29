/**
 * Lesson Planner
 *
 * Step 1 of the two-step card generation process.
 * Decides which cards to create and in what order.
 */

import type { GoogleGenAI } from "@google/genai";
import { getCardTypesDescription, getCardTypeNames } from "./registry";
import type { LessonPlan, PlannedCard } from "./types";

interface PlannerInput {
	genAI: GoogleGenAI;
	lessonContent: string;
	lessonTitle: string;
	lessonDescription: string;
}

/**
 * Plan the structure of a lesson
 * Decides which card types to use and what each should focus on
 */
export async function planLesson(input: PlannerInput): Promise<LessonPlan> {
	const { genAI, lessonContent, lessonTitle, lessonDescription } = input;

	const cardTypesDescription = getCardTypesDescription();
	const availableTypes = getCardTypeNames();

	const result = await genAI.models.generateContent({
		model: "gemini-2.0-flash",
		contents: [
			{
				role: "user",
				parts: [
					{
						text: `You are a curriculum designer creating a lesson plan for a Duolingo-style learning app.

## Lesson Information
Title: ${lessonTitle}
${lessonDescription ? `Description: ${lessonDescription}` : ""}

## Content to Teach
${lessonContent.slice(0, 10000)}

## Available Card Types
${cardTypesDescription}

## Your Task
Create a lesson plan with 6-8 cards. For each card, specify:
1. The card type (from available types: ${availableTypes.join(", ")})
2. What the card should focus on (a brief description)

## Guidelines
- Start with 1-2 text cards to introduce concepts
- Alternate between teaching (text) and testing (mc_question)
- End with a summary or final check
- Each card should focus on ONE specific concept or question
- Make the focuses specific and actionable

## Output Format
Return ONLY a JSON object with a "cards" array:
{
  "cards": [
    { "type": "text", "focus": "introduce the concept of derivatives and why they matter" },
    { "type": "text", "focus": "explain the power rule with a clear example" },
    { "type": "mc_question", "focus": "test understanding of the power rule" },
    { "type": "mc_question", "focus": "apply the power rule to a new function" },
    { "type": "text", "focus": "summarize key takeaways" },
    { "type": "mc_question", "focus": "final comprehension check" }
  ]
}

No markdown code blocks. Just the raw JSON.`,
					},
				],
			},
		],
	});

	const text = result.text || '{"cards":[]}';
	const cleaned = text
		.replace(/```json\n?/g, "")
		.replace(/```\n?/g, "")
		.trim();

	try {
		const plan = JSON.parse(cleaned) as LessonPlan;

		// Validate and filter to only valid card types
		const validCards: PlannedCard[] = plan.cards
			.filter((card) => availableTypes.includes(card.type))
			.slice(0, 8); // Max 8 cards

		// Ensure at least some cards
		if (validCards.length < 3) {
			return getDefaultPlan();
		}

		return { cards: validCards };
	} catch {
		console.error("[Planner] Failed to parse plan, using default");
		return getDefaultPlan();
	}
}

/**
 * Fallback plan if AI generation fails
 */
function getDefaultPlan(): LessonPlan {
	return {
		cards: [
			{ type: "text", focus: "introduce the main concept of this lesson" },
			{ type: "text", focus: "explain key details with examples" },
			{ type: "mc_question", focus: "test basic understanding" },
			{ type: "mc_question", focus: "test application of the concept" },
			{ type: "text", focus: "summarize the key points" },
			{ type: "mc_question", focus: "final comprehension check" },
		],
	};
}

