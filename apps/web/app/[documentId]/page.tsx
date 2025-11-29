import { AlertCircle, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimatedPageContent } from "@/components/animated-page-content";
import { LearningPath } from "@/components/learning-path";
import { ProcessingLoader } from "@/components/processing-loader";
import { createClient } from "@/lib/supabase/server";
import type { Document, Lesson } from "@/lib/types";
import { DocumentPageClient } from "./document-page-client";

export default async function DocumentPage({
	params,
}: {
	params: Promise<{ documentId: string }>;
}) {
	const { documentId } = await params;
	const supabase = await createClient();

	// Fetch document
	const { data: document, error: docError } = await supabase
		.from("documents")
		.select("*")
		.eq("id", documentId)
		.single();

	if (docError || !document) {
		notFound();
	}

	// Fetch lessons if completed
	let lessons: Lesson[] = [];
	if (document.status === "completed") {
		const { data: lessonsData } = await supabase
			.from("lessons")
			.select("*")
			.eq("document_id", documentId)
			.order("order_index", { ascending: true });

		lessons = (lessonsData as Lesson[]) ?? [];
	}

	return (
		<div className="min-h-svh bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
			{/* Decorative background */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-violet-200/40 to-fuchsia-300/30 dark:from-violet-900/20 dark:to-fuchsia-800/10 blur-3xl" />
				<div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-300/30 dark:from-emerald-900/20 dark:to-teal-800/10 blur-3xl" />
				<div className="absolute -bottom-40 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-amber-200/40 to-orange-300/30 dark:from-amber-900/20 dark:to-orange-800/10 blur-3xl" />
			</div>

			<div className="relative max-w-4xl mx-auto px-6 py-8">
				<AnimatedPageContent>
					{/* Back link */}
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-8"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to documents
					</Link>

					{/* Header */}
					<header className="text-center mb-12">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/25 dark:shadow-violet-500/10 mb-6">
							<BookOpen className="w-8 h-8 text-white" />
						</div>
						<h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
							{(document as Document).name}
						</h1>
						<p className="text-slate-500 dark:text-slate-400">
							{document.status === "completed"
								? `${lessons.length} lessons ready`
								: document.status === "processing"
									? "Creating your learning path..."
									: document.status === "failed"
										? "Something went wrong"
										: "Waiting to process..."}
						</p>
					</header>

					{/* Content based on status */}
					{document.status === "pending" || document.status === "processing" ? (
						<DocumentPageClient
							documentId={documentId}
							initialStatus={document.status}
						>
							<ProcessingLoader />
						</DocumentPageClient>
					) : document.status === "failed" ? (
						<div className="flex flex-col items-center justify-center py-16">
							<div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
								<AlertCircle className="w-8 h-8 text-red-500" />
							</div>
							<h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
								Processing Failed
							</h2>
							<p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
								We couldn't process your document. Please try uploading it
								again.
							</p>
							<Link
								href="/"
								className="mt-6 px-6 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:opacity-90 transition-opacity"
							>
								Try Again
							</Link>
						</div>
					) : (
						<LearningPath documentId={documentId} lessons={lessons} />
					)}
				</AnimatedPageContent>
			</div>
		</div>
	);
}
