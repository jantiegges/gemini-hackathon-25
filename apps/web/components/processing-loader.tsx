"use client";

import { cn } from "@workspace/ui/lib/utils";
import { BookOpen, Brain, FileText, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const steps = [
	{
		icon: FileText,
		label: "Reading your document",
		description: "Extracting content from PDF",
	},
	{
		icon: Brain,
		label: "Understanding the material",
		description: "Analyzing key concepts",
	},
	{
		icon: BookOpen,
		label: "Creating lessons",
		description: "Building your personalized path",
	},
	{
		icon: Sparkles,
		label: "Finishing touches",
		description: "Preparing your learning journey",
	},
];

export function ProcessingLoader() {
	const [currentStep, setCurrentStep] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentStep((prev) => (prev + 1) % steps.length);
		}, 3000);

		return () => clearInterval(interval);
	}, []);

	const CurrentIcon = steps[currentStep].icon;

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
			{/* Animated background circles */}
			<div className="relative">
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="w-40 h-40 rounded-full bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 animate-pulse" />
				</div>
				<div className="absolute inset-0 flex items-center justify-center">
					<div
						className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-400/30 to-fuchsia-400/30 animate-pulse"
						style={{ animationDelay: "150ms" }}
					/>
				</div>
				<div className="absolute inset-0 flex items-center justify-center">
					<div
						className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-400/40 to-fuchsia-400/40 animate-pulse"
						style={{ animationDelay: "300ms" }}
					/>
				</div>

				{/* Icon container */}
				<div className="relative z-10 flex items-center justify-center w-40 h-40">
					<div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-xl shadow-violet-500/25">
						<CurrentIcon className="w-10 h-10 text-white animate-bounce" />
					</div>
				</div>
			</div>

			{/* Text content */}
			<div className="mt-10 text-center space-y-3">
				<h2 className="text-2xl font-bold text-slate-800 dark:text-white">
					{steps[currentStep].label}
				</h2>
				<p className="text-slate-500 dark:text-slate-400">
					{steps[currentStep].description}
				</p>
			</div>

			{/* Progress dots */}
			<div className="flex gap-2 mt-8">
				{steps.map((_, index) => (
					<div
						key={index}
						className={cn(
							"w-2 h-2 rounded-full transition-all duration-300",
							index === currentStep
								? "w-8 bg-gradient-to-r from-violet-500 to-fuchsia-500"
								: "bg-slate-300 dark:bg-slate-600",
						)}
					/>
				))}
			</div>

			{/* Subtle message */}
			<p className="mt-8 text-sm text-slate-400 dark:text-slate-500">
				This usually takes about 30 seconds...
			</p>
		</div>
	);
}

