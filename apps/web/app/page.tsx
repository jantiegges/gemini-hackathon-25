import { DocumentsContainer } from "@/components/documents-container";
import { createClient } from "@/lib/supabase/server";
import type { Document, Lesson } from "@/lib/types";

interface LessonWithDocument {
	lesson: Lesson;
	documentId: string;
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

	const lessonsWithDocuments: LessonWithDocument[] = [];

	for (const doc of completedDocuments) {
		const { data: lessons } = await supabase
			.from("lessons")
			.select("*")
			.eq("document_id", doc.id)
			.order("order_index", { ascending: true });

		if (lessons) {
			for (const lesson of lessons as Lesson[]) {
				lessonsWithDocuments.push({
					lesson,
					documentId: doc.id,
				});
			}
		}
	}

	return (
		<DocumentsContainer
			initialDocuments={(documents as Document[]) ?? []}
			initialLessons={lessonsWithDocuments}
		/>
	);
}
