"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowRight, CheckCircle2, PenLine, XCircle } from "lucide-react";
import { useState } from "react";
import { MarkdownContent } from "@/components/markdown-content";
import type { BlankOption, FillInBlankCardContent } from "@/lib/cards";

interface FillInBlankCardProps {
	content: FillInBlankCardContent;
	onAnswer: (isCorrect: boolean) => void;
}

export function FillInBlankCard({ content, onAnswer }: FillInBlankCardProps) {
	const [selectedAnswers, setSelectedAnswers] = useState<
		Record<string, string>
	>({});
	const [hasSubmitted, setHasSubmitted] = useState(false);

	const blankIds = Object.keys(content.blanks);
	const allBlanksAnswered = blankIds.every((id) => selectedAnswers[id]);

	// Check if all answers are correct
	const checkAnswers = (): boolean => {
		return blankIds.every((blankId) => {
			const selected = selectedAnswers[blankId];
			const options = content.blanks[blankId];
			const correctOption = options?.find((opt) => opt.isCorrect);
			return selected === correctOption?.text;
		});
	};

	const isCorrect = hasSubmitted ? checkAnswers() : false;

	const handleSelect = (blankId: string, option: BlankOption) => {
		if (hasSubmitted) return;
		setSelectedAnswers((prev) => ({
			...prev,
			[blankId]: option.text,
		}));
	};

	const handleSubmit = () => {
		if (!allBlanksAnswered) return;
		setHasSubmitted(true);
	};

	const handleContinue = () => {
		onAnswer(isCorrect);
	};

	// Render the text with blanks replaced by dropdowns/selections
	const renderTextWithBlanks = () => {
		const parts: React.ReactNode[] = [];
		const remaining = content.text;
		let key = 0;

		const blankRegex = /\{\{(\w+)\}\}/g;
		let match;
		let lastIndex = 0;

		while ((match = blankRegex.exec(content.text)) !== null) {
			// Add text before the blank
			if (match.index > lastIndex) {
				const textBefore = remaining.slice(lastIndex, match.index);
				parts.push(
					<span key={key++} className="[&_p]:inline">
						<MarkdownContent content={textBefore} />
					</span>,
				);
			}

			const blankId = match[1];
			const options = content.blanks[blankId];
			const selected = selectedAnswers[blankId];
			const correctOption = options?.find((opt) => opt.isCorrect);
			const isBlankCorrect = selected === correctOption?.text;

			// Add the blank dropdown
			parts.push(
				<span key={key++} className="inline-block mx-1 align-middle">
					<BlankDropdown
						blankId={blankId}
						options={options || []}
						selected={selected}
						onSelect={(opt) => handleSelect(blankId, opt)}
						hasSubmitted={hasSubmitted}
						isCorrect={isBlankCorrect}
						correctAnswer={correctOption?.text}
					/>
				</span>,
			);

			lastIndex = match.index + match[0].length;
		}

		// Add remaining text
		if (lastIndex < content.text.length) {
			const textAfter = content.text.slice(lastIndex);
			parts.push(
				<span key={key++} className="[&_p]:inline">
					<MarkdownContent content={textAfter} />
				</span>,
			);
		}

		return parts;
	};

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
					<PenLine className="w-5 h-5 text-amber-600 dark:text-amber-400" />
				</div>
				<h2 className="text-lg font-medium text-slate-600 dark:text-slate-400">
					Fill in the Blanks
				</h2>
			</div>

			{/* Text with blanks */}
			<div className="flex-1">
				<div className="text-lg leading-relaxed text-slate-700 dark:text-slate-200">
					{renderTextWithBlanks()}
				</div>
			</div>

			{/* Feedback */}
			{hasSubmitted && (
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
									All correct!
								</span>
							</>
						) : (
							<>
								<XCircle className="w-5 h-5 text-red-500" />
								<span className="font-semibold text-red-700 dark:text-red-300">
									Some answers are incorrect
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
			<div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
				{!hasSubmitted ? (
					<Button
						onClick={handleSubmit}
						disabled={!allBlanksAnswered}
						className={cn(
							"w-full shadow-lg",
							allBlanksAnswered
								? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25"
								: "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed",
						)}
						size="lg"
					>
						Check Answers
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

// Dropdown component for each blank
function BlankDropdown({
	blankId,
	options,
	selected,
	onSelect,
	hasSubmitted,
	isCorrect,
	correctAnswer,
}: {
	blankId: string;
	options: BlankOption[];
	selected?: string;
	onSelect: (option: BlankOption) => void;
	hasSubmitted: boolean;
	isCorrect: boolean;
	correctAnswer?: string;
}) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="relative inline-block">
			<button
				onClick={() => !hasSubmitted && setIsOpen(!isOpen)}
				disabled={hasSubmitted}
				className={cn(
					"min-w-[120px] px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all",
					hasSubmitted
						? isCorrect
							? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
							: "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
						: selected
							? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
							: "border-dashed border-slate-300 dark:border-slate-600 text-slate-400 hover:border-slate-400",
				)}
			>
				{selected || "Select..."}
				{hasSubmitted && !isCorrect && (
					<span className="ml-2 text-xs text-red-500">→ {correctAnswer}</span>
				)}
			</button>

			{isOpen && !hasSubmitted && (
				<>
					{/* Backdrop */}
					<div
						className="fixed inset-0 z-10"
						onClick={() => setIsOpen(false)}
					/>
					{/* Dropdown */}
					<div className="absolute z-20 top-full left-0 mt-1 min-w-[150px] bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1">
						{options.map((option, idx) => (
							<button
								key={idx}
								onClick={() => {
									onSelect(option);
									setIsOpen(false);
								}}
								className={cn(
									"w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors",
									selected === option.text &&
										"bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
								)}
							>
								<MarkdownContent content={option.text} />
							</button>
						))}
					</div>
				</>
			)}
		</div>
	);
}
