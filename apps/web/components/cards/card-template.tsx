"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export type TagColorScheme =
	| "purple"
	| "amber"
	| "primary"
	| "emerald"
	| "red"
	| "sky"
	| "violet"
	| "fuchsia";

interface ProgressProps {
	current: number;
	total: number;
}

interface CardTemplateProps {
	title: string;
	tag?: string;
	tagColor?: TagColorScheme;
	progress?: ProgressProps;
	onContinue?: () => void;
	continueButtonText?: string;
	continueButtonClassName?: string;
	children: ReactNode;
	className?: string;
}

const tagColorClasses: Record<TagColorScheme, string> = {
	purple: "text-purple-600 bg-purple-100/50 border-purple-200/50",
	amber: "text-amber-600 bg-amber-100/50 border-amber-200/50",
	primary: "text-primary-600 bg-primary-100/50 border-primary-200/50",
	emerald: "text-emerald-600 bg-emerald-100/50 border-emerald-200/50",
	red: "text-red-600 bg-red-100/50 border-red-200/50",
	sky: "text-sky-600 bg-sky-100/50 border-sky-200/50",
	violet: "text-violet-600 bg-violet-100/50 border-violet-200/50",
	fuchsia: "text-fuchsia-600 bg-fuchsia-100/50 border-fuchsia-200/50",
};

export function CardTemplate({
	title,
	tag,
	tagColor = "primary",
	progress,
	onContinue,
	continueButtonText = "Continue",
	continueButtonClassName,
	children,
	className,
}: CardTemplateProps) {
	return (
		<div
			className={cn(
				"flex flex-col w-full max-w-4xl mx-auto animate-fadeIn h-[80vh] bg-white/85 backdrop-blur-2xl rounded-2xl border border-white/60 p-8 md:p-12 shadow-xl shadow-app-blob-purple/25",
				className,
			)}
		>
			{/* Progress Bar */}
			{progress && (
				<div className="flex items-center gap-2 mb-4">
					{Array.from({ length: progress.total }).map((_, idx) => {
						const isActive = idx === progress.current - 1;
						const isCompleted = idx < progress.current - 1;

						return (
							<div
								key={`progress-${progress.current}-${idx}`}
								className={cn(
									"h-1 rounded-full transition-all duration-300",
									isActive
										? "w-8 bg-app-gradient-purple"
										: isCompleted
											? "w-4 bg-app-gradient-pink/60"
											: "w-4 bg-slate-200/50",
								)}
							/>
						);
					})}
					<div className="ml-auto text-xs font-normal text-slate-500 uppercase tracking-widest">
						Part {progress.current} of {progress.total}
					</div>
				</div>
			)}

			{/* Tag/Badge */}
			{tag && (
				<span
					className={cn(
						"inline-block px-3 py-1 mb-4 text-xs font-normal tracking-wider uppercase border rounded-full w-fit backdrop-blur-sm",
						tagColorClasses[tagColor],
					)}
				>
					{tag}
				</span>
			)}

			{/* Title */}
			<h1 className="text-2xl md:text-3xl font-semibold text-slate-800/90 mb-4">
				{title}
			</h1>

			{/* Content - Flexible children */}
			<div className="flex-1 flex flex-col min-h-full">{children}</div>

			{/* Continue Button */}
			{onContinue && (
				<div className="mt-auto pt-6 border-t border-slate-200/70">
					<Button
						onClick={onContinue}
						className={cn(
							"w-auto shadow-lg bg-gradient-to-r from-app-gradient-purple via-app-gradient-pink to-app-gradient-orange hover:from-app-gradient-purple/90 hover:via-app-gradient-pink/90 hover:to-app-gradient-orange/90 text-white shadow-app-blob-purple/25",
							continueButtonClassName,
						)}
						size="lg"
					>
						{continueButtonText}
						<ArrowRight className="w-4 h-4 ml-2" />
					</Button>
				</div>
			)}
		</div>
	);
}
