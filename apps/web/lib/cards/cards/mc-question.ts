/**
 * Multiple Choice Question Card
 *
 * A question card with 4 options where one is correct.
 * Used for testing understanding and recall.
 */

import type {
	CardTypeDefinition,
	GeneratedCard,
	GeneratorContext,
} from "../types";

export interface McQuestionCardContent {
	question: string;
	options: string[];
	correct_index: number;
	explanation: string;
}

export const mcQuestionCard: CardTypeDefinition = {
	type: "mc_question",
	name: "Multiple Choice Question",
	description:
		"A question with 4 answer options where exactly one is correct. Includes an explanation shown after answering.",
	bestUsedFor:
		"Testing understanding, checking recall, verifying comprehension of concepts. Good after teaching content.",
	exampleOutput: {
		question: "What is the derivative of $x^3$?",
		options: ["$x^2$", "$3x^2$", "$3x$", "$x^3$"],
		correct_index: 1,
		explanation:
			"Using the power rule: $\\frac{d}{dx}(x^n) = nx^{n-1}$, so $\\frac{d}{dx}(x^3) = 3x^2$.",
	},

	generate: async (context: GeneratorContext): Promise<GeneratedCard> => {
		const result = await context.genAI.models.generateContent({
			model: "gemini-2.5-flash",
			contents: [
				{
					role: "user",
					parts: [
						{
							text: `You are creating a multiple choice question for a learning app.

Lesson: ${context.lessonTitle}
${context.lessonDescription ? `Description: ${context.lessonDescription}` : ""}

Content to test:
${context.lessonContent.slice(0, 8000)}

Your task: Create a question that ${context.focus}

Requirements:
- Question: Clear, specific, tests understanding (not just recall)
- Options: Exactly 4 options, all plausible
- One correct answer, three distractors
- Distractors should be common misconceptions or related but wrong
- Use $inline$ LaTeX for any math in question/options
- Explanation: Brief but helpful, explain WHY the answer is correct

Return ONLY a JSON object with these fields:
- "question": string
- "options": array of 4 strings
- "correct_index": number (0-3)
- "explanation": string

No markdown code blocks, just the raw JSON.`,
						},
					],
				},
			],
		});

		const text = result.text || "{}";
		const cleaned = text
			.replace(/```json\n?/g, "")
			.replace(/```\n?/g, "")
			.trim();

		try {
			const content = JSON.parse(cleaned) as McQuestionCardContent;
			// Ensure strings are actually strings (AI sometimes returns arrays)
			if (Array.isArray(content.question)) {
				content.question = content.question.join(" ");
			}
			if (Array.isArray(content.explanation)) {
				content.explanation = (content.explanation as unknown as string[]).join(
					" ",
				);
			}
			// Validate
			if (
				!content.question ||
				!Array.isArray(content.options) ||
				content.options.length !== 4 ||
				typeof content.correct_index !== "number" ||
				content.correct_index < 0 ||
				content.correct_index > 3
			) {
				throw new Error("Invalid MC question format");
			}
			return { type: "mc_question", content };
		} catch {
			// Fallback
			return {
				type: "mc_question",
				content: {
					question: `Which statement about ${context.focus} is correct?`,
					options: [
						"All of the above",
						"None of the above",
						"It depends on the context",
						"The first option is correct",
					],
					correct_index: 0,
					explanation: "Review the lesson content for more details.",
				},
			};
		}
	},
};
