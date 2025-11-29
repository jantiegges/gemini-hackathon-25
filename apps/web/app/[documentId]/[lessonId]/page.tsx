import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/lesson-player";
import { createClient } from "@/lib/supabase/server";
import type { Card, Lesson, RawCard } from "@/lib/types";
import { LessonPageClient } from "./lesson-page-client";

export default async function LessonPage({
	params,
}: {
	params: Promise<{ documentId: string; lessonId: string }>;
}) {
	const { documentId, lessonId } = await params;
	const supabase = await createClient();

	// Fetch lesson
	const { data: lesson, error: lessonError } = await supabase
		.from("lessons")
		.select("*")
		.eq("id", lessonId)
		.single();

	if (lessonError || !lesson) {
		notFound();
	}

	// Fetch cards if lesson is ready
	let cards: Card[] = [];
	if ((lesson as Lesson).status === "ready") {
		const { data: cardsData } = await supabase
			.from("cards")
			.select("*")
			.eq("lesson_id", lessonId)
			.order("order_index", { ascending: true });

		cards = ((cardsData as RawCard[]) ?? []).map((card) => ({
			...card,
			content: card.content,
		})) as Card[];
	}

	const typedLesson = lesson as Lesson;

	return (
		<div className="min-h-svh bg-app-background text-slate-900 relative">
			{/* Fixed Background Gradient */}
			<div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
				{/* Mesh Gradient Blobs */}
				<div className="absolute top-[-15%] left-[-15%] w-[55vw] h-[55vw] bg-app-blob-pink rounded-full blur-[140px] opacity-60 mix-blend-multiply animate-blob" />
				<div className="absolute top-[-5%] right-[-10%] w-[45vw] h-[45vw] bg-app-blob-purple rounded-full blur-[130px] opacity-55 mix-blend-multiply animate-blob animation-delay-2000" />
				<div className="absolute bottom-[-25%] left-[10%] w-[70vw] h-[60vw] bg-app-blob-orange rounded-[45%] blur-[160px] opacity-60 mix-blend-multiply animate-blob animation-delay-4000" />
				<div className="absolute bottom-[5%] right-[5%] w-[45vw] h-[45vw] bg-app-blob-blue rounded-full blur-[140px] opacity-60 mix-blend-multiply" />
				<div className="absolute top-[25%] left-[40%] w-[35vw] h-[35vw] bg-app-blob-light-blue rounded-full blur-[120px] opacity-50 mix-blend-multiply" />
			</div>

			{/* Back button - fixed top left */}
			<Link
				href={`/${documentId}`}
				className="fixed top-6 left-6 z-50 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-app-border-light/40 text-slate-600 hover:text-slate-900 hover:bg-white/90 transition-all shadow-lg"
			>
				<ArrowLeft className="w-5 h-5" />
			</Link>

			<div className="relative z-10 max-w-4xl mx-auto px-6 py-8 min-h-svh flex flex-col">
				{/* Main content */}
				<div className="flex-1">
					{typedLesson.status === "ready" && cards.length > 0 ? (
						<LessonPlayer
							documentId={documentId}
							lessonId={lessonId}
							lessonTitle={typedLesson.title}
							cards={cards}
						/>
					) : (
						<LessonPageClient
							lessonId={lessonId}
							lessonTitle={typedLesson.title}
							initialStatus={typedLesson.status}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
