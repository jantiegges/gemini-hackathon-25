/**
 * Text Card
 *
 * A simple informational card that presents content to the user.
 * Used for introducing concepts, explaining details, or summarizing.
 */

import type {
	CardTypeDefinition,
	GeneratedCard,
	GeneratorContext,
} from "../types";

export interface TextCardContent {
	title: string;
	body: string; // Markdown with LaTeX support
}

export const textCard: CardTypeDefinition = {
	type: "text",
	name: "Text Card",
	description:
		"An informational card that presents content to the user. Displays a title and markdown-formatted body text.",
	bestUsedFor:
		"Introducing new concepts, explaining details, providing examples, or summarizing key points. Good for teaching before testing.",
	exampleOutput: {
		title: "Understanding Derivatives",
		body: "A **derivative** represents the rate of change of a function. For $f(x) = x^2$, the derivative is $f'(x) = 2x$.\n\n- Measures instantaneous rate of change\n- Fundamental to calculus",
	},

	generate: async (context: GeneratorContext): Promise<GeneratedCard> => {
		const result = await context.genAI.models.generateContent({
			model: "gemini-2.0-flash",
			contents: [
				{
					role: "user",
					parts: [
						{
							text: `You are creating an educational text card for a learning app.

Lesson: ${context.lessonTitle}
${context.lessonDescription ? `Description: ${context.lessonDescription}` : ""}

Content to teach from:
${context.lessonContent.slice(0, 8000)}

Your task: Create a text card that ${context.focus}

Requirements:
- Title: Short, descriptive (3-6 words)
- Body: 2-4 sentences OR 3-5 bullet points
- Use **bold** for key terms
- Use $inline$ or $$block$$ LaTeX for math
- Keep it concise but informative
- Make it engaging and easy to understand

Return ONLY a JSON object with "title" and "body" fields.
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
			const content = JSON.parse(cleaned) as TextCardContent;
			return { type: "text", content };
		} catch {
			// Fallback
			return {
				type: "text",
				content: {
					title: context.lessonTitle,
					body: `Let's learn about ${context.focus}.`,
				},
			};
		}
	},
};
