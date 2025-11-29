import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
	throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenAI({ apiKey });

export async function POST(
	_request: Request,
	{ params }: { params: Promise<{ documentId: string }> },
) {
	const { documentId } = await params;
	const supabase = await createClient();

	console.log(`[Process] Starting processing for document: ${documentId}`);

	try {
		// 1. Get the document
		console.log("[Process] Step 1: Fetching document from database...");
		const { data: document, error: docError } = await supabase
			.from("documents")
			.select("*")
			.eq("id", documentId)
			.single();

		if (docError || !document) {
			console.error("[Process] Document not found:", docError);
			return NextResponse.json(
				{ error: "Document not found" },
				{ status: 404 },
			);
		}
		console.log(`[Process] Found document: ${document.name}`);

		// 2. Update status to processing
		console.log("[Process] Step 2: Updating status to processing...");
		await supabase
			.from("documents")
			.update({ status: "processing" })
			.eq("id", documentId);

		// 3. Download the PDF from storage
		console.log("[Process] Step 3: Downloading PDF from storage...");
		const { data: fileData, error: downloadError } = await supabase.storage
			.from("documents")
			.download(document.path);

		if (downloadError || !fileData) {
			console.error("[Process] Download failed:", downloadError);
			throw new Error("Failed to download document");
		}
		console.log(`[Process] Downloaded PDF, size: ${fileData.size} bytes`);

		// 4. Convert to base64 for Gemini
		console.log("[Process] Step 4: Converting to base64...");
		const arrayBuffer = await fileData.arrayBuffer();
		const base64 = Buffer.from(arrayBuffer).toString("base64");
		console.log(`[Process] Base64 length: ${base64.length}`);

		// 5. Extract content PAGE BY PAGE using Gemini Flash
		console.log(
			"[Process] Step 5: Extracting content page by page with Gemini...",
		);
		const extractionResult = await genAI.models.generateContent({
			model: "gemini-2.0-flash",
			contents: [
				{
					role: "user",
					parts: [
						{
							inlineData: {
								mimeType: "application/pdf",
								data: base64,
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
		console.log(`[Process] Gemini response length: ${extractedText.length}`);

		// 6. Parse the page-by-page content
		console.log("[Process] Step 6: Parsing page content...");
		let pages: string[];
		try {
			const cleanedJson = extractedText
				.replace(/```json\n?/g, "")
				.replace(/```\n?/g, "")
				.trim();
			pages = JSON.parse(cleanedJson);
			console.log(`[Process] Parsed ${pages.length} pages`);
		} catch (parseError) {
			console.error(
				"[Process] Failed to parse pages JSON, falling back to single chunk:",
				parseError,
			);
			// Fallback: treat entire content as one chunk
			pages = [extractedText];
		}

		// 7. Store chunks in database (one per page)
		console.log("[Process] Step 7: Storing chunks in database...");
		const chunkInserts = pages.map((content, index) => ({
			document_id: documentId,
			content: typeof content === "string" ? content : JSON.stringify(content),
			chunk_index: index,
		}));

		const { error: chunksError } = await supabase
			.from("chunks")
			.insert(chunkInserts);
		if (chunksError) {
			console.error("[Process] Failed to insert chunks:", chunksError);
		} else {
			console.log(`[Process] Inserted ${chunkInserts.length} chunks`);
		}

		// 8. Generate lessons using Gemini
		console.log("[Process] Step 8: Generating lessons with Gemini...");
		const allContent = pages.join("\n\n---PAGE BREAK---\n\n");
		const lessonsResult = await genAI.models.generateContent({
			model: "gemini-2.5-flash",
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
		console.log(`[Process] Lessons response length: ${lessonsText.length}`);

		// Clean up any markdown code blocks if present
		const cleanedLessonsJson = lessonsText
			.replace(/```json\n?/g, "")
			.replace(/```\n?/g, "")
			.trim();

		let lessons: Array<{ title: string; description: string }>;
		try {
			lessons = JSON.parse(cleanedLessonsJson);
			console.log(`[Process] Parsed ${lessons.length} lessons`);
		} catch {
			console.error(
				"[Process] Failed to parse lessons JSON:",
				cleanedLessonsJson,
			);
			lessons = [
				{ title: "Getting Started", description: "Introduction to the topic" },
				{
					title: "Core Concepts",
					description: "Understanding the fundamentals",
				},
				{
					title: "Practice & Application",
					description: "Apply what you've learned",
				},
			];
			console.log("[Process] Using fallback lessons");
		}

		// 9. Insert lessons with ordering and chunk ranges
		console.log("[Process] Step 9: Inserting lessons into database...");
		const totalChunks = pages.length;
		const lessonsCount = lessons.length;
		const chunksPerLesson = Math.ceil(totalChunks / lessonsCount);

		let prevLessonId: string | null = null;
		for (let i = 0; i < lessons.length; i++) {
			const lesson = lessons[i];
			if (!lesson) continue;

			// Calculate chunk range for this lesson
			const startChunkIndex = i * chunksPerLesson;
			const endChunkIndex = Math.min(
				startChunkIndex + chunksPerLesson - 1,
				totalChunks - 1,
			);

			const { data, error: lessonError } = await supabase
				.from("lessons")
				.insert({
					document_id: documentId,
					title: lesson.title,
					description: lesson.description,
					prev_lesson_id: prevLessonId,
					order_index: i,
					start_chunk_index: startChunkIndex,
					end_chunk_index: endChunkIndex,
					status: "pending",
				})
				.select("id")
				.single();

			if (lessonError || !data) {
				console.error(`[Process] Failed to insert lesson ${i}:`, lessonError);
				continue;
			}

			console.log(
				`[Process] Inserted lesson ${i + 1}: ${lesson.title} (chunks ${startChunkIndex}-${endChunkIndex})`,
			);
			prevLessonId = data.id as string;
		}

		// 10. Update document status to completed
		console.log("[Process] Step 10: Updating status to completed...");
		await supabase
			.from("documents")
			.update({ status: "completed" })
			.eq("id", documentId);

		console.log(`[Process] ✅ Processing complete for document: ${documentId}`);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[Process] ❌ Processing error:", error);

		// Update status to failed
		await supabase
			.from("documents")
			.update({ status: "failed" })
			.eq("id", documentId);

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Processing failed" },
			{ status: 500 },
		);
	}
}
