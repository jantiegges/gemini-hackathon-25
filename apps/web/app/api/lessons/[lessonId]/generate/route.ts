import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { generateLesson } from "@/lib/cards";
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
		const lessonContent = chunks.map((c) => c.content).join("\n\n---\n\n");
		console.log(`[Generate] Combined content length: ${lessonContent.length}`);

		// 5. Generate cards using the two-step process
		console.log("[Generate] Step 4: Running two-step card generation...");
		const result = await generateLesson({
			genAI,
			lessonContent,
			lessonTitle: lesson.title,
			lessonDescription: lesson.description || "",
		});

		console.log(`[Generate] Plan: ${result.plan.cards.length} cards planned`);
		console.log(`[Generate] Generated: ${result.cards.length} cards`);
		if (result.errors.length > 0) {
			console.warn(`[Generate] Errors: ${result.errors.length}`);
			for (const err of result.errors) {
				console.warn(`  - Card ${err.index}: ${err.error}`);
			}
		}

		// 6. Insert cards into database
		console.log("[Generate] Step 5: Inserting cards into database...");
		const cardInserts = result.cards.map((card, index) => ({
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

		// 7. Update lesson status to ready
		console.log("[Generate] Step 6: Updating lesson status to ready...");
		await supabase
			.from("lessons")
			.update({ status: "ready" })
			.eq("id", lessonId);

		console.log(
			`[Generate] ✅ Card generation complete for lesson: ${lessonId}`,
		);
		return NextResponse.json({
			success: true,
			cardsGenerated: result.cards.length,
			plan: result.plan,
		});
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
