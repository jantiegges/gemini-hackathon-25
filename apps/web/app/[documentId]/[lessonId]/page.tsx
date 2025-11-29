import { LessonPlayer } from "@/components/lesson-player";
import { createClient } from "@/lib/supabase/server";
import type { Card, Lesson, RawCard } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
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
		<div className="min-h-svh bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
			{/* Decorative background */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-violet-200/40 to-fuchsia-300/30 dark:from-violet-900/20 dark:to-fuchsia-800/10 blur-3xl" />
				<div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-sky-200/40 to-cyan-300/30 dark:from-sky-900/20 dark:to-cyan-800/10 blur-3xl" />
			</div>

			<div className="relative max-w-4xl mx-auto px-6 py-8 min-h-svh flex flex-col">
				{/* Back link */}
				<Link
					href={`/${documentId}`}
					className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to learning path
				</Link>

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
