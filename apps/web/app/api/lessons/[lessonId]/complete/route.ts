import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ lessonId: string }> },
) {
	const { lessonId } = await params;
	const supabase = await createClient();

	try {
		const body = await request.json();
		const { score } = body as { score: number };

		if (typeof score !== "number" || score < 0 || score > 100) {
			return NextResponse.json(
				{ error: "Invalid score. Must be a number between 0 and 100." },
				{ status: 400 },
			);
		}

		console.log(
			`[Complete] Marking lesson ${lessonId} complete with score: ${score}%`,
		);

		// Get current lesson to check best score
		const { data: lesson, error: fetchError } = await supabase
			.from("lessons")
			.select("best_score")
			.eq("id", lessonId)
			.single();

		if (fetchError) {
			console.error("[Complete] Failed to fetch lesson:", fetchError);
			return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
		}

		// Only update if score is passing (>=70%) and better than previous
		const isPassing = score >= 70;
		const currentBestScore = lesson.best_score as number | null;
		const shouldUpdateScore =
			currentBestScore === null || score > currentBestScore;

		const updateData: { is_completed?: boolean; best_score?: number } = {};

		if (isPassing) {
			updateData.is_completed = true;
		}

		if (shouldUpdateScore) {
			updateData.best_score = score;
		}

		if (Object.keys(updateData).length > 0) {
			const { error: updateError } = await supabase
				.from("lessons")
				.update(updateData)
				.eq("id", lessonId);

			if (updateError) {
				console.error("[Complete] Failed to update lesson:", updateError);
				return NextResponse.json(
					{ error: "Failed to update lesson" },
					{ status: 500 },
				);
			}
		}

		console.log(
			`[Complete] ✅ Lesson ${lessonId}: ${isPassing ? "PASSED" : "FAILED"} with ${score}%`,
		);

		return NextResponse.json({
			success: true,
			passed: isPassing,
			score,
			newBestScore: shouldUpdateScore,
		});
	} catch (error) {
		console.error("[Complete] ❌ Error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to complete lesson",
			},
			{ status: 500 },
		);
	}
}
