"use client";

import { cn } from "@workspace/ui/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { MarkdownContent } from "@/components/markdown-content";
import type { BlankOption, FillInBlankCardContent } from "@/lib/cards";
import type { ActionButtonConfig } from "./card-template";

interface FillInBlankCardProps {
	content: FillInBlankCardContent;
	onAnswer: (isCorrect: boolean) => void;
	setActionButton: (config: ActionButtonConfig | null) => void;
}

export function FillInBlankCard({
	content,
	onAnswer,
	setActionButton,
}: FillInBlankCardProps) {
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

	// Update action button based on state
	useEffect(() => {
		if (!hasSubmitted) {
			setActionButton({
				onClick: handleSubmit,
				text: "Check Answers",
				disabled: !allBlanksAnswered,
				className: cn(
					"w-full shadow-lg text-sm sm:text-base",
					allBlanksAnswered
						? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25"
						: "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed",
				),
				showArrow: false,
			});
		} else {
			setActionButton({
				onClick: handleContinue,
				text: "Continue",
				className: cn(
					"w-full shadow-lg text-sm sm:text-base",
					isCorrect
						? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/25"
						: "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-slate-500/25",
				),
				showArrow: true,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasSubmitted, allBlanksAnswered, isCorrect, setActionButton]);

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
			{/* Text with blanks */}
			<div className="flex-1 overflow-y-auto min-h-0">
				<div className="text-sm sm:text-base font-light leading-relaxed text-slate-900/95 dark:text-slate-100 [&_p]:mb-3 sm:[&_p]:mb-4">
					{renderTextWithBlanks()}
				</div>
			</div>

			{/* Feedback */}
			{hasSubmitted && (
				<div
					className={cn(
						"mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg sm:rounded-xl",
						isCorrect
							? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
							: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800",
					)}
				>
					<div className="flex items-center gap-2 mb-2">
						{isCorrect ? (
							<>
								<CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
								<span className="font-semibold text-sm sm:text-base text-emerald-800 dark:text-emerald-300">
									All correct!
								</span>
							</>
						) : (
							<>
								<XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
								<span className="font-semibold text-sm sm:text-base text-red-800 dark:text-red-300">
									Some answers are incorrect
								</span>
							</>
						)}
					</div>
					<div
						className={cn(
							"text-xs sm:text-sm font-light [&_p]:mb-0",
							isCorrect
								? "text-emerald-800/95 dark:text-emerald-300"
								: "text-red-800/95 dark:text-red-300",
						)}
					>
						<MarkdownContent content={content.explanation} />
					</div>
				</div>
			)}
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
					"min-w-[100px] sm:min-w-[120px] px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg border-2 text-xs sm:text-sm font-light transition-all min-h-[36px] sm:min-h-0",
					hasSubmitted
						? isCorrect
							? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-300"
							: "border-red-600 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-300"
						: selected
							? "border-amber-600 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-300 active:scale-95"
							: "border-dashed border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-400 hover:text-slate-900 active:scale-95",
				)}
			>
				<span className="truncate block max-w-[120px] sm:max-w-none">
					{selected || "Select..."}
				</span>
				{hasSubmitted && !isCorrect && (
					<span className="ml-1 sm:ml-2 text-xs text-red-500 whitespace-nowrap">
						→ {correctAnswer}
					</span>
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
					<div className="absolute z-20 top-full left-0 mt-1 min-w-[140px] sm:min-w-[150px] max-w-[200px] sm:max-w-none bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 max-h-[200px] sm:max-h-none overflow-y-auto">
						{options.map((option, idx) => (
							<button
								key={idx}
								onClick={() => {
									onSelect(option);
									setIsOpen(false);
								}}
								className={cn(
									"w-full px-3 py-2 sm:py-2.5 text-left text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors min-h-[40px] sm:min-h-0 text-slate-900 dark:text-slate-100",
									selected === option.text &&
										"bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-300",
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
