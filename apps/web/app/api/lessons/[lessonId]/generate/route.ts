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
	{ params }: { params: Promise<{ lessonId: string }> },
) {
	const { lessonId } = await params;
	const supabase = await createClient();

	console.log(`[Generate] Starting card generation for lesson: ${lessonId}`);

	try {
		// 1. Get the lesson
		console.log("[Generate] Step 1: Fetching lesson...");
		const { data: lesson, error: lessonError } = await supabase
			.from("lessons")
			.select("*")
			.eq("id", lessonId)
			.single();

		if (lessonError || !lesson) {
			console.error("[Generate] Lesson not found:", lessonError);
			return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
		}

		// Check if already generated
		if (lesson.status === "ready") {
			console.log("[Generate] Cards already exist, skipping generation");
			return NextResponse.json({ success: true, cached: true });
		}

		console.log(
			`[Generate] Lesson: ${lesson.title}, chunks ${lesson.start_chunk_index}-${lesson.end_chunk_index}`,
		);

		// 2. Update status to generating
		console.log("[Generate] Step 2: Updating status to generating...");
		await supabase
			.from("lessons")
			.update({ status: "generating" })
			.eq("id", lessonId);

		// 3. Fetch chunks for this lesson
		console.log("[Generate] Step 3: Fetching chunks...");
		const { data: chunks, error: chunksError } = await supabase
			.from("chunks")
			.select("*")
			.eq("document_id", lesson.document_id)
			.gte("chunk_index", lesson.start_chunk_index)
			.lte("chunk_index", lesson.end_chunk_index)
			.order("chunk_index", { ascending: true });

		if (chunksError || !chunks || chunks.length === 0) {
			console.error("[Generate] No chunks found:", chunksError);
			throw new Error("No chunks found for this lesson");
		}

		console.log(`[Generate] Found ${chunks.length} chunks`);

		// 4. Combine chunk content
		const combinedContent = chunks.map((c) => c.content).join("\n\n---\n\n");
		console.log(
			`[Generate] Combined content length: ${combinedContent.length}`,
		);

		// 5. Generate cards using Gemini
		console.log("[Generate] Step 4: Generating cards with Gemini...");
		const cardsResult = await genAI.models.generateContent({
			model: "gemini-2.0-flash",
			contents: [
				{
					role: "user",
					parts: [
						{
							text: `You are creating flashcard-style learning cards for a Duolingo-style educational app.

Based on the following educational content, create EXACTLY 6-8 learning cards (no more than 8, no less than 6).

STRICT LIMIT: Maximum 8 cards total. Do NOT exceed this limit.

Mix the card types for engaging learning flow. Recommended pattern:
- 2-3 Text cards (introduce and explain concepts)
- 3-4 MC questions (test understanding)
- 1 Text card (optional summary)

Content to teach:
${combinedContent}

Lesson title: ${lesson.title}
Lesson description: ${lesson.description || ""}

Return a JSON array of cards. Each card should have:
- type: "text" or "mc_question"
- content: object with card-specific fields

For TEXT cards:
{
  "type": "text",
  "content": {
    "title": "Short title for this concept",
    "body": "Markdown-formatted explanation. Use **bold** for emphasis, bullet points for lists, and LaTeX for math ($inline$ or $$block$$). Keep it concise but informative - 2-4 sentences or a few bullet points."
  }
}

For MC_QUESTION cards:
{
  "type": "mc_question",
  "content": {
    "question": "Clear question testing understanding of the concept",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Brief explanation of why this answer is correct"
  }
}

Guidelines:
- Make text cards concise and focused on ONE concept
- Make MC questions test understanding, not just recall
- Use LaTeX for any mathematical expressions
- Provide 4 options for MC questions
- Make wrong options plausible but clearly incorrect
- Keep explanations brief but helpful

Return ONLY the JSON array, no markdown code blocks.`,
						},
					],
				},
			],
		});

		const cardsText = cardsResult.text || "[]";
		console.log(`[Generate] Gemini response length: ${cardsText.length}`);

		// 6. Parse the cards
		console.log("[Generate] Step 5: Parsing cards...");
		const cleanedJson = cardsText
			.replace(/```json\n?/g, "")
			.replace(/```\n?/g, "")
			.trim();

		interface GeneratedCard {
			type: "text" | "mc_question";
			content: {
				title?: string;
				body?: string;
				question?: string;
				options?: string[];
				correct_index?: number;
				explanation?: string;
			};
		}

		let cards: GeneratedCard[];
		try {
			cards = JSON.parse(cleanedJson);
			// Limit to max 8 cards
			if (cards.length > 8) {
				console.log(`[Generate] Trimming ${cards.length} cards to 8`);
				cards = cards.slice(0, 8);
			}
			console.log(`[Generate] Parsed ${cards.length} cards`);
		} catch (parseError) {
			console.error("[Generate] Failed to parse cards JSON:", parseError);
			// Fallback cards
			cards = [
				{
					type: "text",
					content: {
						title: lesson.title,
						body: `This lesson covers: ${lesson.description || "key concepts from the material"}`,
					},
				},
				{
					type: "mc_question",
					content: {
						question: "Did you understand the main concept?",
						options: [
							"Yes, I understood it",
							"I need to review",
							"It was unclear",
							"I have questions",
						],
						correct_index: 0,
						explanation: "Great! Let's continue learning.",
					},
				},
			];
		}

		// 7. Insert cards into database
		console.log("[Generate] Step 6: Inserting cards into database...");
		const cardInserts = cards.map((card, index) => ({
			lesson_id: lessonId,
			type: card.type,
			order_index: index,
			content: card.content,
		}));

		const { error: insertError } = await supabase
			.from("cards")
			.insert(cardInserts);

		if (insertError) {
			console.error("[Generate] Failed to insert cards:", insertError);
			throw new Error("Failed to save cards");
		}

		console.log(`[Generate] Inserted ${cardInserts.length} cards`);

		// 8. Update lesson status to ready
		console.log("[Generate] Step 7: Updating lesson status to ready...");
		await supabase
			.from("lessons")
			.update({ status: "ready" })
			.eq("id", lessonId);

		console.log(
			`[Generate] ✅ Card generation complete for lesson: ${lessonId}`,
		);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[Generate] ❌ Generation error:", error);

		// Reset status to pending so user can try again
		await supabase
			.from("lessons")
			.update({ status: "pending" })
			.eq("id", lessonId);

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Generation failed" },
			{ status: 500 },
		);
	}
}
