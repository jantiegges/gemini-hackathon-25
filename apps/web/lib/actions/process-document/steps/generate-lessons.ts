"use server";

import { cleanJsonResponse, GEMINI_MODEL, genAI } from "./gemini";

export interface LessonData {
	title: string;
	description: string;
}

const FALLBACK_LESSONS: LessonData[] = [
	{ title: "Getting Started", description: "Introduction to the topic" },
	{ title: "Core Concepts", description: "Understanding the fundamentals" },
	{ title: "Practice & Application", description: "Apply what you've learned" },
];

/**
 * Generate lesson structure from extracted content using Gemini
 */
export async function generateLessons(pages: string[]): Promise<LessonData[]> {
	"use step";

	console.log("[Lessons] Generating lessons with Gemini...");

	const allContent = pages.join("\n\n---PAGE BREAK---\n\n");

	const lessonsResult = await genAI.models.generateContent({
		model: GEMINI_MODEL,
		contents: [
			{
				role: "user",
				parts: [
					{
						text: `Based on the following educational content, create 5-8 lesson titles for a Duolingo-style learning path.
Each lesson should focus on a specific concept or topic from the material.
The lessons should be ordered from foundational concepts to more advanced ones.

Content:
${allContent.slice(0, 15000)}

Return ONLY a JSON array of objects with "title" and "description" fields.
Example: [{"title": "Introduction to Variables", "description": "Learn the basics of variable declaration and usage"}]

Important: Return ONLY valid JSON, no markdown formatting or code blocks.`,
					},
				],
			},
		],
	});

	const lessonsText = lessonsResult.text || "[]";
	console.log(`[Lessons] Gemini response length: ${lessonsText.length}`);

	// Parse lessons JSON
	let lessons: LessonData[];
	try {
		const cleanedJson = cleanJsonResponse(lessonsText);
		lessons = JSON.parse(cleanedJson);
		console.log(`[Lessons] Parsed ${lessons.length} lessons`);
	} catch {
		console.error("[Lessons] Failed to parse lessons JSON, using fallback");
		lessons = FALLBACK_LESSONS;
		console.log("[Lessons] Using fallback lessons");
	}

	return lessons;
}
