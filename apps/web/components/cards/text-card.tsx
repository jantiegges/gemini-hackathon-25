"use client";

import { Button } from "@workspace/ui/components/button";
import { ArrowRight } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";
import type { TextCardContent } from "@/lib/types";

interface TextCardProps {
	content: TextCardContent;
	onContinue: () => void;
}

export function TextCard({ content, onContinue }: TextCardProps) {
	return (
		<div className="flex flex-col h-full">
			{/* Content */}
			<div className="flex-1 overflow-y-auto min-h-0">
				<div className="text-sm sm:text-base font-light leading-relaxed text-slate-600/90 dark:text-slate-200 [&_p]:mb-3 sm:[&_p]:mb-4">
					<MarkdownContent content={content.body} />
				</div>
			</div>

			{/* Continue button */}
			<div className="mt-auto pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
				<Button
					onClick={onContinue}
					className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg shadow-sky-500/25 text-sm sm:text-base"
					size="lg"
				>
					Continue
					<ArrowRight className="w-4 h-4 ml-2" />
				</Button>
			</div>
		</div>
	);
}
