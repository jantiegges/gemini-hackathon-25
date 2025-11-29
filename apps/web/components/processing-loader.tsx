"use client";

import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const steps = [
	{
		label: "Reading your document",
		description: "Extracting content from PDF",
	},
	{
		label: "Understanding the material",
		description: "Analyzing key concepts",
	},
	{
		label: "Creating lessons",
		description: "Building your personalized path",
	},
	{
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

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
			{/* Animated background circles */}
			<div className="relative">
				<div className="absolute inset-0 flex items-center justify-center">
					<motion.div
						animate={{
							scale: [1, 1.2, 1],
							opacity: [0.2, 0.4, 0.2],
						}}
						transition={{
							duration: 3,
							repeat: Infinity,
							ease: "easeInOut",
						}}
						className="w-40 h-40 rounded-full bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20"
					/>
				</div>
				<div className="absolute inset-0 flex items-center justify-center">
					<motion.div
						animate={{
							scale: [1, 1.3, 1],
							opacity: [0.3, 0.1, 0.3],
						}}
						transition={{
							duration: 3,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 0.5,
						}}
						className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-400/30 to-fuchsia-400/30"
					/>
				</div>
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
						className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-400/40 to-fuchsia-400/40"
					/>
				</div>

				{/* Animated loader container */}
				<div className="relative z-10 flex items-center justify-center w-40 h-40">
					<motion.div
						className="p-5 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-xl shadow-violet-500/25"
						whileHover={{ scale: 1.05 }}
					>
						<div className="relative w-10 h-10">
							{/* Rotating outer ring */}
							<motion.div
								className="absolute inset-0 border-4 border-white/30 rounded-full border-t-white"
								animate={{ rotate: 360 }}
								transition={{
									duration: 1,
									repeat: Infinity,
									ease: "linear",
								}}
							/>
							{/* Rotating inner ring (counter-clockwise) */}
							<motion.div
								className="absolute inset-2 border-2 border-white/40 rounded-full border-b-white"
								animate={{ rotate: -360 }}
								transition={{
									duration: 1.5,
									repeat: Infinity,
									ease: "linear",
								}}
							/>
							{/* Pulsing center dot */}
							<motion.div
								className="absolute inset-0 flex items-center justify-center"
								animate={{
									scale: [1, 1.3, 1],
									opacity: [0.7, 1, 0.7],
								}}
								transition={{
									duration: 1.5,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							>
								<div className="w-3 h-3 rounded-full bg-white shadow-lg shadow-white/50" />
							</motion.div>
							{/* Orbiting particles */}
							<motion.div
								className="absolute inset-0"
								style={{ transformOrigin: "center" }}
								animate={{ rotate: 360 }}
								transition={{
									duration: 2,
									repeat: Infinity,
									ease: "linear",
								}}
							>
								{[0, 1, 2].map((i) => {
									const angle = i * 120 - 90; // Start at top, space evenly
									const radius = 14;
									const x = Math.cos((angle * Math.PI) / 180) * radius;
									const y = Math.sin((angle * Math.PI) / 180) * radius;
									return (
										<div
											key={`particle-${i}`}
											className="absolute w-1.5 h-1.5 rounded-full bg-white/90"
											style={{
												top: `calc(50% + ${y}px)`,
												left: `calc(50% + ${x}px)`,
												transform: "translate(-50%, -50%)",
											}}
										/>
									);
								})}
							</motion.div>
						</div>
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
							{steps[currentStep]?.label}
						</h2>
						<p className="text-slate-500 dark:text-slate-400 mt-2">
							{steps[currentStep]?.description}
						</p>
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Progress dots */}
			<div className="flex gap-2 mt-8">
				{steps.map((step, index) => (
					<motion.div
						key={step.label}
						className={cn(
							"h-2 rounded-full",
							index === currentStep
								? "bg-gradient-to-r from-violet-500 to-fuchsia-500"
								: "bg-slate-300 dark:bg-slate-600",
						)}
						animate={{
							width: index === currentStep ? 32 : 8,
							backgroundColor: index === currentStep ? "#8b5cf6" : "#cbd5e1", // fallback colors, actually using classNames
						}}
						transition={{ duration: 0.3 }}
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
