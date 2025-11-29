/**
 * Fill in the Blank Card
 *
 * A sentence or paragraph with missing words that the user must fill in.
 * Each blank has multiple choice options.
 */

import type {
	CardTypeDefinition,
	GeneratedCard,
	GeneratorContext,
} from "../types";

export interface BlankOption {
	text: string;
	isCorrect: boolean;
}

export interface Blank {
	id: string;
	options: BlankOption[];
}

export interface FillInBlankCardContent {
	/** The text with blanks marked as {{blank_id}} */
	text: string;
	/** Map of blank IDs to their options */
	blanks: Record<string, BlankOption[]>;
	/** Explanation shown after answering */
	explanation: string;
}

export const fillInBlankCard: CardTypeDefinition = {
	type: "fill_in_blank",
	name: "Fill in the Blank",
	description:
		"A sentence or paragraph with missing words. Each blank has 3-4 options to choose from, and the user must select the correct word for each blank.",
	bestUsedFor:
		"Testing recall of key terms, formulas, or definitions. Good for vocabulary and concept reinforcement.",
	exampleOutput: {
		text: "The derivative of $x^n$ is {{blank1}}, which is known as the {{blank2}}.",
		blanks: {
			blank1: [
				{ text: "$nx^{n-1}$", isCorrect: true },
				{ text: "$x^{n+1}$", isCorrect: false },
				{ text: "$nx^n$", isCorrect: false },
			],
			blank2: [
				{ text: "power rule", isCorrect: true },
				{ text: "chain rule", isCorrect: false },
				{ text: "product rule", isCorrect: false },
			],
		},
		explanation:
			"The power rule states that the derivative of $x^n$ is $nx^{n-1}$.",
	},

	generate: async (context: GeneratorContext): Promise<GeneratedCard> => {
		const result = await context.genAI.models.generateContent({
			model: "gemini-2.5-flash",
			contents: [
				{
					role: "user",
					parts: [
						{
							text: `You are creating a fill-in-the-blank exercise for a learning app.

Lesson: ${context.lessonTitle}
${context.lessonDescription ? `Description: ${context.lessonDescription}` : ""}

Content to test:
${context.lessonContent.slice(0, 8000)}

Your task: Create a fill-in-the-blank that ${context.focus}

Requirements:
- Create a sentence or short paragraph with 1-3 blanks
- Mark blanks as {{blank1}}, {{blank2}}, etc.
- Each blank should have 3-4 options (one correct)
- Blanks should test KEY terms or concepts
- Wrong options should be plausible but clearly incorrect
- Use $inline$ LaTeX for any math
- Include a brief explanation

Return ONLY a JSON object:
{
  "text": "The {{blank1}} of a function measures its {{blank2}} at a specific point.",
  "blanks": {
    "blank1": [
      { "text": "derivative", "isCorrect": true },
      { "text": "integral", "isCorrect": false },
      { "text": "limit", "isCorrect": false }
    ],
    "blank2": [
      { "text": "rate of change", "isCorrect": true },
      { "text": "total area", "isCorrect": false },
      { "text": "maximum value", "isCorrect": false }
    ]
  },
  "explanation": "The derivative measures the instantaneous rate of change."
}

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
			const content = JSON.parse(cleaned) as FillInBlankCardContent;
			// Ensure strings are actually strings (AI sometimes returns arrays)
			if (Array.isArray(content.text)) {
				content.text = content.text.join(" ");
			}
			if (Array.isArray(content.explanation)) {
				content.explanation = (content.explanation as unknown as string[]).join(" ");
			}
			// Validate
			if (
				!content.text ||
				!content.blanks ||
				typeof content.blanks !== "object"
			) {
				throw new Error("Invalid fill-in-blank format");
			}
			return { type: "fill_in_blank", content };
		} catch {
			// Fallback
			return {
				type: "fill_in_blank",
				content: {
					text: `The key concept here is {{blank1}}.`,
					blanks: {
						blank1: [
							{ text: "understanding", isCorrect: true },
							{ text: "confusion", isCorrect: false },
							{ text: "complexity", isCorrect: false },
						],
					},
					explanation: "Review the lesson content for more details.",
				},
			};
		}
	},
};
