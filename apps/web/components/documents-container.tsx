"use client";

import { WordRotate } from "@workspace/ui/components/word-rotate";
import { useCallback, useState } from "react";
import type { Document, Lesson } from "@/lib/types";
import { DocumentUpload } from "./document-upload";
import { LessonCardsScroll } from "./lesson-cards-scroll";

interface LessonWithImage {
	lesson: Lesson;
	documentId: string;
	imagePath: string | null;
}

interface DocumentsContainerProps {
	initialDocuments: Document[];
	initialLessons?: LessonWithImage[];
}

export function DocumentsContainer({
	initialDocuments,
	initialLessons = [],
}: DocumentsContainerProps) {
	const [lessons] = useState<LessonWithImage[]>(initialLessons);

	const handleUploadComplete = useCallback((_newDocument: Document) => {
		// Document upload handled by redirect
	}, []);

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
			<div className="relative z-10 flex-1 flex flex-col">
				{/* Hero Section */}
				<div className="flex flex-col items-center justify-center flex-shrink-0 w-full px-4 pt-16 pb-8">
					<div className="w-full max-w-4xl mx-auto text-center space-y-8">
						{/* Header Text */}
						<div className="space-y-4">
							<div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/70 border border-white/80 shadow-sm text-xs font-normal text-slate-600/80 backdrop-blur-md mb-2">
								🍌 New: Auto-generated infographics with Nano Banana
							</div>

							<h1 className="text-4xl md:text-6xl font-display font-semibold tracking-[-0.02em] text-slate-900/95 flex flex-col">
								<span>Turn documents into</span>
								<span className="block">
									<WordRotate
										words={[
											"Lessons",
											"Learning Paths",
											"Interactive Drills",
											"Study Guides",
										]}
										duration={2800}
										className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-rose-500 to-amber-500"
										motionProps={{
											initial: { opacity: 0, y: 20 },
											animate: { opacity: 1, y: 0 },
											exit: { opacity: 0, y: -20 },
											transition: { duration: 0.3, ease: "easeOut" },
										}}
									/>
								</span>
							</h1>

							<p className="text-base md:text-lg text-slate-600/90 font-light max-w-2xl mx-auto leading-relaxed">
								Upload any PDF and instantly generate Duolingo-style interactive
								courses.
							</p>
						</div>

						{/* Upload Container */}
						<div className="w-full max-w-2xl mx-auto">
							<DocumentUpload onUploadComplete={handleUploadComplete} />
						</div>
					</div>
				</div>

				{/* Lesson Cards Section - Full Width */}
				{lessons.length > 0 && (
					<div className="flex-1 flex flex-col justify-center w-full overflow-hidden">
						<div className="mb-6 px-6">
							<h2 className="text-2xl font-semibold text-slate-800/90">
								Your Lessons
							</h2>
						</div>
						<LessonCardsScroll lessons={lessons} />
					</div>
				)}
			</div>
		</div>
	);
}
