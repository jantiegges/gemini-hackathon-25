"use server";

import type { createClient } from "@/lib/supabase/server";
import { cleanJsonResponse, GEMINI_MODEL, genAI } from "./gemini";

/**
 * Download PDF from Supabase storage and convert to base64
 */
export async function downloadAndConvertPdf(
	supabase: Awaited<ReturnType<typeof createClient>>,
	filePath: string,
): Promise<string> {
	console.log("[Extract] Downloading PDF from storage...");

	const { data: fileData, error: downloadError } = await supabase.storage
		.from("documents")
		.download(filePath);

	if (downloadError || !fileData) {
		console.error("[Extract] Download failed:", downloadError);
		throw new Error("Failed to download document");
	}

	console.log(`[Extract] Downloaded PDF, size: ${fileData.size} bytes`);

	// Convert to base64 for Gemini
	console.log("[Extract] Converting to base64...");
	const arrayBuffer = await fileData.arrayBuffer();
	const base64 = Buffer.from(arrayBuffer).toString("base64");
	console.log(`[Extract] Base64 length: ${base64.length}`);

	return base64;
}

/**
 * Extract content from a PDF page by page using Gemini
 */
export async function extractPdfContent(base64Data: string): Promise<string[]> {
	console.log("[Extract] Extracting content page by page with Gemini...");

	const extractionResult = await genAI.models.generateContent({
		model: GEMINI_MODEL,
		contents: [
			{
				role: "user",
				parts: [
					{
						inlineData: {
							mimeType: "application/pdf",
							data: base64Data,
						},
					},
					{
						text: `Extract the text content from this PDF document PAGE BY PAGE.
This is a lecture slide or educational material.

IMPORTANT: Return the content as a JSON array where each element is the MARKDOWN-formatted content of ONE page.
Format: ["# Page 1 Title\\n\\nContent...", "# Page 2 Title\\n\\nContent...", ...]

For each page:
- Use proper Markdown formatting (# for headings, ## for subheadings, - for bullet points, **bold**, etc.)
- Use LaTeX for ALL mathematical expressions:
  - Inline math: $E = mc^2$
  - Block math: $$\\sum_{i=1}^{n} x_i$$
- Include all headings, bullet points, and key concepts from that specific page
- Preserve the structure and hierarchy of the content
- Keep the content concise but complete

Return ONLY the JSON array, no wrapping markdown code blocks around the JSON itself.`,
					},
				],
			},
		],
	});

	const extractedText = extractionResult.text || "[]";
	console.log(`[Extract] Gemini response length: ${extractedText.length}`);

	// Parse the page-by-page content
	let pages: string[];
	try {
		const cleanedJson = cleanJsonResponse(extractedText);
		pages = JSON.parse(cleanedJson);
		console.log(`[Extract] Parsed ${pages.length} pages`);
	} catch (parseError) {
		console.error(
			"[Extract] Failed to parse pages JSON, falling back to single chunk:",
			parseError,
		);
		// Fallback: treat entire content as one chunk
		pages = [extractedText];
	}

	return pages;
}
