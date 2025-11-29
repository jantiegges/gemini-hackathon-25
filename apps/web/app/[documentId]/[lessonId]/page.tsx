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
		<div className="min-h-svh bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
			{/* Decorative background */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-violet-200/40 to-fuchsia-300/30 dark:from-violet-900/20 dark:to-fuchsia-800/10 blur-3xl" />
				<div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-sky-200/40 to-cyan-300/30 dark:from-sky-900/20 dark:to-cyan-800/10 blur-3xl" />
			</div>

			{/* Back button - fixed top left */}
			<Link
				href={`/${documentId}`}
				className="fixed top-6 left-6 z-50 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/40 dark:border-slate-700/40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/90 dark:hover:bg-slate-700/90 transition-all shadow-lg"
			>
				<ArrowLeft className="w-5 h-5" />
			</Link>

			<div className="relative max-w-4xl mx-auto px-6 py-8 min-h-svh flex flex-col">
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
