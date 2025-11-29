"use client";

import { MarkdownContent } from "@/components/markdown-content";
import type { McQuestionCardContent } from "@/lib/types";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowRight, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { useState } from "react";

interface McQuestionCardProps {
	content: McQuestionCardContent;
	onAnswer: (isCorrect: boolean) => void;
}

export function McQuestionCard({ content, onAnswer }: McQuestionCardProps) {
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [hasAnswered, setHasAnswered] = useState(false);

	const isCorrect = selectedIndex === content.correct_index;

	const handleSelect = (index: number) => {
		if (hasAnswered) return;
		setSelectedIndex(index);
	};

	const handleSubmit = () => {
		if (selectedIndex === null) return;
		setHasAnswered(true);
	};

	const handleContinue = () => {
		onAnswer(isCorrect);
	};

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<div className="p-2 rounded-lg bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900/30 dark:to-violet-800/30">
					<HelpCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" />
				</div>
				<h2 className="text-lg font-medium text-slate-600 dark:text-slate-400">
					Question
				</h2>
			</div>

			{/* Question */}
			<div className="mb-6">
				<div className="text-xl font-semibold text-slate-800 dark:text-white [&_p]:mb-0">
					<MarkdownContent content={content.question} />
				</div>
			</div>

			{/* Options */}
			<div className="flex-1 space-y-3">
				{content.options.map((option, index) => {
					const isSelected = selectedIndex === index;
					const isCorrectOption = index === content.correct_index;

					let optionStyle = "";
					let icon = null;

					if (hasAnswered) {
						if (isCorrectOption) {
							optionStyle =
								"border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300";
							icon = (
								<CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
							);
						} else if (isSelected && !isCorrectOption) {
							optionStyle =
								"border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
							icon = <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
						} else {
							optionStyle =
								"border-slate-200 dark:border-slate-700 opacity-50";
						}
					} else {
						if (isSelected) {
							optionStyle =
								"border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500/20";
						} else {
							optionStyle =
								"border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50";
						}
					}

					return (
						<button
							key={index}
							onClick={() => handleSelect(index)}
							disabled={hasAnswered}
							className={cn(
								"w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3",
								optionStyle,
								!hasAnswered && "cursor-pointer",
								hasAnswered && "cursor-default",
							)}
						>
							{/* Option letter */}
							<span
								className={cn(
									"flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold",
									hasAnswered && isCorrectOption
										? "bg-emerald-500 text-white"
										: hasAnswered && isSelected && !isCorrectOption
											? "bg-red-500 text-white"
											: isSelected
												? "bg-violet-500 text-white"
												: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
								)}
							>
								{String.fromCharCode(65 + index)}
							</span>

							{/* Option text with markdown support */}
							<span className="flex-1 font-medium [&_p]:mb-0 [&_.katex]:text-base">
								<MarkdownContent content={option} />
							</span>

							{/* Icon for answered state */}
							{icon}
						</button>
					);
				})}
			</div>

			{/* Feedback */}
			{hasAnswered && (
				<div
					className={cn(
						"mt-6 p-4 rounded-xl",
						isCorrect
							? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
							: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800",
					)}
				>
					<div className="flex items-center gap-2 mb-2">
						{isCorrect ? (
							<>
								<CheckCircle2 className="w-5 h-5 text-emerald-500" />
								<span className="font-semibold text-emerald-700 dark:text-emerald-300">
									Correct!
								</span>
							</>
						) : (
							<>
								<XCircle className="w-5 h-5 text-red-500" />
								<span className="font-semibold text-red-700 dark:text-red-300">
									Not quite
								</span>
							</>
						)}
					</div>
					<div
						className={cn(
							"text-sm [&_p]:mb-0",
							isCorrect
								? "text-emerald-600 dark:text-emerald-400"
								: "text-red-600 dark:text-red-400",
						)}
					>
						<MarkdownContent content={content.explanation} />
					</div>
				</div>
			)}

			{/* Action button */}
			<div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
				{!hasAnswered ? (
					<Button
						onClick={handleSubmit}
						disabled={selectedIndex === null}
						className={cn(
							"w-full shadow-lg",
							selectedIndex !== null
								? "bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white shadow-violet-500/25"
								: "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed",
						)}
						size="lg"
					>
						Check Answer
					</Button>
				) : (
					<Button
						onClick={handleContinue}
						className={cn(
							"w-full shadow-lg",
							isCorrect
								? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/25"
								: "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-slate-500/25",
						)}
						size="lg"
					>
						Continue
						<ArrowRight className="w-4 h-4 ml-2" />
					</Button>
				)}
			</div>
		</div>
	);
}
