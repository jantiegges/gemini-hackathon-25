"use client";

import { WordRotate } from "@workspace/ui/components/word-rotate";
import { useCallback, useState } from "react";
import type { Document } from "@/lib/types";
import { DocumentList } from "./document-list";
import { DocumentUpload } from "./document-upload";

interface DocumentsContainerProps {
	initialDocuments: Document[];
}

export function DocumentsContainer({
	initialDocuments,
}: DocumentsContainerProps) {
	const [documents, setDocuments] = useState<Document[]>(initialDocuments);

	const handleUploadComplete = useCallback((newDocument: Document) => {
		setDocuments((prev) => [newDocument, ...prev]);
	}, []);

	const handleDocumentDeleted = useCallback((id: string) => {
		setDocuments((prev) => prev.filter((doc) => doc.id !== id));
	}, []);

	return (
		<div className="min-h-screen bg-app-background text-slate-900 relative">
			{/* Fixed Background Gradient */}
			<div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
				{/* Mesh Gradient Blobs */}
				<div className="absolute top-[-15%] left-[-15%] w-[55vw] h-[55vw] bg-app-blob-pink rounded-full blur-[140px] opacity-60 mix-blend-multiply animate-blob" />
				<div className="absolute top-[-5%] right-[-10%] w-[45vw] h-[45vw] bg-app-blob-purple rounded-full blur-[130px] opacity-55 mix-blend-multiply animate-blob animation-delay-2000" />
				<div className="absolute bottom-[-25%] left-[10%] w-[70vw] h-[60vw] bg-app-blob-orange rounded-[45%] blur-[160px] opacity-60 mix-blend-multiply animate-blob animation-delay-4000" />
				<div className="absolute bottom-[5%] right-[5%] w-[45vw] h-[45vw] bg-app-blob-blue rounded-full blur-[140px] opacity-60 mix-blend-multiply" />
				<div className="absolute top-[25%] left-[40%] w-[35vw] h-[35vw] bg-app-blob-light-blue rounded-full blur-[120px] opacity-50 mix-blend-multiply" />
			</div>

			{/* Main Content */}
			<div className="relative z-10">
				{/* Hero Section */}
				<div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-4 pt-32 pb-40">
					<div className="w-full max-w-4xl mx-auto text-center space-y-10">
						{/* Header Text */}
						<div className="space-y-6">
							<div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/70 border border-white/80 shadow-sm text-xs font-normal text-slate-600/80 backdrop-blur-md mb-2">
								🍌 New: Auto-generated infographics with Nano Banana
							</div>

							<h1 className="text-5xl md:text-7xl font-light tracking-[-0.02em] text-slate-900/95">
								Turn documents into{" "}
								<span className="inline-block align-baseline">
									<WordRotate
										words={[
											"Lessons",
											"Learning Paths",
											"Interactive Drills",
											"Study Guides",
										]}
										duration={2800}
										className="text-transparent bg-clip-text bg-gradient-to-r from-app-gradient-purple via-app-gradient-pink to-app-gradient-orange"
										motionProps={{
											initial: { opacity: 0, y: 20 },
											animate: { opacity: 1, y: 0 },
											exit: { opacity: 0, y: -20 },
											transition: { duration: 0.3, ease: "easeOut" },
										}}
									/>
								</span>
							</h1>

							<p className="text-lg md:text-xl text-slate-600/90 font-light max-w-2xl mx-auto leading-relaxed">
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

				{/* Documents List Card Overlay */}
				<div className="w-full max-w-5xl mx-auto px-6 pb-20">
					<div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-xl shadow-app-blob-purple/25 border border-white/60 p-8">
						{/* Card Header */}
						<div className="flex items-center justify-between mb-8">
							<h2 className="text-2xl font-semibold text-slate-800/90">
								Your Lessons
							</h2>
							<div className="flex items-center gap-4">
								<button
									type="button"
									className="text-sm font-normal text-slate-500 hover:text-slate-800 transition-colors"
								>
									View all &gt;
								</button>
							</div>
						</div>

						{/* Filters */}
						<div className="flex items-center gap-4 mb-8 text-sm text-slate-500">
							<div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200/70 hover:border-app-blob-purple hover:shadow-sm transition-all cursor-text w-64">
								<span>🔍</span>
								<span>Search lessons...</span>
							</div>
							<button
								type="button"
								className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200/70 hover:border-app-blob-purple hover:shadow-sm transition-all"
							>
								Last edited ▾
							</button>
							<button
								type="button"
								className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200/70 hover:border-app-blob-purple hover:shadow-sm transition-all"
							>
								All types ▾
							</button>
						</div>

						<DocumentList
							documents={documents}
							onDocumentDeleted={handleDocumentDeleted}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
