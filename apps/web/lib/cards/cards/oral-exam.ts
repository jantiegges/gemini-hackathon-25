/**
 * Oral Exam Card
 *
 * A real-time voice-based examination using Gemini Live API.
 * The AI asks questions verbally and evaluates the student's spoken responses.
 * Uses function calling to end the exam with a pass/fail result.
 */

import type {
	CardTypeDefinition,
	GeneratedCard,
	GeneratorContext,
} from "../types";

export interface OralExamCardContent {
	/** The topic being examined */
	topic: string;
	/** Context from the lesson for the AI examiner */
	context: string;
	/** Approximate number of questions to ask */
	questionCount: number;
	/** System prompt for the AI examiner */
	systemPrompt: string;
	/** Tool definitions for function calling */
	tools: Array<{
		functionDeclarations: Array<{
			name: string;
			description: string;
			parameters: {
				type: string;
				properties: Record<string, unknown>;
				required?: string[];
			};
		}>;
	}>;
}

/**
 * Generate the system prompt for the oral examiner
 */
function generateExaminerPrompt(
	topic: string,
	context: string,
	questionCount: number,
): string {
	return `You are a friendly oral examiner for a learning app. Your job is to assess the student's understanding of: ${topic}

Context from the lesson:
${context}

Instructions:
1. Start with a friendly greeting. Introduce yourself briefly and explain you'll ask a few questions about ${topic}.
2. Ask ${questionCount} questions, starting with easier ones and gradually increasing difficulty.
3. Listen carefully to their answers. Provide brief, encouraging feedback after each response.
4. If they struggle, offer a hint or rephrase the question, but don't give away the answer.
5. After asking all questions (or if it becomes clear they pass/fail early), call the end_exam function with:
   - passed: true if they demonstrated reasonable understanding of the core concepts
   - feedback: 2-3 sentences of constructive feedback on their performance
6. Be encouraging but honest. It's okay to fail them if they clearly don't understand the material.
7. Keep your responses concise and conversational - this is a spoken exam, not a lecture.
8. Speak naturally, as if having a face-to-face conversation.

Remember: You MUST call the end_exam function to conclude the exam. Do not end without calling it.`;
}

/**
 * Tool definition for ending the exam
 */
const endExamTool = {
	functionDeclarations: [
		{
			name: "end_exam",
			description:
				"Call this function when the oral exam should end. Call after asking all planned questions OR when it becomes clear the student has passed or failed.",
			parameters: {
				type: "object",
				properties: {
					passed: {
						type: "boolean",
						description:
							"Whether the student passed the exam. Pass if they demonstrated reasonable understanding of the core concepts.",
					},
					feedback: {
						type: "string",
						description:
							"2-3 sentences of constructive feedback for the student about their performance.",
					},
				},
				required: ["passed", "feedback"],
			},
		},
	],
};

export const oralExamCard: CardTypeDefinition = {
	type: "oral_exam",
	name: "Oral Exam",
	description:
		"A real-time voice-based examination where the AI asks questions verbally and evaluates spoken responses. Uses Gemini Live API for natural conversation. Results in pass/fail.",
	bestUsedFor:
		"Final assessment of understanding, practicing verbal explanation of concepts, building confidence in discussing topics. Best placed at the end of a lesson as a capstone evaluation.",
	exampleOutput: {
		topic: "The Power Rule for Derivatives",
		context: "The power rule states that d/dx(x^n) = nx^(n-1)...",
		questionCount: 3,
		systemPrompt: "You are a friendly oral examiner...",
		tools: [endExamTool],
	},

	generate: async (context: GeneratorContext): Promise<GeneratedCard> => {
		// Generate a focused topic and context for the oral exam
		const result = await context.genAI.models.generateContent({
			model: "gemini-2.5-flash",
			contents: [
				{
					role: "user",
					parts: [
						{
							text: `You are preparing an oral exam for a learning app.

Lesson: ${context.lessonTitle}
${context.lessonDescription ? `Description: ${context.lessonDescription}` : ""}

Content to examine:
${context.lessonContent.slice(0, 6000)}

Your task: ${context.focus}

Create the exam configuration with:
1. A clear, specific topic (what the exam is about)
2. Key context the examiner needs (main concepts, facts, formulas)
3. How many questions to ask (3-5 recommended)

Requirements:
- Topic should be specific and focused
- Context should include the essential information needed to evaluate answers
- Keep context concise but comprehensive (the AI examiner will use this)

Return ONLY a JSON object with these fields:
- "topic": string (what is being examined)
- "context": string (key information for the examiner, max 1000 chars)
- "questionCount": number (3-5)

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
			const parsed = JSON.parse(cleaned) as {
				topic: string;
				context: string;
				questionCount: number;
			};

			// Validate
			if (!parsed.topic || !parsed.context || !parsed.questionCount) {
				throw new Error("Invalid oral exam format");
			}

			const questionCount = Math.min(5, Math.max(3, parsed.questionCount));

			const content: OralExamCardContent = {
				topic: parsed.topic,
				context: parsed.context.slice(0, 1500),
				questionCount,
				systemPrompt: generateExaminerPrompt(
					parsed.topic,
					parsed.context,
					questionCount,
				),
				tools: [endExamTool],
			};

			return { type: "oral_exam", content };
		} catch {
			// Fallback
			const fallbackContext = context.lessonContent.slice(0, 1000);
			const content: OralExamCardContent = {
				topic: context.focus || context.lessonTitle,
				context: fallbackContext,
				questionCount: 3,
				systemPrompt: generateExaminerPrompt(
					context.focus || context.lessonTitle,
					fallbackContext,
					3,
				),
				tools: [endExamTool],
			};

			return { type: "oral_exam", content };
		}
	},
};
