import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimatedPageContent } from "@/components/animated-page-content";
import { LearningPath } from "@/components/learning-path";
import { ProcessingLoader } from "@/components/processing-loader";
import { createClient } from "@/lib/supabase/server";
import type { Lesson } from "@/lib/types";
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
		<div className="min-h-svh bg-white relative overflow-hidden">
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

			{/* Back Button - Top Left */}
			<Link
				href="/"
				className="fixed top-6 left-6 z-20 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
			>
				<ArrowLeft className="w-5 h-5" />
			</Link>

			<div className="relative max-w-4xl mx-auto px-6 py-8">
				<AnimatedPageContent>
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
							<div className="p-4 rounded-full bg-red-100 mb-6">
								<AlertCircle className="w-8 h-8 text-red-500" />
							</div>
							<h2 className="text-xl font-semibold text-slate-800 mb-2">
								Processing Failed
							</h2>
							<p className="text-slate-500 text-center max-w-md">
								We couldn&apos;t process your document. Please try uploading it
								again.
							</p>
							<Link
								href="/"
								className="mt-6 px-6 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
							>
								Try Again
							</Link>
						</div>
					) : (
						<LearningPath
							documentId={documentId}
							lessons={lessons}
							documentName={document.name}
						/>
					)}
				</AnimatedPageContent>
			</div>
		</div>
	);
}
