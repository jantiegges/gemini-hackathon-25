import { Suspense } from "react";
import { DocumentsContainer } from "@/components/documents-container";
import { createClient } from "@/lib/supabase/server";
import type { Document, Lesson } from "@/lib/types";

interface LessonWithImage {
	lesson: Lesson;
	documentId: string;
	imagePath: string | null;
}

async function HomePageContent() {
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

function HomePageLoading() {
	return (
		<div className="h-screen bg-white text-slate-900 relative overflow-hidden flex flex-col">
			{/* Subtle 4-color mesh gradient background */}
			<div className="fixed inset-0 pointer-events-none">
				{/* Base gradient */}
				<div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-white to-sky-50/80" />
				{/* Top-left: soft pink/rose */}
				<div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-rose-100/50 blur-3xl" />
				{/* Top-right: soft violet/purple */}
				<div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-violet-100/50 blur-3xl" />
				{/* Bottom-left: soft emerald/mint */}
				<div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full bg-emerald-100/40 blur-3xl" />
				{/* Bottom-right: soft amber/peach */}
				<div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-amber-100/50 blur-3xl" />
			</div>

			{/* Main Content */}
			<div className="relative z-10 flex-1 flex flex-col items-center justify-center">
				<div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
			</div>
		</div>
	);
}

export default function Page() {
	return (
		<Suspense fallback={<HomePageLoading />}>
			<HomePageContent />
		</Suspense>
	);
}
