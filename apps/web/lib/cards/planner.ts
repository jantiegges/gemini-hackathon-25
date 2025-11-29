/**
 * Lesson Planner
 *
 * Step 1 of the two-step card generation process.
 * Decides which cards to create and in what order.
 */

import type { GoogleGenAI } from "@google/genai";
import { getCardTypeNames, getCardTypesDescription } from "./registry";
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
		model: "gemini-3-pro-preview",
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
Create a lesson plan that MUST include all 5 card types. For each card, specify:
1. The card type (from available types: ${availableTypes.join(", ")})
2. What the card should focus on (a brief description)

## Requirements
- You MUST include exactly one card of each of these 5 types: text, mc_question, fill_in_blank, infographic, interactive_visual
- The lesson plan should have at least 5 cards (one of each type), but you can include more cards if needed (up to 8 total)
- If you add extra cards, you can repeat card types, but all 5 types must appear at least once

## Guidelines
- Start with 1-2 text cards to introduce concepts
<<<<<<< HEAD
- Alternate between teaching (text) and testing (mc_question)
- Include a video_learning card when the topic involves processes, visual demonstrations, or real-world phenomena
- Consider using infographic for diagrams and video_learning for motion/processes
=======
- Alternate between teaching (text) and testing (mc_question, fill_in_blank)
- Include an infographic card to visualize key concepts
- Include an interactive visual card to help the user understand the concept
>>>>>>> main
- End with a summary or final check
- Each card should focus on ONE specific concept or question
- Make the focuses specific and actionable

## Output Format
Return ONLY a JSON object with a "cards" array:
{
  "cards": [
    { "type": "text", "focus": "introduce the concept of derivatives and why they matter" },
<<<<<<< HEAD
    { "type": "video_learning", "focus": "visualize how the slope of a tangent line changes along a curve" },
    { "type": "text", "focus": "explain the power rule with a clear example" },
    { "type": "mc_question", "focus": "test understanding of the power rule" },
    { "type": "mc_question", "focus": "apply the power rule to a new function" },
    { "type": "text", "focus": "summarize key takeaways" },
    { "type": "mc_question", "focus": "final comprehension check" }
=======
    { "type": "mc_question", "focus": "test understanding of basic derivative concepts" },
    { "type": "fill_in_blank", "focus": "practice applying the power rule by filling in blanks" },
    { "type": "infographic", "focus": "visualize the relationship between functions and their derivatives" },
    { "type": "interactive_visual", "focus": "interactively explore how changing a function affects its derivative" }
>>>>>>> main
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

		// Check if all 5 card types are present
		const presentTypes = new Set(validCards.map((card) => card.type));
		const allTypesPresent = availableTypes.every((type) =>
			presentTypes.has(type),
		);

		// Ensure at least 5 cards with all types
		if (validCards.length < 5 || !allTypesPresent) {
			console.warn(
				"[Planner] Generated plan missing card types. Expected all 5 types, got:",
				Array.from(presentTypes),
			);
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
 * Includes all 5 required card types
 */
function getDefaultPlan(): LessonPlan {
	return {
		cards: [
			{ type: "text", focus: "introduce the main concept of this lesson" },
			{ type: "mc_question", focus: "test basic understanding" },
			{ type: "fill_in_blank", focus: "practice applying the concept" },
			{
				type: "infographic",
				focus: "visualize key concepts and relationships",
			},
			{
				type: "interactive_visual",
				focus: "interactively explore the concept",
			},
		],
	};
}
