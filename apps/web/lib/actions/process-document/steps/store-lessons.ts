import type { createClient } from "@/lib/supabase/server";
import type { LessonData } from "./generate-lessons";

/**
 * Store generated lessons in the database with proper ordering
 */
export async function storeLessons(
	supabase: Awaited<ReturnType<typeof createClient>>,
	documentId: string,
	lessons: LessonData[],
): Promise<void> {
	console.log("[Store] Inserting lessons into database...");

	let prevLessonId: string | null = null;

	for (let i = 0; i < lessons.length; i++) {
		const lesson = lessons[i];
		if (!lesson) continue;

		const { data, error: lessonError } = await supabase
			.from("lessons")
			.insert({
				document_id: documentId,
				title: lesson.title,
				description: lesson.description,
				prev_lesson_id: prevLessonId,
				order_index: i,
			})
			.select("id")
			.single();

		if (lessonError || !data) {
			console.error(`[Store] Failed to insert lesson ${i}:`, lessonError);
			continue;
		}

		console.log(`[Store] Inserted lesson ${i + 1}: ${lesson.title}`);
		prevLessonId = data.id as string;
	}

	console.log(`[Store] Completed inserting ${lessons.length} lessons`);
}
