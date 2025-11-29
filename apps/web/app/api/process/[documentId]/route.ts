import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ documentId: string }> },
) {
	const { documentId } = await params;
	const supabase = await createClient();

	try {
		// 1. Get the document
		const { data: document, error: docError } = await supabase
			.from("documents")
			.select("*")
			.eq("id", documentId)
			.single();

		if (docError || !document) {
			return NextResponse.json(
				{ error: "Document not found" },
				{ status: 404 },
			);
		}

		// 2. Update status to processing
		await supabase
			.from("documents")
			.update({ status: "processing" })
			.eq("id", documentId);

		// 3. Download the PDF from storage
		const { data: fileData, error: downloadError } = await supabase.storage
			.from("documents")
			.download(document.path);

		if (downloadError || !fileData) {
			throw new Error("Failed to download document");
		}

		// 4. Convert to base64 for Gemini
		const arrayBuffer = await fileData.arrayBuffer();
		const base64 = Buffer.from(arrayBuffer).toString("base64");

		// 5. Extract content using Gemini Flash
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
							text: `Extract all the text content from this PDF document.
                     This is a lecture slide or educational material.
                     Return the content as plain text, preserving the logical structure and order of information.
                     Include all headings, bullet points, and key concepts.`,
						},
					],
				},
			],
		});

		const extractedContent = extractionResult.text || "";

		// 6. Split content into chunks (simple splitting by sections/paragraphs)
		const chunks = splitIntoChunks(extractedContent);

		// 7. Store chunks in database
		const chunkInserts = chunks.map((content, index) => ({
			document_id: documentId,
			content,
			chunk_index: index,
		}));

		await supabase.from("chunks").insert(chunkInserts);

		// 8. Generate lessons using Gemini
		const lessonsResult = await genAI.models.generateContent({
			model: "gemini-2.0-flash",
			contents: [
				{
					role: "user",
					parts: [
						{
							text: `Based on the following educational content, create 5-8 lesson titles for a Duolingo-style learning path.
                     Each lesson should focus on a specific concept or topic from the material.
                     The lessons should be ordered from foundational concepts to more advanced ones.

                     Content:
                     ${extractedContent.slice(0, 15000)}

                     Return ONLY a JSON array of objects with "title" and "description" fields.
                     Example: [{"title": "Introduction to Variables", "description": "Learn the basics of variable declaration and usage"}]

                     Important: Return ONLY valid JSON, no markdown formatting or code blocks.`,
						},
					],
				},
			],
		});

		const lessonsText = lessonsResult.text || "[]";
		// Clean up any markdown code blocks if present
		const cleanedJson = lessonsText
			.replace(/```json\n?/g, "")
			.replace(/```\n?/g, "")
			.trim();

		let lessons: Array<{ title: string; description: string }>;
		try {
			lessons = JSON.parse(cleanedJson);
		} catch {
			console.error("Failed to parse lessons JSON:", cleanedJson);
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
		}

		// 9. Insert lessons with ordering
		let prevLessonId: string | null = null;
		for (let i = 0; i < lessons.length; i++) {
			const lesson = lessons[i];
			const { data: insertedLesson, error: lessonError } = await supabase
				.from("lessons")
				.insert({
					document_id: documentId,
					title: lesson.title,
					description: lesson.description,
					prev_lesson_id: prevLessonId,
					order_index: i,
				})
				.select()
				.single();

			if (lessonError) {
				console.error("Failed to insert lesson:", lessonError);
				continue;
			}

			prevLessonId = insertedLesson.id;
		}

		// 10. Update document status to completed
		await supabase
			.from("documents")
			.update({ status: "completed" })
			.eq("id", documentId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Processing error:", error);

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

// Helper function to split content into chunks
function splitIntoChunks(content: string, maxChunkSize = 1000): string[] {
	const chunks: string[] = [];
	const paragraphs = content.split(/\n\n+/);

	let currentChunk = "";

	for (const paragraph of paragraphs) {
		if (currentChunk.length + paragraph.length > maxChunkSize) {
			if (currentChunk.trim()) {
				chunks.push(currentChunk.trim());
			}
			currentChunk = paragraph;
		} else {
			currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
		}
	}

	if (currentChunk.trim()) {
		chunks.push(currentChunk.trim());
	}

	return chunks.length > 0 ? chunks : [content];
}
