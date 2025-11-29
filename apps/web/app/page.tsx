import { DocumentsContainer } from "@/components/documents-container";
import { createClient } from "@/lib/supabase/server";
import type { Document, Lesson } from "@/lib/types";

interface LessonWithImage {
	lesson: Lesson;
	documentId: string;
	imagePath: string | null;
}

export default async function Page() {
	const supabase = await createClient();

	const { data: documents } = await supabase
		.from("documents")
		.select("*")
		.order("created_at", { ascending: false });

	// Fetch all lessons from completed documents
	const completedDocuments =
		(documents as Document[])?.filter((doc) => doc.status === "completed") ??
		[];

	const lessonsWithImages: LessonWithImage[] = [];

	for (const doc of completedDocuments) {
		const { data: lessons } = await supabase
			.from("lessons")
			.select("*")
			.eq("document_id", doc.id)
			.order("order_index", { ascending: true });

		if (lessons) {
			for (const lesson of lessons as Lesson[]) {
				// Find the first infographic card for this lesson
				const { data: cards } = await supabase
					.from("cards")
					.select("content")
					.eq("lesson_id", lesson.id)
					.eq("type", "infographic")
					.order("order_index", { ascending: true })
					.limit(1);

				let imagePath: string | null = null;
				if (cards && cards.length > 0 && cards[0]?.content) {
					const content = cards[0].content as { imagePath?: string };
					imagePath = content.imagePath ?? null;
				}

				lessonsWithImages.push({
					lesson,
					documentId: doc.id,
					imagePath,
				});
			}
		}
	}

	return (
		<DocumentsContainer
			initialDocuments={(documents as Document[]) ?? []}
			initialLessons={lessonsWithImages}
		/>
	);
}
