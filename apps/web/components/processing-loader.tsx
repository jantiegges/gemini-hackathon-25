"use client";

import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
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
		<div className="flex flex-col items-center justify-center min-h-svh px-4">
			{/* Animated background circles - using app's soft pastel blobs */}
			<div className="relative">
				{/* Outermost - soft purple */}
				<div className="absolute inset-0 flex items-center justify-center">
					<motion.div
						animate={{
							scale: [1, 1.2, 1],
							opacity: [0.3, 0.5, 0.3],
						}}
						transition={{
							duration: 3,
							repeat: Infinity,
							ease: "easeInOut",
						}}
						className="w-48 h-48 rounded-full bg-app-blob-purple/40 blur-sm"
					/>
				</div>
				{/* Middle - soft pink */}
				<div className="absolute inset-0 flex items-center justify-center">
					<motion.div
						animate={{
							scale: [1, 1.3, 1],
							opacity: [0.4, 0.2, 0.4],
						}}
						transition={{
							duration: 3,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 0.5,
						}}
						className="w-36 h-36 rounded-full bg-app-blob-pink/50"
					/>
				</div>
				{/* Inner - soft orange */}
				<div className="absolute inset-0 flex items-center justify-center">
					<motion.div
						animate={{
							scale: [1, 1.1, 1],
							opacity: [0.4, 0.2, 0.4],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 1,
						}}
						className="w-28 h-28 rounded-full bg-app-blob-orange/40 blur-sm"
					/>
				</div>

				{/* Icon container - using app's gradient colors */}
				<div className="relative z-10 flex items-center justify-center w-48 h-48">
					<motion.div
						className="p-5 rounded-2xl bg-gradient-to-br from-app-gradient-purple via-app-gradient-pink to-app-gradient-orange"
						whileHover={{ scale: 1.05 }}
					>
						<AnimatePresence mode="wait">
							<motion.div
								key={currentStep}
								initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
								animate={{ opacity: 1, scale: 1, rotate: 0 }}
								exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
								transition={{ duration: 0.3 }}
							>
								<CurrentIcon className="w-10 h-10 text-white" />
							</motion.div>
						</AnimatePresence>
					</motion.div>
				</div>
			</div>

			{/* Text content */}
			<div className="mt-10 text-center space-y-3 h-24">
				<AnimatePresence mode="wait">
					<motion.div
						key={currentStep}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3 }}
					>
						<h2 className="text-2xl font-bold text-slate-800 dark:text-white">
							{steps[currentStep].label}
						</h2>
						<p className="text-slate-500 dark:text-slate-400 mt-2">
							{steps[currentStep].description}
						</p>
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Progress dots - soft pastel colors */}
			<div className="flex gap-3 mt-8">
				{steps.map((step, index) => (
					<motion.div
						key={step.label}
						className={cn(
							"h-2.5 rounded-full",
							index === currentStep
								? "bg-gradient-to-r from-app-gradient-purple via-app-gradient-pink to-app-gradient-orange shadow-sm shadow-app-gradient-pink/40"
								: index < currentStep
									? "bg-app-blob-pink"
									: "bg-slate-200",
						)}
						animate={{
							width: index === currentStep ? 36 : 10,
						}}
						transition={{ duration: 0.3, ease: "easeOut" }}
					/>
				))}
			</div>

			{/* Subtle message */}
			<motion.p
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 2 }}
				className="mt-8 text-sm text-slate-400 dark:text-slate-500"
			>
				This usually takes about 30 seconds...
			</motion.p>
		</div>
	);
}
