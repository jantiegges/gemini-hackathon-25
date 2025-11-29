import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
	throw new Error("GEMINI_API_KEY environment variable is required");
}

export const genAI = new GoogleGenAI({ apiKey });

export const GEMINI_MODEL = "gemini-2.0-flash";

/**
 * Clean JSON response from Gemini by removing markdown code blocks
 */
export function cleanJsonResponse(text: string): string {
	return text
		.replace(/```json\n?/g, "")
		.replace(/```\n?/g, "")
		.trim();
}

