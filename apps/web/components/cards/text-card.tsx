"use client";

import { MarkdownContent } from "@/components/markdown-content";
import type { TextCardContent } from "@/lib/types";
import { Button } from "@workspace/ui/components/button";
import { ArrowRight, BookOpen } from "lucide-react";

interface TextCardProps {
	content: TextCardContent;
	onContinue: () => void;
}

export function TextCard({ content, onContinue }: TextCardProps) {
	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<div className="p-2 rounded-lg bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900/30 dark:to-sky-800/30">
					<BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
				</div>
				<h2 className="text-xl font-semibold text-slate-800 dark:text-white">
					{content.title}
				</h2>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto">
				<MarkdownContent content={content.body} />
			</div>

			{/* Continue button */}
			<div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
				<Button
					onClick={onContinue}
					className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg shadow-sky-500/25"
					size="lg"
				>
					Continue
					<ArrowRight className="w-4 h-4 ml-2" />
				</Button>
			</div>
		</div>
	);
}
